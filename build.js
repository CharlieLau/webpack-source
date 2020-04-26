const   webpack = require('webpack')
const config = require('./webpack.config')

const compier=  webpack(config)
compier.run()