const MyPlugin =require('./plugins/myPlugin')

module.exports = {
    mode:'development',
    entry:'./src/index.js',
    output:{
        path:__dirname+'/dist'
    },
    devtool:'none',
    plugins:[
        new MyPlugin()
    ]
}