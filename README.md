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
module.exports = 'hello world'
```
webpack.config.js
mode 设置为开发环境便于阅读
```javascript
module.exports={
    mode:'development',
    devtool:'none',
    entry:'./src/index.js',
    output:{
        // publicPath:'dist/',
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
            exports: {}
        }

        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)
        module.l = true;

        return module.exports
    }
    return __webpack_require__('./src/index.js')

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
const button = document.createElement('button')
button.innerText = '提交'

button.addEventListener('click', () => {
    import(/*webpackChunkName: "b" */'./b').then(res => {
        console.log(res)
    })
})

document.body.appendChild(button)

```

```javascript
// b.js
module.exports = 'hello world'
```

最终解析成两个


| Asset | Size | Chunks | Chunk Names|
|--- |--- |--- | --- | --- |
|b.js|425 bytes| b [emitted]| b|
|main.js|8.57 KiB | main [emitted]| main|
```javascript
//b.js
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([
  ["b"], {
    "./src/b.js":
      (function (module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        __webpack_exports__["default"] = ({
          b: 'hello world'
        });
      })
  }
]);
```

``` javascript
 // main.js
 (function (modules) {

    var installedModules = {}
    var installedChunks = {
        'main': 0
    }

    function webpackJsonpCallback(data) {
        const resolves = []
        const chunkIds = data[0]
        const moreModules = data[1];
        for (let i = 0; i < chunkIds.length; i++) {
            let chunkId = chunkIds[i]
            resolves.push(installedChunks[chunkId][0])
            installedChunks[chunkId] = 0;
        }

        for (let moduleId in moreModules) {
            modules[moduleId] = moreModules[moduleId];
        }
        if (parentJsonpFunction) parentJsonpFunction(data);
        while (resolves.length) {
            resolves.shift()();
        }
    }


    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports
        }
        var module = {
            i: moduleId,
            l: false,
            exports: {}
        }

        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__)
        module.l = true;

        return module.exports
    }

    function jsonpScriptSrc(chunkId) {
        return __webpack_require__.p + "" + chunkId + ".js"
    }
    __webpack_require__.p = "custom/"
    __webpack_require__.e = function requireEnsure(chunkId) {
        var promises = []
        var installChunkData = installedChunks[chunkId]

        if (installChunkData !== 0) {
            var promise = new Promise((resolve, reject) => {
                installChunkData = installedChunks[chunkId] = [resolve, reject]
            })
            installChunkData[2] = promise;
            promises.push(promise)
        }

        var script = document.createElement('script')
        script.src = jsonpScriptSrc(chunkId)
        document.head.appendChild(script)
        return Promise.all(promises)
    }
    __webpack_require__.r = function (exports) {
        // if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        //     Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        // }
        Object.defineProperty(exports, '__esModule', {
            value: true
        });
    };

    var jsonArray = window['webpackJsonp'] = (window['webpackJsonp'] || [])
    var parentJsonpFunction = jsonArray.push.bind(jsonArray)
    jsonArray.push = webpackJsonpCallback;

    return __webpack_require__('./src/index.js')
})({
    './src/index.js': (function (module, exports, __webpack_require__) {
        const button = document.createElement('button')
        button.innerText = '提交'

        button.addEventListener('click', () => {
            __webpack_require__.e("b")
                .then(__webpack_require__.bind(null, "./src/b.js"))
                .then(res => {
                    console.log(res)
                })
        })
        document.body.appendChild(button)

    })
})
```