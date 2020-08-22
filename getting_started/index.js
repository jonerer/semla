require('@babel/register')({ extensions: ['.js', '.ts']})
const { start, setBasedir } = require('semla')

setBasedir(__dirname)
start()
