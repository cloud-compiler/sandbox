"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const randomstring = require("randomstring");
const nelts_1 = require("@nelts/nelts");
const request = require("request");
const fse = require("fs-extra");
const unzip = require("unzip");
const ChildProcess = require("child_process");
class BaseCompiler extends nelts_1.AsyncEventEmitter {
    constructor(app, configs) {
        super();
        this._stacks = [];
        this._stackStatus = 0;
        this._logs = [];
        this._configs = configs;
        this.app = app;
    }
    get logs() {
        return this._logs;
    }
    info(message) {
        this._logs.push({
            type: 'info',
            message
        });
        this.io.emit('info', message);
        if (this.app.app.env === 'development')
            this.app.logger.info(message instanceof Buffer ? message.toString() : message);
        return this;
    }
    warn(message) {
        this._logs.push({
            type: 'warn',
            message
        });
        this.io.emit('warn', message);
        if (this.app.app.env === 'development')
            this.app.logger.warn(message instanceof Buffer ? message.toString() : message);
        return this;
    }
    error(message) {
        this._logs.push({
            type: 'error',
            message
        });
        this.io.emit('error', message);
        if (this.app.app.env === 'development')
            this.app.logger.error(message instanceof Buffer ? message.toString() : message);
        return this;
    }
    debug(message) {
        this._logs.push({
            type: 'debug',
            message
        });
        this.io.emit('debug', message);
        if (this.app.app.env === 'development')
            this.app.logger.debug(message instanceof Buffer ? message.toString() : message);
        return this;
    }
    log(message) {
        this._logs.push({
            type: 'log',
            message
        });
        this.io.emit('log', message);
        if (this.app.app.env === 'development')
            this.app.logger.log(message instanceof Buffer ? message.toString() : message);
        return this;
    }
    roll(message) {
        return this.warn('[rollbacking]: ' + message);
    }
    get io() {
        return this.app.io;
    }
    get configs() {
        return this._configs;
    }
    stash(fn) {
        this._stacks.push(fn);
        return this;
    }
    async rollback(e) {
        if (this._stackStatus !== 0)
            return;
        const stacks = this._stacks.slice(0);
        let i = stacks.length;
        while (i--)
            await stacks[i](e);
        this._stackStatus = 1;
    }
    async runtime(fn, stop) {
        try {
            const stash = this.stash.bind(this);
            await fn(stash);
        }
        catch (e) {
            this.app.logger.error(e);
            await this.rollback(e);
            if (stop)
                throw e;
        }
    }
    setDictionary(dictionary) {
        this.dictionary = dictionary;
        return this;
    }
    async getPackageFromRemote() {
        const name = randomstring.generate();
        const filename = path.resolve(this.dictionary, name + '.zip');
        this.stash(async () => {
            if (fs.existsSync(filename)) {
                this.roll('Removing zip file:' + filename);
                fs.unlinkSync(filename);
            }
        });
        this.info('Getting package zip file from remote address...');
        await new Promise((resolve, reject) => {
            request(this.configs.repo.url, { headers: this.configs.repo.headers })
                .on('error', reject)
                .on('end', resolve)
                .pipe(fs.createWriteStream(filename));
        });
        const dirname = path.resolve(this.dictionary, name);
        this.info('create a new dictionary for saving files.');
        fs.mkdirSync(dirname);
        this.stash(async () => {
            if (fs.existsSync(dirname)) {
                this.roll('Removing dictionary:' + dirname);
                fse.removeSync(dirname);
            }
        });
        this.info('unzip package file:' + filename);
        await new Promise((resolve, reject) => {
            fs.createReadStream(filename)
                .pipe(unzip.Extract({ path: dirname }))
                .on('error', reject)
                .on('close', resolve);
        });
        const dirs = fs.readdirSync(dirname);
        if (dirs.length !== 1)
            throw new Error('Unzip package catch error: cannot find the inner dictionary');
        const project = path.resolve(dirname, dirs[0]);
        const movedProject = path.resolve(this.dictionary, 'project_' + name);
        fse.moveSync(project, movedProject);
        fs.existsSync(dirname) && fse.removeSync(dirname);
        fs.existsSync(filename) && fs.unlinkSync(filename);
        this.info('project dictionary:' + movedProject);
        return movedProject;
    }
    exec(cwd, command, args, env = 'development') {
        return new Promise((resolve) => {
            const _env = Object.create(process.env);
            _env.NODE_ENV = env;
            const ls = ChildProcess.spawn(command, args, { cwd: cwd, env: _env });
            ls.stdout.on('data', (data) => this.info(data));
            ls.stderr.on('data', (data) => this.debug(data));
            ls.on('exit', resolve);
        });
    }
}
exports.default = BaseCompiler;
class CustomCompiler extends BaseCompiler {
    constructor(app, configs) {
        super(app, configs);
    }
    ;
}
exports.CustomCompiler = CustomCompiler;
