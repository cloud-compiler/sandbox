import BaseCompiler, { CompileDataType, CustomCompiler } from './base';
import Sandbox from '../agent/sandbox';
export interface HTML5CompileDataType extends CompileDataType {
    configs: {
        installCommander: string;
        buildCommander: string;
        buildDistDictionary?: string;
        dynamicArgumentsData?: any;
        dynamicArgumentsName?: string;
    };
}
export default class HTML5Compiler extends BaseCompiler<HTML5CompileDataType> implements CustomCompiler<HTML5CompileDataType> {
    constructor(app: Sandbox<HTML5CompileDataType>, configs: HTML5CompileDataType);
    formatComander(commander: string): {
        commanderName: string;
        commanderArguments: string[];
    };
    compile(dictionary: string): Promise<string>;
}
