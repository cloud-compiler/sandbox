import { Component, AgentApplciation } from '@nelts/nelts';
import * as IO from 'socket.io';
import { CompileDataType } from '../compiler/base';
export default class Sandbox<T extends CompileDataType> extends Component.Agent {
    io: IO.Server;
    private socketPort;
    private dictionary;
    private compiler;
    private dest;
    private plugins;
    constructor(app: AgentApplciation);
    catchError(err: Error): void;
    beforeCreate(): Promise<void>;
    created(): Promise<void>;
    ready(): void;
    beforeDestroy(): Promise<void>;
    port(): number;
    start(): void;
    stop(): number;
    compile(): Promise<void>;
}
