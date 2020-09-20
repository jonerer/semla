import { getLowercasedModel } from '../models'
import { query } from '../db'
import { instantiateFromDbRow } from '../ar'

export class QueryField {
    constructor(model, field, operator) {
        this.field = field
        this.model = model
        this.name = field.jsName
        this.dbName = field.dbName
        this.operator = operator
        this.relation = null // only available for relation-fields, not "real" fields
        // an instance of the "Field" class in Fields.js
    }

    setRelation(rel) {
        this.relation = rel
    }

    needsIdx(value) {
        return value != null
    }

    /*
    dbIfy(name) {
        // turns a name from exampleQueryFieldId into it's db equivalent
        // example_query_field_id

        let dbName = ''
        for (let i = 0; i < name.length; i++) {
            const thisChar = name.charAt(i)
            if (thisChar.toLowerCase() === thisChar) {
                dbName += thisChar
            } else {
                dbName += '_' + thisChar.toLowerCase()
            }
        }
        return dbName
    }
     */

    sql(alias, value, paramId) {
        const nameToUse = alias + '."' + this.dbName + '"'
        if (value == null) {
            if (this.operator === '=') {
                return nameToUse + ' IS NULL '
            } else if (this.operator === '!=') {
                return nameToUse + ' IS NOT NULL '
            }
        } else {
            // make sure things targeting
            return nameToUse + ' ' + this.operator + ' $' + paramId
        }
    }
}

// "in": https://github.com/brianc/node-postgres/issues/1452

export class QueryBuilder {
    constructor() {
        this.conditions = [] // a list of [QueryField, value] arrays.
        // the value is either a value or a QueryField instance for relations
        this.joinFields = [] // a list of QueryField instances
        this.aliases = {} // an obj of modelName => 't' for sql aliases
        this.orderings = [] // a list of [QueryField, 'ASC'/'DESC']
        this.limitCount = -1
    }

    joinedColumnNames() {
        const fieldNamesJoined = this.model._fields
            .dbFieldNames()
            .map(x => this.getAlias(this.model) + '."' + x + '"')
            .join(', ')
        return fieldNamesJoined
    }

    join(relation) {
        if (!relation) {
            throw new Error(
                "That relation doesn't exist. You probably misspelled something."
            )
        }
        this.joinFields.push(relation)
        return this
    }

    isAliasAvailable(str) {
        return Object.values(this.aliases).indexOf(str) === -1
    }

    setUpAliases() {
        const allModelNames = { [this.model._modelName]: true }
        for (const join of this.joinFields) {
            allModelNames[join.model._modelName] = true
            allModelNames[join.relation.targetModel._modelName] = true
        }

        for (const modelName of Object.keys(allModelNames)) {
            const model = getLowercasedModel(modelName)
            const firstChar = model._tableName.charAt(0)

            let i = 0
            let avail = false
            let str = firstChar
            while (!avail) {
                str = firstChar + (i === 0 ? '' : i)
                avail = this.isAliasAvailable(str)
                i++
            }

            this.aliases[modelName] = str
        }
    }

    getAlias(model) {
        return this.aliases[model._modelName]
    }

    joinTablesString() {
        // https://stackoverflow.com/questions/8779918/postgres-multiple-joins
        let joinTables = []
        for (const joinField of this.joinFields) {
            const myModel = joinField.model
            const myModelAlias = this.getAlias(myModel)

            const relation = joinField.relation
            const otherModel = relation.targetModel
            const otherTableAlias = this.getAlias(otherModel)

            if (joinField.relation.type === 'belongsTo') {
                joinTables.push(
                    `JOIN ${otherModel._tableName} ${otherTableAlias} \n` +
                        `    ON ${myModelAlias}.${joinField.relation.dbName} = ${otherTableAlias}.id`
                )
            } else if (joinField.relation.type === 'hasMany') {
                joinTables.push(
                    `JOIN ${otherModel._tableName} ${otherTableAlias} \n` +
                        `    ON ${otherTableAlias}.${joinField.relation.dbName} = ${myModelAlias}.id`
                )
            }
        }

        return joinTables.join('\n')
    }

    conditionsString(values) {
        // forgive me: "values" is actually an "out" parameter here...
        let i = 1 // node_pg: whyyy not from 0 jeeeez
        let paramIdx = 1
        let joinedConditions = ''

        let conditionString = ''
        if (this.conditions.length > 0) {
            for (const condition of this.conditions) {
                const [field, value] = condition
                // find what model the field lives on, and what it's alias in this query is
                const alias = this.getAlias(field.model)
                const conditionSql = field.sql(alias, value, paramIdx)
                const needParam = field.needsIdx(value) // no param value for NULL comparisons

                let valueToUse = value

                // if this is a relation, and we're given a model
                // (or something that has that has an "id" attribute, then use that)

                if (
                    field.relation &&
                    value != null &&
                    typeof value === 'object'
                ) {
                    // if it has an 'id' that means we can use it as a query parameter. if it doesn't then well... no
                    if (typeof value.id === 'undefined') {
                        throw new Error(
                            "Unable to turn model instance into query parameter: it hasn't been saved yet, so it doesn't have an id."
                        )
                    } else {
                        valueToUse = value.id
                    }
                }

                joinedConditions += conditionSql

                if (i !== this.conditions.length) {
                    // again, not from 0
                    joinedConditions += ' AND '
                }

                if (needParam) {
                    values.push(valueToUse)
                }

                if (valueToUse !== null) {
                    paramIdx++
                }
                i++
            }
            conditionString = 'WHERE ' + joinedConditions
        }
        return conditionString
    }

    sql() {
        this.setUpAliases()

        const values = []

        const fromtable =
            'FROM ' + this.model._tableName + ' ' + this.getAlias(this.model)
        const joinTablesStr = this.joinTablesString()
        const orderingStr = this.orderingStr()
        const limitStr = this.limitStr()
        const conditionString = this.conditionsString(values)
        const completeSql = `SELECT ${this.joinedColumnNames()}\n${fromtable}\n${
            joinTablesStr ? joinTablesStr + '\n' : ''
        }${conditionString}${orderingStr}${limitStr}`
        return [completeSql, values]
    }

    limitStr() {
        if (this.limitCount === -1) {
            return ''
        }

        return ' LIMIT ' + parseInt(this.limitCount)
    }

    orderingStr() {
        if (this.orderings.length === 0) {
            return ''
        }

        let ord = ' ORDER BY '
        let i = 0
        for (const ordering of this.orderings) {
            let field = ordering[0]
            let dir = ordering[1]
            ord += this.getAlias(field.model) + '."' + field.dbName + '" ' + dir

            i++

            if (i !== this.orderings.length) {
                ord += ', '
            }
        }

        return ord
    }

    async first() {
        const res = await this.query()
        return res[0]
    }

    async one() {
        const res = await this.query()
        if (res.length > 1) {
            throw new Error(
                'More than one item returned for query ' + this.sql()[0]
            )
        }
        return res[0]
    }

    query() {
        return this.get()
    }

    all() {
        console.log('wut?')
    }

    async get() {
        const sql = this.sql()
        const result = await query(sql[0], sql[1])

        let models = []
        for (const row of result.rows) {
            models.push(instantiateFromDbRow(this.model, row))
        }
        return models
    }

    targetModel(model) {
        this.model = model
    }

    addConditions(conditions) {
        // is it one condition (ie a list)
        // or a list of conditions? (ie a list of lists)
        if (conditions.length === 0) {
            return
        }
        if (Array.isArray(conditions[0])) {
            for (const cond of conditions) {
                this.addCondition(cond)
            }
        } else {
            this.addCondition(conditions)
        }
    }

    addCondition(param) {
        const [field, value] = param
        if (field === undefined) {
            throw new Error(
                'Unable to add "undefined" as a condition field to a query. Possibly you have forgotten do add a relation, or a field has another jsName than you think. Please see the devtools at http://localhost:8000/devtools/models'
            )
        }
        this.conditions.push(param)
    }

    order(param, direction) {
        // param should be like [Example.field, 'ASC']
        // or, you send param = Example.field and direction 'ASC'
        if (!Array.isArray(param)) {
            param = [param, direction]
        }

        let dirToUse = 'ASC'
        if (param.length > 1) {
            dirToUse = param[1] === 'DESC' ? param[1] : 'ASC'
        }

        this.orderings.push([param[0], dirToUse])
        return this
    }

    limit(count) {
        this.limitCount = count
        return this
    }

    where(...args) {
        this.addConditions(args)
        // this.conditions.push([name, value])
        return this
    }
}
