
(function(modules){

    var installedModules = {}

    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports
        }
        var module = {
            i: moduleId,
            l: false,
            module: {}
        }

        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)
        module.l = true;

        return module.exports
    }
    __webpack_require__('./src/index.js')

})({
    './src/index.js': (function (module, exports, __webpack_require__) {
        var b = __webpack_require__('./src/b.js');
        console.log(b)
    }),
    './src/b.js': (function (module, exports) {
        module.exports = 'hello world'
    })
})