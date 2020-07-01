import { pluralize } from '../../utils'
import { MigrationCreationService } from './MigrationCreationService'
import moment from 'moment'
import { modelNameToTableName } from '../../db/models'
import { Renderer } from '../../view/render'
import { getFwBasedir, isNonProd, getAppBasedir } from '../../appinfo'
import { dbIfyJsName } from '../../db/querying/fields'
import { prettierify } from './Prettierify'

const generationRenderer = () => {
    const r = new Renderer({
        jsDefaults: true,
    })
    r.setViewsDirectory(getFwBasedir() + '/devtools/views')
    return r
}

const generateModel = async ({ name, nestingParent }) => {
    const errorRenderer = generationRenderer()
    const relationName = dbIfyJsName(nestingParent)
    const result = await errorRenderer.render('generated_model', {
        name,
        nestingParent,
        relationName,
    })
    return result.valueOf()
}

const generateController = async ({
    modelName,
    name,
    nestingParent,
    requiresAuth,
}) => {
    const varNameSingular = modelName.toLowerCase()
    const varNamePlural = pluralize(modelName.toLowerCase()) // should just lowercase the first letter or?
    const nestingParentParam = nestingParent.toLowerCase()

    const errorRenderer = generationRenderer()
    const result = await errorRenderer.render('generated_controller', {
        name,
        nestingParent,
        varNameSingular,
        varNamePlural,
        nestingParentParam,
        requiresAuth,
        modelName,
    })
    return result.valueOf()
}

const generateSerializer = async ({ modelName, nestingParent }) => {
    const errorRenderer = generationRenderer()
    const relationName = dbIfyJsName(nestingParent)
    const result = await errorRenderer.render('generated_serializer', {
        nestingParent,
        relationName,
        modelName,
    })
    return result.valueOf()
}

export class GenerationService {
    constructor() {
        this.changes = []
    }

    async generate(input) {
        // input contains name, potentially a "nestingParent" and a "requiresAuth" key
        const { name: resourceName, nestingParent, requiresAuth } = input
        const controllerName = pluralize(resourceName) + 'Controller'
        const tableName = modelNameToTableName(resourceName)

        const basePath = getAppBasedir()

        const ch = new DevFileChange()
        ch.text = prettierify(
            await generateModel({ name: resourceName, nestingParent })
        )
        ch.path = basePath + '/app/models/' + resourceName + '.js' // todo
        ch.applied = false
        ch.applicable = true
        await ch.save()
        this.changes.push(ch)

        const cch = new DevFileChange()
        cch.set({
            text: prettierify(
                await generateController({
                    name: controllerName,
                    modelName: resourceName,
                    nestingParent,
                    requiresAuth,
                })
            ),
            path: basePath + '/app/controllers/' + controllerName + '.js',
            applied: false,
            applicable: true,
        })
        await cch.save()
        this.changes.push(cch)

        const csr = new DevFileChange()
        const serializerName = resourceName + 'Serializer'
        csr.set({
            text: prettierify(
                await generateSerializer({
                    modelName: resourceName,
                    nestingParent,
                })
            ),
            path: basePath + '/app/serializers/' + serializerName + '.js',
            applied: false,
            applicable: true,
        })
        await csr.save()
        this.changes.push(csr)

        // migration file. a bit more complex

        // todo: handle nestedResource
        const mc = new MigrationCreationService()
        mc.name =
            moment().format('YYYY-MM-DD_HH-mm_') +
            'Create' +
            pluralize(resourceName) +
            'Table'
        mc.changes.push({
            type: 'createTable',
            tableName: tableName,
        })

        const migrationFile = mc.generateMigrationFile()

        const mcs = new DevFileChange()
        mcs.set({
            text: migrationFile.contents,
            path: basePath + '/app/db/migrations/' + migrationFile.name + '.js',
            applied: false,
            applicable: true,
        })
        await mcs.save()
        this.changes.push(mcs)

        // this.changes.push(mc)

        return this.changes
    }
}
