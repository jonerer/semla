import { query } from './db'
import { QueryBuilder } from './querying/queryBuilder'
import { findOneSql } from './querying/utils'
import { ValidationRunner } from './validation/validators'
import { ValidationCollector } from './validation/collection'
import { Query } from 'pg'

export function instantiateFromDbRow(model, row) {
    const inst = new model()
    inst._attributes = mapDbToAttributes(model, row)
    return inst
}

const mapDbToAttributes = (model, row) => {
    // todo: test this
    const attrs = {}
    for (const column of Object.keys(row)) {
        const value = row[column]
        const field = model._fields.getByDbName(column)
        attrs[field.jsName] = value
    }
    return attrs
}

export const addARQueryThings = model => {
    async function insert(_opts) {
        const opts = _opts || {}
        let colNames = []
        let values = []
        let valuePlaceholderString = ''

        this._attributes.createdAt = new Date()
        let idx = 1
        /*
        const filteredFields = model._fields.all.filter(field => {
            // why is it called ".all"?
            return field.dbName !== 'id' && field.dbName !== 'updated_at'
        })
         */
        // filter out non-dirty keys
        // model._dirtyKeys is an object like { exampleField: true }
        // find all the dirty keys, add id and createdAt, and then look up the
        // actual field "objects" from their JS names

        // will this have bugs around relations?
        const dirtyJsNames = {
            ...this._dirtyKeys,
            createdAt: true,
        }
        const filteredFields = Object.keys(dirtyJsNames)
            .map(jsFieldName => {
                // find the field object
                return model._fields.all.find(x => {
                    return x.jsName === jsFieldName
                })
            })
            .filter(x => x != null)
        /*
        Removing null and undefined. These occur in the case of relations
        Like the model has a belongsTo relation to "owner". If someone changes inst.owner, then
        Both inst.owner and inst.ownerId will get dirty. But we're only interested in inst.ownerId for the database.
         */
        for (const field of filteredFields) {
            colNames.push(field.dbName)
            values.push(this._attributes[field.jsName])
            valuePlaceholderString += `$${idx++}`

            if (idx !== filteredFields.length + 1) {
                valuePlaceholderString += ', '
            }
        }

        const colNameString = colNames.map(x => '"' + x + '"').join(', ')

        let sql = `insert into ${model._tableName} (${colNameString}) VALUES (${valuePlaceholderString}) RETURNING *`
        if (!opts.onlySql) {
            const res = await query(sql, values)
            this._dirtyKeys = {}
            // sätt alla fält? börja med bara id I guess.

            this._attributes.id = res.rows[0].id
        } else {
            return [sql, values]
        }
        // console.log(res)
    }

    async function update(_opts) {
        const opts = _opts || {}
        let changed = Object.keys(this._dirtyKeys)
        if (changed.length === 0) {
            return
        }

        this.updatedAt = new Date()
        changed = Object.keys(this._dirtyKeys)

        const dirtyFields = []
        for (const changedJsName of changed) {
            let byJsName = model._fields.getByJsName(changedJsName)
            if (byJsName) {
                // todo: this is sort of a code smell. "virtual" fields like relations end up here. and there is no field for that. so they will be undefined.
                dirtyFields.push(byJsName)
            }
        }

        let idx = 1 // for some reason pg starts it's values at 1 lol :p
        let sql = `update ${model._tableName} set `
        for (const changedField of dirtyFields) {
            sql += '"' + changedField.dbName + '" = $' + idx
            if (idx !== dirtyFields.length) {
                sql += ','
            }
            sql += ' '
            idx++
        }

        sql += 'where "id" = $' + idx

        let newValues = dirtyFields.map(chang => this._attributes[chang.jsName])

        newValues = newValues.concat(this.id) // for WHERE id = ?

        if (!opts.onlySql) {
            await query(sql, newValues)
            this._dirtyKeys = {}
        } else {
            return [sql, newValues]
        }
    }

    model.prototype.validate = async function() {
        const validationCollector = this.constructor._validations
        const validationMode = this.isNew() ? 'create' : 'update'
        const runner = new ValidationRunner(
            this,
            validationCollector,
            validationMode
        )
        try {
            const results = await runner.validate()
            return results
        } catch (e) {
            console.log(e.stack)
            throw new Error('Validations failed to run: ' + e.message)
        }
    }

    model.prototype.save = async function(opts) {
        let retval = null

        const results = await this.validate()
        if (!results.isValid()) {
            throw new Error('Error validating the model: ' + results.messages())
        }

        if (this.isNew()) {
            retval = await insert.call(this, opts)
        } else {
            retval = await update.call(this, opts)
        }
        return retval
    }

    model.prototype.isNew = function() {
        return this.id === undefined
    }

    model.prototype.delete = async function(_opts) {
        const opts = _opts || {}

        if (!this.id) {
            throw new Error('Unable to delete thing with no id')
        }

        const deletionSql = `DELETE FROM ${model._tableName} WHERE ID = $1`
        await query(deletionSql, [this.id])
    }

    model.fromSql = async function(sql, vars_or_options, options = {}) {
        let vars = []
        if (Array.isArray(vars_or_options)) {
            vars = vars_or_options
        } else if (typeof vars_or_options === 'object') {
            options = vars_or_options
        }

        if (options.onlySql) {
            return [sql, vars]
        } else {
            const data = await query(sql, vars)

            let instantiated = []
            for (const row of data.rows) {
                instantiated.push(instantiateFromDbRow(model, row))
            }
            return instantiated
        }
    }

    model.findOne = async (conditions, _opts) => {
        const opts = _opts || {}
        const qb = new QueryBuilder()
        qb.targetModel(model)
        if (typeof conditions === 'number' || typeof conditions === 'string') {
            qb.addConditions([model.id, conditions])
        } else {
            qb.where(conditions)
        }
        const [completeSql, values] = await qb.sql()

        if (opts.onlySql) {
            return completeSql
        }

        const data = await query(completeSql, values)

        if (data.rows.length === 0) {
            throw new Error('No such ' + model._modelName + ' found.')
        }

        return instantiateFromDbRow(model, data.rows[0])
    }

    model.join = (...conditions) => {
        const qb = new QueryBuilder()
        qb.targetModel(model)
        qb.join(...conditions)
        return qb
    }

    model.order = (...param) => {
        const qb = new QueryBuilder()
        qb.targetModel(model)
        return qb.order(...param)
    }

    model.limit = param => {
        const qb = new QueryBuilder()
        qb.targetModel(model)
        return qb.limit(param)
    }

    model.where = (...conditions) => {
        const qb = new QueryBuilder()
        qb.targetModel(model)
        qb.where(...conditions)
        return qb
    }

    model.all = () => {
        const qb = new QueryBuilder()
        qb.targetModel(model)
        return qb.get()
    }

    model.prototype.set = function(obj) {
        // set a bunch of properties at once, ignoring "fill" restrictions
        for (const key of Object.keys(obj)) {
            this[key] = obj[key]
        }
    }

    model.find = async (conditions, _opts) => {
        const opts = _opts || {}
        const qb = new QueryBuilder()
        qb.targetModel(model)
        if (conditions !== undefined) {
            qb.where(conditions)
        }
        const [completeSql, values] = await qb.sql()

        if (opts.onlySql) {
            return completeSql
        }
        const res = await query(completeSql, values)
        let models = []
        for (const row of res.rows) {
            models.push(instantiateFromDbRow(model, row))
        }
        return models
    }
}
