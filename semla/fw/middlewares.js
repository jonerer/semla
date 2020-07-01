import { jsifyFieldName } from './db/querying/fields'

export const jsifyBody = ({ req }) => {
    if (req.body) {
        const newBody = {}
        for (const oldAttr of Object.keys(req.body)) {
            const newName = jsifyFieldName(oldAttr)
            newBody[newName] = req.body[oldAttr]
        }
        req.body = newBody
    }
}

export const requireParams = names => {
    if (!Array.isArray(names)) {
        // should be either string or array. let's coerce
        names = [names]
    }
    const func = ({ req, params }) => {
        // todo: make sure this requires there params in names
        // names is either a string or an array
        const kek = params.allow(names)
        for (const key of names) {
            if (Object.keys(kek).indexOf(key) === -1) {
                throw new Error(
                    `Error from path ${req.path}. Param was required: ${key}`
                )
            }
        }
    }
    return func
}
