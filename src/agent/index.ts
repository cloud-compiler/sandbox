import * as path from 'path';
import { Component, AgentApplciation, Decorator } from '@nelts/nelts';
import { CompileDataType } from '../compiler/base';
const sandbox = path.resolve(__dirname, './sandbox');

type CompilerStatus = 0 | 1 | 2;
type Compilers = {
  [id: string]: {
    pid: number,
    status: CompilerStatus,
    body: CompileDataType,
    socketPort: number,
    dictionary: string
  };
}

@Decorator.Auto
export default class CloudCompilerGateWay extends Component.Agent {
  private compilers: Compilers = {};
  constructor(app: AgentApplciation) {
    super(app);
  }

  named(name: string) {
    return name.startsWith('compiler:') ? name : 'compiler:' + name;
  }

  health() {
    return {
      compilers: this.compilers
    };
  }

  @Decorator.Ipc
  @Decorator.Feedback
  project(data: { name: string, dictionary: string }) {
    if (!this.compilers[data.name]) throw new Error('cannot find the compiler name of ' + data.name);
    this.compilers[data.name].dictionary = data.dictionary;
  }

  @Decorator.Ipc
  @Decorator.Feedback
  async register(data: { id: string, body: CompileDataType }) {
    data.id = this.named(data.id);
    if (!this.compilers[data.id]) {
      this.compilers[data.id] = {
        pid: 0,
        status: 0,
        body: data.body,
        socketPort: 0,
        dictionary: null
      }
      const pid = await this.messager.createAgent(data.id, sandbox, { task: data.body, killSelf: true }).catch(e => {
        delete this.compilers[data.id];
        return Promise.reject(e);
      });
      const socketPort = await this.asyncSend('port', null, pid);
      this.compilers[data.id].pid = pid;
      this.compilers[data.id].socketPort = socketPort;
    }
    return this.compilers[data.id];
  }

  @Decorator.Ipc
  @Decorator.Feedback
  unRegister(id: string) {
    id = this.named(id);
    if (this.compilers[id]) {
      process.kill(this.compilers[id].pid);
      const value = this.compilers[id];
      delete this.compilers[id];
      return value;
    }
  }

  @Decorator.Ipc
  @Decorator.Feedback
  async compile(id: string) {
    id = this.named(id);
    if (this.compilers[id] && this.compilers[id].status === 0) {
      this.compilers[id].status = 1;
      await this.asyncSend('start', null, id);
      this.compilers[id].status = 2;
      return this.compilers[id];
    }
  }
}