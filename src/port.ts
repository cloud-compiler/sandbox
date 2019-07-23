const detectPort = require('detect-port');
export default function(port?: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const args = [];
    port && args.push(port);
    args.push((err: Error, port: number) => {
      if (err) return reject(err);
      resolve(port);
    });
    detectPort(...args);
  });
};