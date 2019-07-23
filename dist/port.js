"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const detectPort = require('detect-port');
function default_1(port) {
    return new Promise((resolve, reject) => {
        const args = [];
        port && args.push(port);
        args.push((err, port) => {
            if (err)
                return reject(err);
            resolve(port);
        });
        detectPort(...args);
    });
}
exports.default = default_1;
;
