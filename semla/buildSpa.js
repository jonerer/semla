require('@babel/register')

const fw = require('./fw/fw')
const { buildSpa, getFwSpa } = require('./fw/spas')
const { setAppBasedir } = require('./fw/appinfo')

const doit = async () => {
    setAppBasedir(__dirname)
    await fw.load()

    const mySpa = getFwSpa()
    buildSpa(mySpa)
}

doit()
