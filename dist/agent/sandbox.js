"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const nelts_1 = require("@nelts/nelts");
const nelts_2 = require("@nelts/nelts");
const IO = require("socket.io");
const port_1 = require("../port");
const base_1 = require("../compiler/base");
const html5_1 = require("../compiler/html5");
const fse = require("fs-extra");
const Compose = require("koa-compose");
class Sandbox extends nelts_2.Component.Agent {
    constructor(app) {
        super(app);
        this.plugins = [];
    }
    catchError(err) {
        if (this.compiler) {
            this.compiler.error(err.stack);
        }
    }
    async beforeCreate() {
        this.socketPort = await port_1.default();
        this.io = IO(this.socketPort);
        const task = this.app.inCommingMessage.task;
        switch (task.type) {
            case 'html5':
                this.compiler = new html5_1.default(this, task);
                break;
            default:
                const loaderFile = path.resolve(process.cwd(), 'compile.config.js');
                if (!fs.existsSync(loaderFile))
                    throw new Error('no compile.config.js find');
                const _loaderConfigs = nelts_1.Require(loaderFile);
                const loaderConfigs = typeof _loaderConfigs === 'function' ? await _loaderConfigs(this) : _loaderConfigs;
                if (!loaderConfigs[task.type])
                    throw new Error('non-compiler-loader find');
                const loader = typeof loaderConfigs[task.type].loader === 'string'
                    ? nelts_1.Require(loaderConfigs[task.type].loader)
                    : loaderConfigs[task.type].loader;
                if (!(loader instanceof base_1.default))
                    throw new Error('loader must instanceof BaseCompiler');
                this.compiler = new loader(this, task);
                this.plugins = loaderConfigs[task.type].plugins || [];
        }
    }
    async created() {
        await this.compiler.runtime(async () => {
            this.compiler.setDictionary(this.app.configs.dictionary);
            this.dictionary = await this.compiler.getPackageFromRemote();
        }, true);
    }
    ready() {
        this.asyncSend('project', {
            name: this.app.inCommingMessage.name,
            dictionary: this.dictionary
        }, 'CloudCompilerGateWay').catch(e => {
            this.logger.error(e);
            this.kill();
        });
    }
    async beforeDestroy() {
        if (fs.existsSync(this.dictionary)) {
            fse.removeSync(this.dictionary);
        }
        this.io.close();
    }
    port() {
        return this.socketPort;
    }
    start() {
        this.compile().then(() => {
            this.compiler.info('compile success!');
            return this.stop();
        }).catch(e => {
            this.compiler.error('compile catch error:\n' + e.stack);
            return this.stop();
        });
    }
    stop() {
        return this.send('unRegister', this.app.inCommingMessage.name, 'CloudCompilerGateWay');
    }
    async compile() {
        if (this.compiler && this.dictionary) {
            await this.compiler.runtime(async () => {
                if (this.compiler.compile) {
                    this.dest = await this.compiler.compile(this.dictionary);
                }
                if (this.dest && this.plugins && this.plugins.length) {
                    const fn = Compose(this.plugins.map((plu) => {
                        if (typeof plu === 'string')
                            return nelts_1.Require(plu);
                        return plu;
                    }));
                    await fn(this.compiler);
                }
            });
        }
    }
}
__decorate([
    nelts_2.Decorator.Ipc,
    nelts_2.Decorator.Feedback,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Sandbox.prototype, "port", null);
__decorate([
    nelts_2.Decorator.Ipc,
    nelts_2.Decorator.Feedback,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Sandbox.prototype, "start", null);
exports.default = Sandbox;
