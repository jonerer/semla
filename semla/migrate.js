require('@babel/register')

const migr = require('./fw/db/migrations/migration')
const { envShortName } = require('./fw/config')

migr.runMigrations(envShortName())
//import { runMigrations } from './fw/migration.js'

//runMigrations()
