## webpack 源码
目的研究webpack打包机制, webpack默认情况下同步会打包一个chunk，异步的时候通过jsonp打包多个包，下面详细介绍下

## 同步
```javascript
// index.js

const b = require('./b')
console.log(b)
```
```javascript 
// b.js
module.exports= 'hello world'
```
webpack.config.js
mode 设置为开发环境便于阅读
```javascript
module.exports={
    mode:'development',
    devtool:'none',
    entry:'./src/index.js',
    output:{
        filename:'main.js',
        path:__dirname+'/dist'
    }
}
```
接下来分析下打包之后的代码
```javascript

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

```
自执行函数 入参 key-value modules,函数内部 webpack默认实现了一套commonjs 解析规范 把 require 解析成 `__webpack_require__`

## 异步
```javascript
// index.js

document.createElement('button')

```

```javascript
// b.js

```