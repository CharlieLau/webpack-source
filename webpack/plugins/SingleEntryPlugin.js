module.exports = class SingleEntryPlugin {

    constructor(context, entry, name) {
        this.context = context
        this.name = name
        this.entry = entry;

    }
    apply(compiler) {
        compiler.hooks.make.tapAsync('SingleEntryPlugin', (compilation, callbak) => {
            let {context,name,entry} = this
            compilation.addEntry(context,entry,name,callbak)
        })
    }
}