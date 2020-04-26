// const webpack = require('webpack')

const webpack = require('./webpack')

const config = require('./webpack.config')
const compier = webpack(config)
compier.run((error,stat)=>{
    console.log('done')
})