const {
    SyncHook,
    AsyncSeriesHook,
    AsyncParallelHook,
    Tapable
} = require('tapable')
const Compilation = require('./Compilation')
const mkdirp = require('mkdirp')
const path = require('path')
const Stats = require('./Stats')

module.exports = class Compiler extends Tapable {

    constructor(context) {
        super()
        this.options = {}
        this.context = context
        this.hooks = {
            environment: new SyncHook([]),
            afterEnvironment: new SyncHook([]),
            afterPlugin: new SyncHook([]),
            entryOption: new SyncHook(['context', 'entry']),
            make: new AsyncParallelHook(['compilation']),
            beforeRun: new AsyncSeriesHook(['compiler']),
            run: new AsyncSeriesHook(['params']),
            beforeCompile: new AsyncSeriesHook(['params']),
            compile: new SyncHook(["params"]),
            thisCompilation: new SyncHook(["compilation", "params"]),
            compilation: new SyncHook(["compilation", "params"]),
            afterCompile: new AsyncSeriesHook(["params"]),
            emit: new AsyncSeriesHook(["compilation"]),
            done: new AsyncSeriesHook(["stats"])
        }
    }
    emitAssets(compilation, callback) {
        const emitFiles = err => {
            //是一个对象，对象上有属性的值 {文件名字，源码}
            let assets = compilation.assets;
            for (let file in assets) {
                let source = assets[file];
                let targetPath = path.posix.join(this.options.output.path, file);
                this.outputFileSystem.writeFileSync(targetPath, source);
            }
            callback();
        };
        this.hooks.emit.callAsync(compilation, (err) => {
            mkdirp(this.options.output.path).then(emitFiles)
        });
    }
    run(finallyCallback) {
        const onCompiled = (err, compilation) => {
            this.emitAssets(compilation, err => {
                const stats = new Stats(compilation);
                this.hooks.done.callAsync(stats, err => {
                    return finallyCallback();
                });
            });
        }

        this.hooks.beforeRun.callAsync(this, err => {
            this.hooks.run.callAsync({}, err => {
                this.compile(onCompiled);
            });
        })
    }
    newCompilation(params) {
        const compilation = new Compilation(this)
        this.hooks.thisCompilation.call(compilation, params)
        this.hooks.compilation.call(compilation, params)
        return compilation
    }

    compile(onCompiled) {
        this.hooks.beforeCompile.callAsync({}, err => {
            this.hooks.compile.call()
            const compilation = this.newCompilation();
            this.hooks.make.callAsync(compilation, err => {
                // seal 文件封装
                compilation.seal(err => {
                    this.hooks.afterCompile.callAsync(compilation, err => {
                        return onCompiled(null, compilation); //写入文件系统
                    });
                })
            })
        })
    }
}