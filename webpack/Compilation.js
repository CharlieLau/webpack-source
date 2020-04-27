const {
    Tapable,
    SyncHook
} = require('tapable')
const Chunk = require('./Chunk')
const path = require("path")
const fs = require("fs")
const ejs = require('ejs')
const normalModuleFactory = require('./normalModuleFactory')
const mainTemplate = fs.readFileSync(path.posix.join(__dirname, 'main.ejs'), 'utf8');
let mainRender = ejs.compile(mainTemplate);
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
            addEntry: new SyncHook(['entry', 'name']),
            seal: new SyncHook([]),
            beforeChunks: new SyncHook([]),
            afterChunks: new SyncHook([])
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
    buildDependencies(module, dependencies) {
        module.dependencies = dependencies.map(data => {
            let childModule = normalModuleFactory.create(data);
            return childModule.build(this);
        });
    }
    seal(callback) {
        this.hooks.seal.call()
        this.hooks.beforeChunks.call()
        for (let entryModule of this.entries) {
            let chunk = new Chunk(entryModule);
            this.chunks.push(chunk);
            chunk.modules = this.modules.filter(module => module.name == chunk.name);
        }
        this.hooks.afterChunks.call();

        this.createChunkAssets()

        callback()
    }
    createChunkAssets() {
        for (let i = 0; i < this.chunks.length; i++) {
            const chunk = this.chunks[i];
            chunk.files = [];
            const file = chunk.name + '.js'; //main.js
            let source = mainRender({
                entryId: chunk.entryModule.moduleId, //此代码块的入口模块ID 
                modules: chunk.modules
            });
            chunk.files.push(file);
            this.emitAsset(file, source);
        }
    }
    emitAsset(file, source) {
        this.assets[file] = source;
        this.files.push(file);
    }
}