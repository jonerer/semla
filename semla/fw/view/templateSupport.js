import escape from 'escape-html'
import { pluralize } from '../utils'
// import * as createDOMPurify from 'dompurify';

export class TemplateSupport {
    constructor(ctx) {
        this.exportables = []
        this.helpers = {} // [name] = callback
        this.ctx = ctx
    }

    addExportable(name, callback) {
        this.exportables.push({
            name,
            callback,
        })
    }

    exportableNames() {
        return this.exportables.map(x => x.name)
    }

    addHelper(name, callback) {
        const toCall = (...args) => {
            return callback(this.ctx, ...args)
        }
        this.helpers[name] = toCall

        this[name] = toCall // todo: maybe this is messy?
    }
}

export const output = async value => {
    if (value != undefined && value.then) {
        value = await value // todo: should I keep this? unclear...
    }
    let html = value
    if (html == null) {
        return ''
    }
    if (!html.unsafeRawOutput) {
        html = escape(value)
    }
    return html
}

export const url_for = async modelInstance => {
    // todo: this should connect with the router and stuff...
    // just make a fake simple version for now

    // actually, maybe this doesn't make sense. urls aren't dependent on models, but routes. oh well.

    const model = modelInstance.constructor
    const modelName = pluralize(model._modelName.toLowerCase())
    return `/${modelName}/${modelInstance.id}`
}

const csrfTagCallback = ctx => {
    const csrfToken = ctx.req.session.csrfSecret

    const tag = `<input type="hidden" name="_csrfSecret" value="${csrfToken}" />`
    const s = new String(tag)
    s.unsafeRawOutput = true
    return s
}

export const addHelpers = support => {
    support.addHelper('csrfTag', csrfTagCallback)
}
