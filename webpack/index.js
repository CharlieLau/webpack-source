const Compiler = require('./Compiler')
const NodeEnvironmentPlugin = require('./plugins/NodeEnvironmentPlugin')
const WebpackOptionsApply = require('./WebpackOptionsApply')

module.exports = function webpack(options) {
    options.context = options.context || process.cwd()
    let compiler = new Compiler(options.context)
    compiler.options = options;

    new NodeEnvironmentPlugin().apply(compiler)
    if (Array.isArray(options.plugins)) {
        options.plugins.forEach(plugin => plugin.apply(compiler))
    }

    compiler.hooks.environment.call()
    compiler.hooks.afterEnvironment.call()
    new WebpackOptionsApply().process(options, compiler)
    return compiler
}