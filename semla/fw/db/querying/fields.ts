import { singularize } from '../../utils'
import { getLowercasedModel, ModelType } from '../models'

export const jsifyFieldName = underscored_name => {
    let jsD = ''
    for (let i = 0; i < underscored_name.length; i++) {
        const curChar = underscored_name.charAt(i)
        if (curChar !== '_') {
            jsD += curChar
            continue
        }

        if (underscored_name.length > i + 1) {
            i++
            jsD += underscored_name.charAt(i).toUpperCase()
        }
    }
    return jsD
}

export const dbIfyJsName = jsName => {
    let dbN = jsName.charAt(0).toLowerCase()
    for (let i = 1; i < jsName.length; i++) {
        const curChar = jsName.charAt(i)
        let isLetter = curChar.match(/^[a-zA-Z]+$/)
        if (isLetter && curChar === curChar.toUpperCase()) {
            dbN += '_'
        }
        dbN += curChar.toLowerCase()
    }
    return dbN
}

type FieldTypes = 'hasMany' | 'belongsTo' // should include the db fields like "TEXT"

export class Field {
    dbName: string
    jsName: string
    type: FieldTypes
    relation: boolean
    targetModel?: ModelType
    model: ModelType
    tsType: string
    relationField?: Field

    isLessThanComparable() {
        return ['number', 'Date'].includes(this.tsType)
    }

    static typeStringToTsType(string) {
        switch (string) {
            case 'BOOL':
                return 'boolean'
            case 'BIGSERIAL':
                return 'number'
            case 'INTEGER':
                return 'number'
            case 'REAL':
                return 'number'
            case 'TEXT':
                return 'string'
            case 'VARCHAR':
                return 'string'
            case 'TIMESTAMP':
                return 'Date'
            case 'TIMESTAMPTZ':
                return 'Date'
            case 'DECIMAL':
                return 'number'
            default:
                throw new Error('Unknown type name ' + string)
        }
    }

    static FromDb(dbName, type) {
        const field = new Field()
        field.dbName = dbName
        field.jsName = field.jsIfy(dbName)
        field.type = type
        field.relation = false
        field.tsType = Field.typeStringToTsType(type)

        return field
    }

    static FromRelation(relation) {
        // relation.name is jsName

        /*
        const idFieldName = modelNameToTableName(relation.name) + '_id'
        field.dbName = idFieldName
         */
        const field = new Field()
        field.jsName = relation.name
        field.type = relation.type
        field.relation = true
        field.model = relation.model

        const targetModelName = relation.options.model
            ? relation.options.model
            : relation.name

        if (relation.type == 'hasMany') {
            field.targetModel = getLowercasedModel(singularize(targetModelName))
        } else if (relation.type === 'belongsTo') {
            field.targetModel = getLowercasedModel(targetModelName)
        } else {
            throw new Error('Not implemented')
        }

        if (relation.type === 'belongsTo') {
            // meaning the id is on my side
            field.dbName = singularize(dbIfyJsName(field.jsName)) + '_id'
        } else if (relation.type === 'hasMany') {
            // the id on the other side
            field.dbName = singularize(field.model._tableName) + '_id'
        }

        if (!field.targetModel) {
            throw new Error(
                'Tried to make a ' +
                    relation.type +
                    ' relation called ' +
                    relation.name +
                    ' but no corresponding model was found'
            )
        }

        return field
    }

    // the corresponding function, dbIfy is in the class "QueryField" next to the query builder.
    // maybe should put those together?

    // this one turns something like example_query_field_id into exampleQueryFieldId
    jsIfy(dbName) {
        return jsifyFieldName(dbName)
    }

    isDateTime() {
        return this.tsType === 'Date'
    }
}

export class Fields {
    private all: Field[]

    constructor(arr) {
        this.all = arr
    }

    getAll() {
        return this.all
    }

    dbFieldNames() {
        return this.all.map(x => x.dbName)
    }

    jsFieldNames() {
        return this.all.map(x => x.jsName)
    }

    addField(field) {
        this.all.push(field)
    }

    getByJsName(changedJsName) {
        return this.all.find(field => field.jsName === changedJsName)
    }

    getByDbName(column) {
        return this.all.find(field => field.dbName === column)
    }
}
