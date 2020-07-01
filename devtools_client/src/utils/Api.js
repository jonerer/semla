import axios from 'axios'

const domain = 'localhost'
const baseurl = 'http://' + domain + ':' + 8000 + '/api/'

const get = async (url) => {
    return (await axios.get(baseurl + url)).data
}

async function post(url, cont) {
    return (await axios.post(baseurl + url, cont)).data
}

async function doDelete(url) {
    return (await axios.delete(baseurl + url)).data
}

export default class Api {
    static getModels() {
        return get('dev/models')
    }

    static async getRoutes() {
        return get('dev/routes')
    }

    static async getDocPage(name) {
        return get('dev/doc_page/' + name)
    }

    static async getGlobals() {
        return get('dev/globals')
    }

    static async getControllers() {
        return get('dev/controllers')
    }

    static async createMigration(payload) {
        return post('dev/migrations', payload)
    }

    static async getMigrations(env) {
        return get(`dev/migrations?env=${env}`)
    }

    static async getLoaderIndex() {
        return get('dev/loader')
    }

    static async getServerInfo() {
        return get('dev/info')
    }

    static async runMigrations(env) {
        return post(`dev/migrations/run?env=${env}`)
    }

    static async generate(data) {
        return post('dev/generate', data)
    }

    static async applyGeneratedFile(id) {
        return post('dev/generate/apply', { id })
    }

    static async getConfigs() {
        return get('dev/config')
    }

    static async runDbQuery(text) {
        return post('dev/db/query', {
            text,
        })
    }

    static async getRequests() {
        return get('dev/requests')
    }

    static async repeatRequest(id, bypassCsrf) {
        return post('dev/requests/' + id + '/repeat', {
            bypassCsrf,
        })
    }
}
