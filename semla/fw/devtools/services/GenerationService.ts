import { pluralize } from '../../utils'
import { MigrationCreationService } from './MigrationCreationService'
import moment from 'moment'
import { modelNameToTableName } from '../../db/models'
import { Renderer } from '../../view/render'
import { getFwBasedir, isNonProd, getAppBasedir } from '../../appinfo'
import { dbIfyJsName } from '../../db/querying/fields'
import { prettierify } from './Prettierify'
import { DevFileChange } from '../models/DevFileChange'

const generationRenderer = () => {
    const r = new Renderer({
        jsDefaults: true,
    })
    r.setViewsDirectory(getFwBasedir() + '/devtools/views')
    return r
}

const generateModel = async ({ name, nestingParent, variant }: GenerationInput) => {
    const errorRenderer = generationRenderer()
    const relationName = dbIfyJsName(nestingParent)
    const result = await errorRenderer.render('generated_model_' + variant, {
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

const generateSerializer = async ({ name, nestingParent, variant }: GenerationInput) => {
    const errorRenderer = generationRenderer()
    const relationName = dbIfyJsName(nestingParent)
    const result = await errorRenderer.render('generated_serializer_' + variant, {
        nestingParent,
        relationName,
        modelName: name,
    })
    return result.valueOf()
}

interface GeneratedFile {
    text: string
    path: string
}

export type Variants = 'js' | 'ts'

interface GenerationInput {
    name: string
    nestingParent: string
    requiresAuth: boolean
    variant: Variants
    noSave: boolean // this is for test runs without a database
}

export class GenerationService {
    private changes: DevFileChange[]
    
    constructor() {
        this.changes = []
    }

    basePath() {
        return getAppBasedir()
    }

    async generate(_input: GenerationInput) {
        // input contains name, potentially a "nestingParent" and a "requiresAuth" key
        let input = _input
        input.variant = input.variant || 'js'

        const extension = '.' + _input.variant

        const controllerName = pluralize(input.name) + 'Controller'
        const tableName = modelNameToTableName(input.name)

        const { nestingParent, requiresAuth } = _input

        const basePath = getAppBasedir()

        const ch: any = new DevFileChange()
        ch.text = prettierify(await generateModel(input))
        ch.path = this.basePath() + '/app/models/' + input.name + extension
        ch.applied = false
        ch.applicable = true
        if (!input.noSave) {
        await ch.save()
        }
        this.changes.push(ch)

        const cch: any = new DevFileChange()
        cch.set({
            text: prettierify(
                await generateController({
                    name: controllerName,
                    modelName: input.name,
                    nestingParent,
                    requiresAuth,
                })
            ),
            path: basePath + '/app/controllers/' + controllerName + '.js',
            applied: false,
            applicable: true,
        })
        if (!input.noSave) {
            await cch.save()
        }
        this.changes.push(cch)

        const csr: any = new DevFileChange()
        const serializerName = input.name + 'Serializer'
        csr.set({
            text: prettierify(
                await generateSerializer(input)
            ),
            path: basePath + '/app/serializers/' + serializerName + '.' + input.variant,
            applied: false,
            applicable: true,
        })
            if (!input.noSave) {
                await csr.save()
            }
        this.changes.push(csr)

        // migration file. a bit more complex
        const mc = new MigrationCreationService()
        mc.setVariant(input.variant)
        mc.name =
            moment().format('YYYY-MM-DD_HH-mm_') +
            'Create' +
            pluralize(input.name) +
            'Table'
        mc.changes.push({
            type: 'createTable',
            tableName: tableName,
        })

        const migrationFile = mc.generateMigrationFile()

        const mcs: any = new DevFileChange()
        mcs.set({
            text: migrationFile.contents,
            path: basePath + '/app/db/migrations/' + migrationFile.name + '.' + input.variant,
            applied: false,
            applicable: true,
        })
            if (!input.noSave) {
                await mcs.save()
            }
        this.changes.push(mcs)

        // this.changes.push(mc)

        return this.changes
    }
}
