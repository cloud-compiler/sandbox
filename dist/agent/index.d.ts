import { Component, AgentApplciation } from '@nelts/nelts';
import { CompileDataType } from '../compiler/base';
declare type CompilerStatus = 0 | 1 | 2;
declare type Compilers = {
    [id: string]: {
        pid: number;
        status: CompilerStatus;
        body: CompileDataType;
        socketPort: number;
        dictionary: string;
    };
};
export default class CloudCompilerGateWay extends Component.Agent {
    private compilers;
    constructor(app: AgentApplciation);
    named(name: string): string;
    health(): {
        compilers: Compilers;
    };
    project(data: {
        name: string;
        dictionary: string;
    }): void;
    register(data: {
        id: string;
        body: CompileDataType;
    }): Promise<{
        pid: number;
        status: 0 | 2 | 1;
        body: CompileDataType;
        socketPort: number;
        dictionary: string;
    }>;
    unRegister(id: string): {
        pid: number;
        status: 0 | 2 | 1;
        body: CompileDataType;
        socketPort: number;
        dictionary: string;
    };
    compile(id: string): Promise<{
        pid: number;
        status: 0 | 2 | 1;
        body: CompileDataType;
        socketPort: number;
        dictionary: string;
    }>;
}
export {};
