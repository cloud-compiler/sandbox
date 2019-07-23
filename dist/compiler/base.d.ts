/// <reference types="node" />
/// <reference types="socket.io" />
import SandBox from '../agent/sandbox';
import { AsyncEventEmitter } from '@nelts/nelts';
declare type StackCallback = (e: Error) => Promise<any>;
declare type LogType = 'info' | 'warn' | 'error' | 'debug' | 'log';
export interface CompileDataType {
    type: string;
    configs?: any;
    repo: {
        url: string;
        headers?: {
            'Private-Token'?: string;
            [name: string]: string;
        };
    };
}
export default class BaseCompiler<T extends CompileDataType> extends AsyncEventEmitter {
    private _configs;
    private _stacks;
    private _stackStatus;
    private _logs;
    readonly app: SandBox<T>;
    dictionary: string;
    constructor(app: SandBox<T>, configs: T);
    readonly logs: {
        type: LogType;
        message: string | Buffer;
    }[];
    info(message: string | Buffer): this;
    warn(message: string | Buffer): this;
    error(message: string | Buffer): this;
    debug(message: string | Buffer): this;
    log(message: string | Buffer): this;
    roll(message: string | Buffer): this;
    readonly io: import("socket.io").Server;
    readonly configs: T;
    stash(fn: StackCallback): this;
    rollback(e: Error): Promise<void>;
    runtime(fn: (stash: (fn: StackCallback) => any) => Promise<any>, stop?: boolean): Promise<void>;
    setDictionary(dictionary: string): this;
    getPackageFromRemote(): Promise<string>;
    exec(cwd: string, command: string, args: string[], env?: string): Promise<unknown>;
}
export declare class CustomCompiler<T extends CompileDataType> extends BaseCompiler<T> {
    constructor(app: SandBox<T>, configs: T);
    compile?(dictionary: string): Promise<string>;
}
export {};
