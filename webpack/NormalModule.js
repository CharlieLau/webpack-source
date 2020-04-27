const babylon = require('babylon')
const path = require('path')
const types = require('babel-types')
const generate = require('babel-generator').default;
const traverse = require('babel-traverse').default;
const template = require('babel-template');


module.exports = class NormalModule {
    constructor({
        name,
        context,
        request
    }) {
        this.name = name;
        this.context = context;
        this.request = request; //request就是模块的绝对路径
        this.dependencies = []; //这里放的是依赖的模块数组
        this.moduleId; //模块ID
        this._ast; //本模块的抽象语法树AST
        this._source; //源码
    }
    build(compilation) {
        const originalSource = compilation.inputFileSystem.readFileSync(this.request, 'utf8')
        const ast = babylon.parse(originalSource, {
            'sourceType': 'module'
        });
        let dependencies = []

        traverse(ast, {
            ImportDeclaration: (nodePath) => {
                let declare = nodePath.node.specifiers[0].local.name
                let moduleName = nodePath.node.source.value;
                let extname = moduleName.split(path.posix.sep).pop().indexOf('.') == -1 ? ".js" : ""; //.js
                //获取依赖模块./hello.js的绝对路径
                let dependencyRequest = path.posix.join(path.posix.dirname(this.request), moduleName + extname);
                //获取依赖模块的模块ID ./src/hello.js
                let dependencyModuleId = './' + path.posix.relative(this.context, dependencyRequest);

                const buildRequire = template(`var IMPORTNAME = __webpack_require__(SOURCE)`)
                const requireAST = buildRequire({
                    IMPORTNAME: types.identifier(declare),
                    SOURCE: types.stringLiteral(dependencyModuleId)
                })
                dependencies.push({
                    name: this.name,
                    context: this.context,
                    request: dependencyRequest
                })

                nodePath.replaceWith(requireAST)
            },
            CallExpression: (nodePath) => {
                if (nodePath.node.callee.name == 'require') {
                    let node = nodePath.node;
                    node.callee.name = '__webpack_require__';
                    let moduleName = node.arguments[0].value;

                    let extname = moduleName.split(path.posix.sep).pop().indexOf('.') == -1 ? ".js" : "";
                    console.log(moduleName, extname, path.posix.sep);
                    let dependencyRequest = path.posix.join(path.posix.dirname(this.request), moduleName + extname);
                    let dependencyModuleId = './' + path.posix.relative(this.context, dependencyRequest);
                    dependencies.push({
                        name: this.name,
                        context: this.context,
                        request: dependencyRequest
                    });
                    node.arguments = [types.stringLiteral(dependencyModuleId)];
                }
            },
            ExportDefaultDeclaration(nodePath) {
                let node = nodePath.node
                const buildRequire = template(`exports["default"] = TARGET`)
                const exportsAST = buildRequire({
                    TARGET: node.declaration // 替换节点后面的
                })
                nodePath.replaceWith(exportsAST)
            },
            ExportNamedDeclaration(nodePath) {
                let node = nodePath.node
                const buildRequire = template(`exports[NAME] = TARGET`)
                const exportsAST = buildRequire({
                    NAME: types.stringLiteral(node.declaration.declarations[0].id.name),
                    TARGET: node.declaration.declarations[0].init, // 替换节点后面的
                })
                nodePath.replaceWith(exportsAST)
            }
        })

        let {
            code
        } = generate(ast)
        this._ast = ast;
        this.moduleId = './' + path.posix.relative(this.context, this.request);
        this._source = code;
        compilation.modules.push(this);
        compilation._modules[this.request] = this;
        compilation.buildDependencies(this, dependencies);
        return this;
    }

}