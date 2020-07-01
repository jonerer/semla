import { registerInitializer } from '../../fw/fw'

const initDb = i => {
    const defaults = {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: 5432,
    }

    const dev = {
        ...defaults,
        database: 'genast_mig',
    }

    const test = {
        ...defaults,
        database: 'genast_test',
    }

    const prod = {
        // todo
        ...defaults,
    }

    i.addSettings('database', {
        dev,
        test,
        prod,
    })
}

registerInitializer(initDb)
