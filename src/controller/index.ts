import { Component, Decorator, Extra } from '@nelts/nelts';
import { LocalContext, LocalWorkerPlugin } from '../index';
import { CompileDataType } from '../compiler/base';
const Controller = Decorator.Controller;

@Controller.Prefix()
export default class IndexController extends Component.Controller<LocalWorkerPlugin> {
  constructor(app: LocalWorkerPlugin) {
    super(app);
  }

  @Controller.Get()
  async Home(ctx: LocalContext) {
    ctx.body = await ctx.asyncHealth();
  }

  @Controller.Put('/task/:id')
  @Controller.Request.Dynamic.Loader(Extra.Body({ isapi: true }))
  async Register(ctx: LocalContext) {
    const id = ctx.params.id;
    const body: CompileDataType = ctx.request.body;
    ctx.body = await ctx.asyncSend('register', { id, body }, 'CloudCompilerGateWay');
    ctx.status = 200;
  }

  @Controller.Delete('/task/:id')
  async ShutDown(ctx: LocalContext) {
    const id = ctx.params.id;
    ctx.body = await ctx.asyncSend('unRegister', id, 'CloudCompilerGateWay');
    ctx.status = 200;
  }

  @Controller.Post('/task/:id')
  async Compile(ctx: LocalContext) {
    const id = ctx.params.id;
    await ctx.asyncSend('compile', id, 'CloudCompilerGateWay');
    ctx.status = 200;
  }
}