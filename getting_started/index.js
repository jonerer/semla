require('@babel/register')
const { start, setBasedir } = require('genast')

setBasedir(__dirname)
start()
