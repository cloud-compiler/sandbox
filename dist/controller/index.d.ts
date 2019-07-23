import { Component } from '@nelts/nelts';
import { LocalContext, LocalWorkerPlugin } from '../index';
export default class IndexController extends Component.Controller<LocalWorkerPlugin> {
    constructor(app: LocalWorkerPlugin);
    Home(ctx: LocalContext): Promise<void>;
    Register(ctx: LocalContext): Promise<void>;
    ShutDown(ctx: LocalContext): Promise<void>;
    Compile(ctx: LocalContext): Promise<void>;
}
