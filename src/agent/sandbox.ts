import * as fs from 'fs';
import * as path from 'path';
import { Require } from '@nelts/nelts';
import { Component, AgentApplciation, Decorator } from '@nelts/nelts';
import * as IO from 'socket.io';
import Port from '../port';
import BaseCompiler, { CompileDataType, CustomCompiler } from '../compiler/base';
import HTML5 from '../compiler/html5';
import * as fse from 'fs-extra';
import * as Compose from 'koa-compose';

interface PluginLoader<T extends CompileDataType> {
  [name: string]: {
    loader: CustomCompiler<T> | string,
    plugins: (string | Compose.Middleware<CustomCompiler<T>>)[],
  }
}

export default class Sandbox<T extends CompileDataType> extends Component.Agent {
  public io: IO.Server;
  private socketPort: number;
  private dictionary: string;
  private compiler: CustomCompiler<T>;
  private dest: string;
  private plugins: (string | Compose.Middleware<CustomCompiler<T>>)[] = [];
  constructor(app: AgentApplciation) {
    super(app);
  }

  catchError(err: Error) {
    if (this.compiler) {
      this.compiler.error(err.stack);
    }
  }

  async beforeCreate() {
    this.socketPort = await Port();
    this.io = IO(this.socketPort);
    const task: T = this.app.inCommingMessage.task;
    switch (task.type) {
      case 'html5': this.compiler = new (<any>HTML5)(this, task); break;
      default:
        const loaderFile = path.resolve(process.cwd(), 'compile.config.js');
        if (!fs.existsSync(loaderFile)) throw new Error('no compile.config.js find');
        const loaderConfigs = Require<PluginLoader<T>>(loaderFile);
        if (!loaderConfigs[task.type]) throw new Error('non-compiler-loader find');
        const loader = typeof loaderConfigs[task.type].loader === 'string' 
          ? Require<CustomCompiler<T>>(<string>loaderConfigs[task.type].loader) 
          : loaderConfigs[task.type].loader as CustomCompiler<T>;
        if (!(loader instanceof BaseCompiler)) throw new Error('loader must instanceof BaseCompiler');
        this.compiler = new (<any>loader)(this, task);
        this.plugins = loaderConfigs[task.type].plugins || [];
    }
  }
  
  async created() {
    await this.compiler.runtime(async () => {
      this.compiler.setDictionary(this.app.configs.dictionary);
      this.dictionary = await this.compiler.getPackageFromRemote();
    }, true);
  }

  ready() {
    this.asyncSend('project', { 
      name: this.app.inCommingMessage.name, 
      dictionary: this.dictionary 
    }, 'CloudCompilerGateWay').catch(e => {
      this.logger.error(e);
      this.kill();
    });
  }

  async beforeDestroy() {
    if (fs.existsSync(this.dictionary)) {
      fse.removeSync(this.dictionary);
    }
    this.io.close();
  }

  @Decorator.Ipc
  @Decorator.Feedback
  port() {
    return this.socketPort;
  }
  
  @Decorator.Ipc
  @Decorator.Feedback
  start() {
    this.compile().then(() => {
      this.compiler.info('compile success!');
      return this.stop();
    }).catch(e => {
      this.compiler.error('compile catch error:\n' + e.stack);
      return this.stop();
    });
  }


  stop() {
    return this.send('unRegister', this.app.inCommingMessage.name, 'CloudCompilerGateWay');
  }

  async compile() {
    if (this.compiler && this.dictionary) {
      await this.compiler.runtime(async () => {
        if (this.compiler.compile) {
          this.dest = await this.compiler.compile(this.dictionary);
        }
        if (this.dest && this.plugins && this.plugins.length) {
          const fn = Compose(this.plugins.map((plu) => {
            if (typeof plu === 'string') return Require<Compose.Middleware<CustomCompiler<T>>>(plu);
            return plu;
          }));
          await fn(this.compiler);
        }
      });
    }
  }
}