import { Context, WorkerPlugin } from '@nelts/nelts';
import BaseCompiler, { CompileDataType, CustomCompiler } from './compiler/base';
import HTML5Compiler, { HTML5CompileDataType } from './compiler/html5';
import SandBox from './agent/sandbox';
export interface LocalWorkerPlugin extends WorkerPlugin {};
export interface LocalContext extends Context<LocalWorkerPlugin> {};
export {
  BaseCompiler,
  SandBox,
  CompileDataType,
  CustomCompiler,
  HTML5Compiler,
  HTML5CompileDataType,
}