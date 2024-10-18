import { getUserModels, ModelType } from './models'
import get from '../config/config'
import { getAppBasedir } from '../appinfo'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { prettierify } from '../devtools/services/Prettierify'

/*
 * This file generates typescript types for the models in the application.
 * It might be removed, if I go all in on jsdoc.
 */
/** @typedef {Object} Attributes
 * @property {string} settableName
 * @property {string} settableContent
 * @property {string} attributesName
 * @property {string} attributesContent
 * @property {string} joinableFieldsName
 * @property {string} joinableFieldsType
 * @property {string} queryFieldsName
 * @property {string} queryFieldsContent
 */

/** Generate the attributes for a model
 * @param {ModelType} model
 * @returns {Attributes}
 */
export const generateAttributesForModel = model => {
    let all = model._fields.getAll()

    const settableName = model._modelName + 'Settable'
    let settableContent = `interface ${settableName} {\n`
    for (const field of all) {
        let tsType = field.tsType
        if (tsType === 'Date' && useMoment()) {
            tsType = 'Date | Moment'
        }
        settableContent += field.jsName + '?: ' + tsType + ' | null' + '\n' // todo: nullability!
    }
    for (const field of model._relationFields.filter(
        x => x.type === 'belongsTo'
    )) {
        settableContent +=
            field.jsName +
            '?: ' +
            'number | null | ' +
            field.targetModel?._modelName +
            ' | RelatedField<' +
            field.targetModel?._modelName +
            '>\n'
    }
    settableContent += '}\n'

    const attributesName = model._modelName + 'Attributes'
    let attributesContent = `interface ${model._modelName}Attributes {\n`
    for (const field of all) {
        attributesContent += `${field.jsName}: ${field.tsType}\n`
        // does this include "id"-fields?
    }
    for (const field of model._relationFields) {
        attributesContent += `${field.jsName}: RelatedField<${field.targetModel?._modelName}>\n`
    }
    attributesContent += '}'

    const joinableFieldsName = `${model._modelName}JoinableFields`
    const jf =
        model._relationFields.map(x => "'" + x.jsName + "'").join(' | ') || "''"
    const joinableFieldsType = `type ${joinableFieldsName} = ${jf}\n`

    const queryFieldsName = `${model._modelName}QueryFields`
    let queryFieldsContent = `interface ${queryFieldsName} {\n`
    for (const field of all) {
        const isId = field.jsName === 'id' || field.jsName.endsWith('Id') // todo improve?
        const stringAllowed = isId || field.isDateTime()
        const typeString = stringAllowed
            ? field.tsType + ' | string'
            : field.tsType

        queryFieldsContent += field.jsName + '?: ' + typeString + '\n'
        queryFieldsContent += field.jsName + '__not?: ' + typeString + '\n'

        if (field.isLessThanComparable()) {
            queryFieldsContent += field.jsName + '__lt?: ' + typeString + '\n'
            queryFieldsContent += field.jsName + '__lte?: ' + typeString + '\n'
            queryFieldsContent += field.jsName + '__gt?: ' + typeString + '\n'
            queryFieldsContent += field.jsName + '__gte?: ' + typeString + '\n'
        }
        queryFieldsContent += '\n'
    }
    for (const field of model._relationFields) {
        queryFieldsContent += `${field.jsName}?: number | string | RelatedField<${field.targetModel?._modelName}> | ${field.targetModel?._modelName}QueryFields \n`
    }
    queryFieldsContent += '}\n'

    /** @type {Attributes} */
    const attrs = {
        settableName,
        settableContent,
        attributesName,
        attributesContent,
        joinableFieldsName,
        joinableFieldsType,
        queryFieldsName,
        queryFieldsContent,
    }
    return attrs
}

/** Generate the base class for a model
 * @param {ModelType} model
 * @param {Attributes} attributes
 * @returns {string}
 */
export const generateBaseClassForModel = (model, attributes) => {
    let modelBody = 'export class ' + model._modelName + 'Base {\n'
    let all = model._fields.getAll()
    for (const field of model._relationFields) {
        if (field.type === 'belongsTo') {
            modelBody +=
                field.jsName +
                ': RelatedField<' +
                field.targetModel?._modelName +
                '>\n'
            modelBody += 'static ' + field.jsName + ': QueryField\n\n'
        } else if (field.type === 'hasMany') {
            modelBody +=
                field.jsName +
                ': RelatedField<' +
                field.targetModel?._modelName +
                '[]>\n\n'
        }
        // modelsToImport.push(field.targetModel?._modelName!)
    }
    for (const field of all) {
        modelBody += field.jsName + ': ' + field.tsType + '\n'
        if (field.jsName === 'name') {
            modelBody += '    // @ts-ignore\n' // conflicts with built-in prototype constructor 'name'. really ignorable? unsure...
        }
        modelBody += 'static ' + field.jsName + ': QueryField\n\n'
        modelBody += 'static ' + field.jsName + '__not: QueryField\n\n'
        modelBody += 'static ' + field.jsName + '__lt: QueryField\n\n'
        modelBody += 'static ' + field.jsName + '__lte: QueryField\n\n'
        modelBody += 'static ' + field.jsName + '__gt: QueryField\n\n'
        modelBody += 'static ' + field.jsName + '__gte: QueryField\n\n'
    }

    modelBody += '\n// instance methods\n'
    modelBody += `set: (obj: ${attributes.settableName}) => void\n`
    modelBody += `save: () => Promise<${model._modelName}>\n`
    modelBody += '\n// AR methods\n'
    modelBody += `static where: (arg0: ${attributes.queryFieldsName}) => any\n`
    /*
    // todo how to have multiple shapes? overloading etc
    modelBody +=
        'static where: (from: QueryField, to: QueryField | ValueType) => any\n'
     */
    modelBody += `static join: (arg0: ${attributes.joinableFieldsName}, arg1?: ${attributes.queryFieldsName}) => any\n`
    modelBody += 'static order: (from: any) => any\n'
    modelBody += `static find: (from?: ${attributes.queryFieldsName}) => Promise<${model._modelName}[]>\n`
    modelBody += `static findOne: (from: ${attributes.queryFieldsName} | ValueType) => Promise<${model._modelName}>\n`
    // todo: unify parameters for find and findOne
    modelBody += '}\n'

    return modelBody
}

/** Generate the body for a model
 * @param {ModelType} model
 * @returns {string}
 */
export const generateBodyForModel = model => {
    const attributes = generateAttributesForModel(model)
    const baseClass = generateBaseClassForModel(model, attributes)
    let body = ''
    body += '// ' + model._modelName + ' related types\n\n'
    body += attributes.settableContent
    body += attributes.queryFieldsContent
    body += attributes.joinableFieldsType
    body += attributes.attributesContent
    body += baseClass
    return body + '\n\n'
}

const useMoment = () => {
    return true
}

/** Generate the content for the types file
 * @param {ModelType[]} models
 * @returns {string}
 */
const generateTypesContent = models => {
    // make a little prelude
    // for each model, create a string for the interface, one for the import

    let infoHeader = `// This file was automatically generated by the Semla framework.\n`
    infoHeader +=
        '// DO NOT make any changes in this file; they will be overwritten anyway.\n'
    infoHeader +=
        '// DO make sure to add this to source control; it will not be regenerated in test or production environments\n'

    const prelude = `
    export interface RelatedField<T> extends Promise<T> {
    id: number
    }
    
    interface QueryField {}
    
    interface RenderOptions {
        layout?: string | null
    }
    
export class SemlaController {
    // implementations are provided by the framework at runtime
    render(view: string, locals?: object | undefined, options?: RenderOptions) {}
    redirect(path: string) {}
    json(serializable: object) {}
}
    `

    // piece together the reqeust context interface thing
    let routeParamThings = ``
    for (const model of models) {
        routeParamThings +=
            model._routeParamName + ': ' + model._modelName + '\n'
    }
    let requestContextInterfaceThing = `
interface ParamsObject {
    allowed(...args): any
    [s: string]: any
}

type ValueType = 'number' | 'string' | 'boolean'

export type flashTypes = 'info' | 'error' | 'warn'

interface Flash {
    type: flashTypes,
    text: string
}

export interface RequestContext {
    params: ParamsObject
    req: any // express req
    res: any // express res
    session: any
    ${routeParamThings}
    render(view: string, locals?: object | undefined)
    redirect(path: string)
    json(serializable: object)
    flash(type: flashTypes, text: string)
    flashes(): Flash[]
    di: any
}
    `

    /** @type {string[]} */
    let modelsToImport = []
    let imports = ``

    if (useMoment()) {
        imports += "import { Moment } from 'moment'\n"
    }

    let modelsBody = ``

    for (const model of models) {
        const modelBody = generateBodyForModel(model)

        modelsToImport.push(model._modelName)

        modelsBody += modelBody + '\n'
    }

    /** @type {string[]} */
    let hasImported = []
    for (const impo of modelsToImport) {
        if (hasImported.indexOf(impo) !== -1) {
            continue
        }
        // todo: this assumes a lot about or project layout.
        //  best would be to intercept the source location from the "registerModel" call.
        imports += 'import { ' + impo + "} from '../models/" + impo + "'\n"
        hasImported.push(impo)
    }

    let s =
        imports +
        '\n\n' +
        infoHeader +
        '\n\n' +
        prelude +
        '\n\n' +
        requestContextInterfaceThing +
        '\n\n' +
        modelsBody
    // return prettierify(s)
    return s
}

/** Get the current content of the types file
 * @param {string} targetFilePath
 * @returns {string}
 */
function getCurrentContent(targetFilePath) {
    try {
        return readFileSync(targetFilePath, 'utf-8')
    } catch (e) {
        return ''
    }
}

/** Write new content to the types file
 * @param {string} targetFilePath
 * @param {string} content
 */
function writeNewContent(targetFilePath, content) {
    writeFileSync(targetFilePath, content, 'utf-8')
}

export const generateTypes = async () => {
    const shouldGenModels = get('codegen.models')
    if (shouldGenModels) {
        const models = getUserModels()

        /** @type {ModelType[]} */
        let modelList = []
        let anyNotLoaded = false
        for (const model of Object.values(models)) {
            modelList.push(model)
            if (!model.loaded()) {
                anyNotLoaded = true
            }
        }

        if (anyNotLoaded) {
            console.log(
                'No generating types; at least one model failed to load'
            )
            return
        }

        const content = generateTypesContent(modelList)
        const targetFilePath = getAppBasedir() + '/app/generated/types.ts'
        const currentContent = getCurrentContent(targetFilePath)
        if (content != currentContent) {
            writeNewContent(targetFilePath, content)
        }
    }
}
