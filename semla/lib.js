const fw = require('./lib/fw.js')
const test = require('./lib/testing/testutils')

module.exports = {
    registerController: fw.registerController,
    registerModel: fw.registerModel,
    registerRoutes: fw.registerRoutes,
    start: fw.start,
    setBasedir: fw.setBasedir,
    requireParams: fw.requireParams,
    registerInitializer: fw.registerInitializer,
    runMigrations: fw.runMigrations,
    setAppBasedir: fw.setBasedir,
    registerSerializer: fw.registerSerializer,
    runMigrationsCli: fw.runMigrationsCli,
    testutils: {
        finish: test.finish,
        post: test.post,
        get: test.get,
        setHeaders: test.setHeaders,
        delete: test.doDelete,
        startup: test.startup,
    },
}
