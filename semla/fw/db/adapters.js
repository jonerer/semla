import { query } from './db'
import chalk from 'chalk'

export class DbAdapter {
    getModelTableMetadata() {
        throw new Error('need to implement')
    }
}

export class PostgresDbAdapter extends DbAdapter {
    typeIdToString(tableName, name, dataTypeId) {
        switch (dataTypeId) {
            // todo: det är något lurt här...
            // https://jdbc.postgresql.org/development/privateapi/constant-values.html ?
            case 16:
                return 'BOOL'
            case 19:
                return 'BIGSERIAL'
            case 20:
                return 'INTEGER'
            case 23:
                return 'INTEGER'
            case 24:
                return 'TEXT'
            case 25:
                return 'TEXT'
            case 1043:
                return 'VARCHAR' // varchar(255)
            case 1114:
                return 'TIMESTAMP'
            case 1183:
                return 'TIMESTAMPTZ'
            case 1184:
                return 'TIMESTAMPTZ'
            case 700:
                return 'REAL'
            default:
                throw new Error(
                    `unknown field type for field ${tableName}:${name}, ${dataTypeId}`
                )
        }
    }

    async getModelTableMetadata(model) {
        try {
            const tableName = model._tableName
            const metadataRes = await query(
                `select * from ${tableName} limit 0`
            )

            const toRet = []
            // sprinkle in some handlers for the db fields
            for (const field of metadataRes.fields) {
                const { name, dataTypeID } = field

                const typeString = this.typeIdToString(
                    tableName,
                    name,
                    dataTypeID
                )

                toRet.push({
                    name,
                    type: typeString,
                })
            }
            return toRet
        } catch (e) {
            console.warn(
                'Warning: the model ',
                model._modelName,
                " couldn't load correctly! Probably it doesn't exist in the database. Nested error: " +
                    e.message
            )
            console.warn(chalk.black.bgRed('Probably you need to run migrations'))
            return []
        }
    }
}

export class MockDbAdapter extends DbAdapter {
    constructor() {
        super()
        this.metas = {}
        this.allEmpty = false
    }

    addModelTableMetadata(modelName, metas) {
        this.metas[modelName] = metas
    }

    setAllEmpty() {
        this.allEmpty = true
    }

    async getModelTableMetadata(model) {
        if (this.allEmpty) {
            return []
        }

        let meta = this.metas[model._tableName]
        if (!meta) {
            console.warn('The model', model._modelName, 'doesnt have any db metadata attached')
            return []
        }
        return meta
    }
}
