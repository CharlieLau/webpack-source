const {
    SyncHook,
    AsyncSeriesHook,
    AsyncParallelHook,
    Tapable
} = require('tapable')


module.exports = class Compiler extends Tapable {

    constructor(context) {
        super()
        this.options = {}
        this.context = context
        this.hooks = {
            environment: new SyncHook([]),
            afterEnvironment: new SyncHook([]),
            afterPlugin: new SyncHook([]),
            entryOption: new SyncHook(['context','entry']),
            make: new AsyncParallelHook(['compilation'])
        }
    }
    run(callback) {

    }
}