import fs from 'fs'
import { query } from '../db.js'
import { getAppBasedir, getAppMigrationsDir } from '../../appinfo'
import path from 'path'
import { MigratorInput } from './collector'
import { envShortName } from '../../config/config.js'
import { DbError } from '../../errors.js'

const createMigrationsTableQuery = `
create table migrations
(
    id serial not null
        primary key,
    name varchar(100) not null
);
`

const getAlreadyRunMigrations = async env => {
    try {
        const results = await query(`select * from migrations`, [], env)
        return results.rows.map(result => result.name)
    } catch (e) {
        if (e instanceof DbError && e.meta.code === '42P01') {
            // "undefined table" in postgres lingo
            await query(createMigrationsTableQuery, [], env)
            return []
        } else {
            throw e
        }
    }
}

const markMigrationDone = (name, env) => {
    query(`INSERT INTO migrations (name) VALUES ($1)`, [name], env)
}

class MigrationFile {
    constructor() {
        this.fullpath = ''
        this.name = ''
        this.hasRun = false
    }
}

const migrationFileDirs = []

export function addMigrationFileDir(dir) {
    migrationFileDirs.push(dir)
}

let hasAddedDefaultMigrationsDir = false

export async function getMigrations(env) {
    const alreadyRun = await getAlreadyRunMigrations(env)

    if (!hasAddedDefaultMigrationsDir) {
        migrationFileDirs.push(getAppMigrationsDir())
        hasAddedDefaultMigrationsDir = true
    }

    let migrs = []
    for (const basepath of migrationFileDirs) {
        const dir = fs.readdirSync(basepath)

        for (const file of dir) {
            // const fullpath = './../' + basepath + '/' + file
            if (!file.endsWith('.js') && !file.endsWith('.ts')) {
                continue
            }
            const fullpath = path.join(basepath, file)

            const mf = new MigrationFile()
            mf.fullpath = fullpath
            mf.name = file
            mf.hasRun = alreadyRun.indexOf(file) !== -1

            try {
                const migrCls = await getClassForPath(mf.fullpath)
                mf.generated = (await getStatements(migrCls)).join('\n')
            } catch (e) {
                // probably the class has some syntax error or so
                mf.generationError = e.toString()
            }
            migrs.push(mf)
        }
    }

    return migrs
}

// this is for running one-offs. doesn't save status in the migrations table or anything like that
export async function forceRunMigrationClass(cls) {
    const ddl = await getStatements(cls)
    return query(ddl)
}

export async function getStatements(cls) {
    const migrInst = new cls()

    const migrator = new MigratorInput()
    migrInst.change(migrator)
    const generatedStatements = migrator.generateStatements()
    return generatedStatements
}

async function getClassForPath(fullpath) {
    const mig = await import(fullpath)
    const migrCls = mig.default // migrations should export a default class
    return migrCls
}

export async function runMigrations(env) {
    if (!env) {
        env = envShortName()
    }
    const migrs = await getMigrations(env)
    let toRet = {}
    let numSuccessful = 0

    for (const migr of migrs) {
        if (migr.hasRun) {
            console.log('Already run', migr.name + ', skipping.')
            continue
        }

        const migrCls = await getClassForPath(migr.fullpath)

        const generatedStatements = await getStatements(migrCls)
        try {
            // todo: transactions! rollbacks!
            for (const stmt of generatedStatements) {
                await query(stmt, [], env)
            }
            await markMigrationDone(migr.name, env)
            console.log('Successfully applied', migr.name)
            numSuccessful++
        } catch (e) {
            toRet.success = false
            const message =
                'Unable to run migration. DDL:\n' +
                generatedStatements +
                '\n. Exception:' +
                e
            toRet.message = message
            toRet.numSuccessful = numSuccessful

            console.log(message)
            return toRet
        }
    }
    toRet.numSuccessful = numSuccessful
    toRet.success = true
    return toRet
}
