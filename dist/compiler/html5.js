"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const base_1 = require("./base");
class HTML5Compiler extends base_1.default {
    constructor(app, configs) {
        super(app, configs);
    }
    formatComander(commander) {
        const sp = commander.split(/\s+/g);
        return {
            commanderName: sp[0],
            commanderArguments: sp.slice(1),
        };
    }
    async compile(dictionary) {
        const installCommander = this.formatComander(this.configs.configs.installCommander);
        await this.exec(dictionary, installCommander.commanderName, installCommander.commanderArguments, 'development');
        if (this.configs.configs.dynamicArgumentsName && this.configs.configs.dynamicArgumentsData) {
            const filename = path.resolve(dictionary, this.configs.configs.dynamicArgumentsName);
            fs.writeFileSync(filename, JSON.stringify(this.configs.configs.dynamicArgumentsData), 'utf8');
        }
        const buildCommander = this.formatComander(this.configs.configs.buildCommander);
        await this.exec(dictionary, buildCommander.commanderName, buildCommander.commanderArguments, 'production');
        const dest = this.configs.configs.buildDistDictionary || 'dist';
        const destDictionary = path.resolve(dictionary, dest);
        if (!fs.existsSync(destDictionary)) {
            this.error('cannot find build dest dictionary when project built.');
            return;
        }
        return destDictionary;
    }
}
exports.default = HTML5Compiler;
