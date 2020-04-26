const EntryOptionPlugin = require('./plugins/EntryOptionPlugin')


module.exports = class WebpackOptionsApply {

    process(options, compiler) {
        compiler.hooks.afterPlugin.call(compiler)
        new EntryOptionPlugin().apply(compiler)
        compiler.hooks.entryOption.call(options.context, options.entry)
    }
}