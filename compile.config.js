
const Compiler = require('./dist/index');
module.exports = {
  html5: {
    loader: Compiler.HTML5Compiler
  }
}