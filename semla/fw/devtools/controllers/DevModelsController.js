import { registerController } from '../../fw'
import { getModels } from '../../db/models'
import { sortBy } from 'underscore'

class DevModelsController {
    index() {
        const modelsRaw = getModels()

        let toRet = []
        for (const modelName of Object.keys(modelsRaw)) {
            const model = modelsRaw[modelName]
            let fields = model._fields.all
                .filter(field => !field.relation)
                .map(field => {
                    return {
                        type: field.type,
                        dbName: field.dbName,
                        jsName: field.jsName,
                    }
                })
            fields = sortBy(fields, x => {
                // a hack to put the standard fields separate from the users
                // fields. should probably be done on the client but hey
                if (x.jsName === 'id') {
                    return 'AAA'
                } else if (x.jsName === 'createdAt') {
                    return 'AAAAA'
                } else if (x.jsName === 'updatedAt') {
                    return 'AAAA'
                }
                return x.jsName
            })

            toRet.push({
                name: modelName,
                tableName: model._tableName,
                routeParamName: model._routeParamName,
                fields: fields,
            })
        }

        const resorted = sortBy(toRet, x => x.name)

        this.json(resorted)
    }
}

registerController(DevModelsController)
