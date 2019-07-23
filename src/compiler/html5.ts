import * as fs from 'fs';
import * as path from 'path';
import BaseCompiler, { CompileDataType, CustomCompiler } from './base';
import Sandbox from '../agent/sandbox';

export interface HTML5CompileDataType extends CompileDataType {
  configs: {
    installCommander: string,
    buildCommander: string,
    buildDistDictionary?: string,
    dynamicArgumentsData?: any,
    dynamicArgumentsName?: string,
  }
}

export default class HTML5Compiler extends BaseCompiler<HTML5CompileDataType> implements CustomCompiler<HTML5CompileDataType> {
  constructor(app: Sandbox<HTML5CompileDataType>, configs: HTML5CompileDataType) {
    super(app, configs);
  }

  formatComander(commander: string) {
    const sp = commander.split(/\s+/g);
    return {
      commanderName: sp[0],
      commanderArguments: sp.slice(1),
    }
  }

  async compile(dictionary: string) {
    // 安装依赖
    const installCommander = this.formatComander(this.configs.configs.installCommander);
    await this.exec(dictionary, installCommander.commanderName, installCommander.commanderArguments, 'development');
    // 注入动态配置
    if (this.configs.configs.dynamicArgumentsName && this.configs.configs.dynamicArgumentsData) {
      const filename = path.resolve(dictionary, this.configs.configs.dynamicArgumentsName);
      fs.writeFileSync(filename, JSON.stringify(this.configs.configs.dynamicArgumentsData), 'utf8');
    }
    // 编译
    const buildCommander = this.formatComander(this.configs.configs.buildCommander);
    await this.exec(dictionary, buildCommander.commanderName, buildCommander.commanderArguments, 'production');
    // 获得编译后文件夹路径
    const dest = this.configs.configs.buildDistDictionary || 'dist';
    const destDictionary = path.resolve(dictionary, dest);
    if (!fs.existsSync(destDictionary)) {
      this.error('cannot find build dest dictionary when project built.');
      return;
    }
    return destDictionary;
  }
}