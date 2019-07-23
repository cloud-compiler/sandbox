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
const path = require("path");
const nelts_1 = require("@nelts/nelts");
const sandbox = path.resolve(__dirname, './sandbox');
let CloudCompilerGateWay = class CloudCompilerGateWay extends nelts_1.Component.Agent {
    constructor(app) {
        super(app);
        this.compilers = {};
    }
    named(name) {
        return name.startsWith('compiler:') ? name : 'compiler:' + name;
    }
    health() {
        return {
            compilers: this.compilers
        };
    }
    project(data) {
        if (!this.compilers[data.name])
            throw new Error('cannot find the compiler name of ' + data.name);
        this.compilers[data.name].dictionary = data.dictionary;
    }
    async register(data) {
        data.id = this.named(data.id);
        if (!this.compilers[data.id]) {
            this.compilers[data.id] = {
                pid: 0,
                status: 0,
                body: data.body,
                socketPort: 0,
                dictionary: null
            };
            const pid = await this.messager.createAgent(data.id, sandbox, { task: data.body });
            const socketPort = await this.asyncSend('port', null, pid);
            this.compilers[data.id].pid = pid;
            this.compilers[data.id].socketPort = socketPort;
        }
        return this.compilers[data.id];
    }
    unRegister(id) {
        id = this.named(id);
        if (this.compilers[id]) {
            process.kill(this.compilers[id].pid);
            const value = this.compilers[id];
            delete this.compilers[id];
            return value;
        }
    }
    async compile(id) {
        id = this.named(id);
        if (this.compilers[id] && this.compilers[id].status === 0) {
            this.compilers[id].status = 1;
            await this.asyncSend('start', null, id);
            this.compilers[id].status = 2;
            return this.compilers[id];
        }
    }
};
__decorate([
    nelts_1.Decorator.Ipc,
    nelts_1.Decorator.Feedback,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CloudCompilerGateWay.prototype, "project", null);
__decorate([
    nelts_1.Decorator.Ipc,
    nelts_1.Decorator.Feedback,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudCompilerGateWay.prototype, "register", null);
__decorate([
    nelts_1.Decorator.Ipc,
    nelts_1.Decorator.Feedback,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CloudCompilerGateWay.prototype, "unRegister", null);
__decorate([
    nelts_1.Decorator.Ipc,
    nelts_1.Decorator.Feedback,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CloudCompilerGateWay.prototype, "compile", null);
CloudCompilerGateWay = __decorate([
    nelts_1.Decorator.Auto,
    __metadata("design:paramtypes", [nelts_1.AgentApplciation])
], CloudCompilerGateWay);
exports.default = CloudCompilerGateWay;
