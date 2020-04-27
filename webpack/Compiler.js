const {
    SyncHook,
    AsyncSeriesHook,
    AsyncParallelHook,
    Tapable
} = require('tapable')
const  Compilation=  require('./Compilation')


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
    run(callback) {
        const onCompiled = (err, compilation) => {
            console.log('TODO: 处理编译完成后 文件生成')
            callback()
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
                onCompiled(null, compilation)
            })
        })
    }
}