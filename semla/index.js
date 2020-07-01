require('@babel/register')
const { setAppBasedir } = require('./fw/appinfo')

const fw = require('./fw/fw.js')

setAppBasedir(__dirname)
fw.start()
