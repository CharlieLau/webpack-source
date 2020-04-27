const {
    Tapable,
    SyncHook
} = require('tapable')

const path = require("path")
const normalModuleFactory = require('./normalModuleFactory')

module.exports = class Compilation extends Tapable {

    constructor(compiler) {
        super()

        this.compiler = compiler;
        this.options = compiler.options
        this.context = compiler.context;
        this.inputFileSystem = compiler.inputFileSystem
        this.outputFileSystem = compiler.outputFileSystem
        this.entries = [] //所有的入口模块
        this.hooks = {
            addEntry: new SyncHook(['entry', 'name'])
        }
        this.modules = [] // 模块数组
        this._modules = {} // key 模块绝对路径 
        this.chunks = [] // 代码块
        this.files = [] // 文件组
        this.assets = {} // 资源对象
    }

    addEntry(context, entry, name, finallyCallback) {
        this.hooks.addEntry.call(context, entry, name)
        this._addMoudleChain(context, entry, name)
        finallyCallback()
    }
    _addMoudleChain(context, entry, name) {
        let module = normalModuleFactory.create({
            name,
            context: context,
            request: path.posix.join(context, entry)
        })

        module.build(this)

        this.entries.push(module)
    }
    buildDependencies(module,dependencies) {
        module.dependencies = dependencies.map(data => {
            let childModule = normalModuleFactory.create(data);
            return childModule.build(this);
        });
    }
}