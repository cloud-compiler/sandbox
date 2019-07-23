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
const nelts_1 = require("@nelts/nelts");
const Controller = nelts_1.Decorator.Controller;
let IndexController = class IndexController extends nelts_1.Component.Controller {
    constructor(app) {
        super(app);
    }
    async Home(ctx) {
        ctx.body = await ctx.asyncHealth();
    }
    async Register(ctx) {
        const id = ctx.params.id;
        const body = ctx.request.body;
        ctx.body = await ctx.asyncSend('register', { id, body }, 'CloudCompilerGateWay');
        ctx.status = 200;
    }
    async ShutDown(ctx) {
        const id = ctx.params.id;
        ctx.body = await ctx.asyncSend('unRegister', id, 'CloudCompilerGateWay');
        ctx.status = 200;
    }
    async Compile(ctx) {
        const id = ctx.params.id;
        await ctx.asyncSend('compile', id, 'CloudCompilerGateWay');
        ctx.status = 200;
    }
};
__decorate([
    Controller.Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IndexController.prototype, "Home", null);
__decorate([
    Controller.Put('/task/:id/register'),
    Controller.Request.Dynamic.Loader(nelts_1.Extra.Body({ isapi: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IndexController.prototype, "Register", null);
__decorate([
    Controller.Delete('/task/:id/teardown'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IndexController.prototype, "ShutDown", null);
__decorate([
    Controller.Post('/task/:id/compile'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IndexController.prototype, "Compile", null);
IndexController = __decorate([
    Controller.Prefix(),
    __metadata("design:paramtypes", [Object])
], IndexController);
exports.default = IndexController;
