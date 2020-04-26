const  fs = require('fs')
module.exports = class NodeEnvironmentPlugin {

    apply(compiler) {
        compiler.inputFileSystem = fs;
        compiler.outputFileSystem = fs;
    }
    
}