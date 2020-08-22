import { registerInitializer } from 'semla'

const initDb = i => {
    const defaults = {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: 5432,
    }

    const dev = {
        ...defaults,
        database: 'semla_dev',
    }

    const test = {
        ...defaults,
        database: 'semla_test',
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
