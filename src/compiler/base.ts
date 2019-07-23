import * as fs from 'fs';
import * as path from 'path';
import SandBox from '../agent/sandbox';
import * as randomstring from 'randomstring';
import { AsyncEventEmitter } from '@nelts/nelts';
import * as request from 'request';
import * as fse from 'fs-extra';
import * as unzip from 'unzip';
import * as ChildProcess from  'child_process';

type StackCallback = (e: Error) => Promise<any>;
type StackStatus = 0 | 1 | 2;
type LogType = 'info' | 'warn' | 'error' | 'debug' | 'log';

export interface CompileDataType {
  type: string,
  configs?: any,
  repo: {
    url: string,
    headers?: {
      'Private-Token'?: string,
      [name: string]: string
    }
  }
}

export default class BaseCompiler<T extends CompileDataType> extends AsyncEventEmitter {
  private _configs: T;
  private _stacks: StackCallback[] = [];
  private _stackStatus: StackStatus = 0;
  private _logs: {type: LogType, message: string | Buffer}[] = [];
  public readonly app: SandBox<T>;
  public dictionary: string;
  constructor(app: SandBox<T>, configs: T) {
    super();
    this._configs = configs;
    this.app = app;
  }

  get logs() {
    return this._logs;
  }

  info(message: string | Buffer) {
    this._logs.push({
      type: 'info',
      message
    });
    this.io.emit('info', message);
    if (this.app.app.env === 'development') this.app.logger.info(message instanceof Buffer ? message.toString() : message);
    return this;
  }

  warn(message: string | Buffer) {
    this._logs.push({
      type: 'warn',
      message
    });
    this.io.emit('warn', message);
    if (this.app.app.env === 'development') this.app.logger.warn(message instanceof Buffer ? message.toString() : message);
    return this;
  }

  error(message: string | Buffer) {
    this._logs.push({
      type: 'error',
      message
    });
    this.io.emit('error', message);
    if (this.app.app.env === 'development') this.app.logger.error(message instanceof Buffer ? message.toString() : message);
    return this;
  }

  debug(message: string | Buffer) {
    this._logs.push({
      type: 'debug',
      message
    });
    this.io.emit('debug', message);
    if (this.app.app.env === 'development') this.app.logger.debug(message instanceof Buffer ? message.toString() : message);
    return this;
  }

  log(message: string | Buffer) {
    this._logs.push({
      type: 'log',
      message
    });
    this.io.emit('log', message);
    if (this.app.app.env === 'development') this.app.logger.log(message instanceof Buffer ? message.toString() : message);
    return this;
  }

  roll(message: string | Buffer) {
    return this.warn('[rollbacking]: ' + message);
  }

  get io() {
    return this.app.io;
  }

  get configs() {
    return this._configs;
  }

  stash(fn: StackCallback) {
    this._stacks.push(fn);
    return this;
  }

  async rollback(e: Error) {
    if (this._stackStatus !== 0) return;
    const stacks = this._stacks.slice(0);
    let i = stacks.length;
    while (i--) await stacks[i](e);
    this._stackStatus = 1;
  }

  async runtime(fn: (stash: (fn: StackCallback) => any) => Promise<any>, stop?: boolean) {
    try{
      const stash = this.stash.bind(this);
      await fn(stash);
    }catch(e) {
      this.app.logger.error(e);
      await this.rollback(e);
      if (stop) throw e;
    }
  }

  setDictionary(dictionary: string) {
    this.dictionary = dictionary;
    return this;
  }

  async getPackageFromRemote() {
    const name = randomstring.generate();
    const filename = path.resolve(this.dictionary, name + '.zip');
    this.stash(async () => {
      if (fs.existsSync(filename)) {
        this.roll('Removing zip file:' + filename);
        fs.unlinkSync(filename);
      }
    });
    this.info('Getting package zip file from remote address...');
    await new Promise((resolve, reject) => {
      request(this.configs.repo.url, { headers: this.configs.repo.headers })
      .on('error', reject)
      .on('end', resolve)
      .pipe(fs.createWriteStream(filename));
    });
    const dirname = path.resolve(this.dictionary, name);
    this.info('create a new dictionary for saving files.');
    fs.mkdirSync(dirname);
    this.stash(async () => {
      if (fs.existsSync(dirname)) {
        this.roll('Removing dictionary:' + dirname);
        fse.removeSync(dirname);
      }
    });
    this.info('unzip package file:' + filename);
    await new Promise((resolve, reject) => {
      fs.createReadStream(filename)
      .pipe(unzip.Extract({ path: dirname }))
      .on('error', reject)
      .on('close', resolve);
    });
    const dirs = fs.readdirSync(dirname);
    if (dirs.length !== 1) throw new Error('Unzip package catch error: cannot find the inner dictionary');
    const project = path.resolve(dirname, dirs[0]);
    const movedProject = path.resolve(this.dictionary, 'project_' + name);
    fse.moveSync(project, movedProject);
    fs.existsSync(dirname) && fse.removeSync(dirname);
    fs.existsSync(filename) && fs.unlinkSync(filename);
    this.info('project dictionary:' + movedProject);
    return movedProject;
  }

  exec(cwd: string, command: string, args: string[], env:string = 'development') {
    return new Promise((resolve) => {
      const _env = Object.create(process.env);
      _env.NODE_ENV = env;
      const ls = ChildProcess.spawn(command, args, { cwd: cwd, env: _env });
      ls.stdout.on('data', (data: any) => this.info(data));
      ls.stderr.on('data', (data: any) => this.debug(data));
      ls.on('exit', resolve);
    });
  }

}

export class CustomCompiler<T extends CompileDataType> extends BaseCompiler<T> {
  constructor(app: SandBox<T>, configs: T) {
    super(app, configs);
  };
  compile?(dictionary: string): Promise<string>;
}