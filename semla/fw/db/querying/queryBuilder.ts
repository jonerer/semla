import { getLowercasedModel, ModelInstance, ModelType } from '../models'
import { query } from '../db'
import { instantiateFromDbRow } from '../ar'
import { Field } from './fields'

type SqlOperators = '=' | '!=' | '<' | '<=' | '>' | '>=' | 'ANY'

export class QueryField {
    private field: Field
    model: ModelType
    private name: any
    dbName: any
    private operator: SqlOperators
    relation?: Field

    constructor(model: ModelType, field: Field, operator: SqlOperators) {
        this.field = field
        this.model = model
        this.name = field.jsName
        this.dbName = field.dbName
        this.operator = operator
        this.relation = undefined // only available for relation-fields, not "real" fields
    }

    setRelation(rel) {
        this.relation = rel
    }

    needsIdx(value) {
        return value != null
    }

    sql(alias, value, paramId) {
        const nameToUse = alias + '."' + this.dbName + '"'
        if (this.operator === 'ANY') {
            if (value == null) {
                throw new Error('You wanted to perform an "IN" query with a NULL value. This behaviour is undefined, and will therefore throw. Field: ' + this.model._modelName + '.' + this.field.jsName)
            }
            return nameToUse + ' = ANY ($' + paramId + ')'
        }
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

interface AliasType {
    [s: string]: string // from modelName to string, like "users": "u"
}

interface RawQueryCondition {
    [s: string]: any // query condition like "user_id": 5
}

export class QueryBuilder {
    private conditions: [QueryField, QueryField | any][]
    // (from, to). To is either a value or a queryfield in the case of relations.
    private joinFields: [QueryField, RawQueryCondition][] // second item in array is a condition
    private aliases: AliasType
    private orderings: [QueryField, 'ASC' | 'DESC'][]
    private limitCount: number
    private model: ModelType

    constructor() {
        this.conditions = []
        this.joinFields = []
        this.aliases = {}
        this.orderings = []
        this.limitCount = -1
    }

    joinedColumnNames() {
        const fieldNamesJoined = this.model._fields
            .dbFieldNames()
            .map(x => this.getAlias(this.model) + '."' + x + '"')
            .join(', ')
        return fieldNamesJoined
    }

    join(...conditions) {
        const relation: QueryField = conditions[0]
        let condition: RawQueryCondition | undefined = undefined
        if (conditions.length > 1) {
            condition = conditions[1] as object
        } else {
            condition = {}
        }
        if (!relation) {
            throw new Error(
                "That relation doesn't exist. You probably misspelled something."
            )
        }
        this.joinFields.push([relation, condition])
        return this
    }

    isJoinedWith(relation) {
        for (const joinField of this.joinFields) {
            if (relation == joinField[0]) {
                return true
            }
        }
        return false
    }

    isAliasAvailable(str) {
        return Object.values(this.aliases).indexOf(str) === -1
    }

    setUpAliases() {
        const allModelNames = { [this.model._modelName]: true }
        for (const join of this.joinFields) {
            const otherField = join[0]

            allModelNames[otherField.model._modelName] = true

            // @ts-ignore
            allModelNames[otherField.relation.targetModel._modelName] = true
        }

        for (const modelName of Object.keys(allModelNames)) {
            const model = getLowercasedModel(modelName)
            if (!model) {
                throw new Error("No such model " + modelName)
            }
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
        let joinTables: string[] = []
        for (const join of this.joinFields) {
            const [joinField, joinConditions] = join
            const myModel = joinField.model
            const myModelAlias = this.getAlias(myModel)

            const relation = joinField.relation
            if (!relation) {
                throw new Error("Internal semla error: unable to join relation")
            }
            const otherModel = relation.targetModel
            if (!otherModel) {
                throw new Error("Internal semla error: unable to join relation: other model is null")
            }
            const otherTableAlias = this.getAlias(otherModel)

            if (relation.type === 'belongsTo') {
                joinTables.push(
                    `JOIN ${otherModel._tableName} ${otherTableAlias} \n` +
                        `    ON ${myModelAlias}.${relation.dbName} = ${otherTableAlias}.id`
                )
            } else if (relation.type === 'hasMany') {
                joinTables.push(
                    `JOIN ${otherModel._tableName} ${otherTableAlias} \n` +
                        `    ON ${otherTableAlias}.${relation.dbName} = ${myModelAlias}.id`
                )
            }

            // add any join conditions as conditions. resolving their respective sources
            for (const joinCondition of Object.keys(joinConditions)) {
                // turn "user_id": 5
                const value = joinConditions[joinCondition]
                // into QueryField TeamMemberships.userId: 5
                const fromKey = myModel[joinCondition]

                this.addCondition([fromKey, value])
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
                if (!field.model) {
                    throw new Error('Unable to generate query, model is missing for field ' + JSON.stringify(field))
                }
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

        return ' LIMIT ' + this.limitCount
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

        let models: ModelInstance[] = []
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

    addCondition(param: any) {
        let rawField: any
        let field: QueryField
        let value: any = undefined
        if (param.length === 2) {
            [rawField, value] = param
        }else {
            /* if it's an object like
            { memberId: 5, somethingElse: 2 }
            Then instead recurse this method with
            [ 'memberId', 5] and [ 'somethingElse', 2 ]
             */
            const obj = param[0]
            for (const key of Object.keys(obj)) {
                const value = obj[key]
                if (typeof value === 'object' && !Array.isArray(value)) {
                    /*
                    This means it's an object like
                    { member: { id: 5, email: '...' } }
                    We should turn that into (in this case the "member" relation points to a user)
                    [ User.id, 5], [ User.level, '...']
                     */
                    const targetRelation: QueryField = this.model[key]
                    if (!targetRelation) {
                        throw new Error('You tried to join from model ' + this.model._modelName + ' via relation "' + key + '", but no such relation exists')
                    }
                    const targetModel = targetRelation.relation!.targetModel

                    // is this query already joined via the targetRelation? If not, make sure to add it
                    if (!this.isJoinedWith(targetRelation)) {
                        this.join(targetRelation)
                    }

                    for (const joinFieldKey of Object.keys(value)) {
                        const targetModelQueryField = targetModel![joinFieldKey]
                        const targetValue = value[joinFieldKey]
                        this.addCondition([targetModelQueryField, targetValue])
                    }
                } else {
                    this.addCondition([key, value])
                }
            }
            return
        }

        if (rawField instanceof QueryField) {
            field = rawField
        } else if (typeof rawField === 'string') {
            field = this.model[rawField]
        } else {
            throw new Error('Internal error, sorry')
        }
        if (field === undefined) {
            throw new Error(
                'Unable to add "undefined" as a condition field to a query. Possibly you have forgotten do add a relation, or a field has another jsName than you think. Please see the devtools at http://localhost:8000/devtools/models'
            )
        }
        const paramToUse = [field, value]
        // @ts-ignore
        this.conditions.push(paramToUse)
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

        // @ts-ignore
        this.orderings.push([param[0], dirToUse])
        return this
    }

    limit(count) {
        this.limitCount = parseInt(count)
        return this
    }

    where(...args) {
        this.addConditions(args)
        // this.conditions.push([name, value])
        return this
    }
}
