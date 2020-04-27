const SingleEntryPlugin = require('./SingleEntryPlugin')


module.exports = class EntryOptionPlugin {
    apply(compiler) {
        compiler.hooks.entryOption.tap('EntryOptionPlugin', (context, entry) => {
            if (typeof entry === 'string') {
                new SingleEntryPlugin(context, entry, 'main').apply(compiler)
            }else {
                for (let entryName in entry) {
                    new SingleEntryPlugin(context, entry[entryName], entryName).apply(compiler);
                }
            }
           
        })
    }
}