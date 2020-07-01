import { start } from '../fw'
import * as axios from 'axios'
import { setAppBasedir } from '../appinfo'
import { add, addDefault } from '../config/config'
import * as cheerio from 'cheerio'
// import * as jest from 'jest'

let headers = {}

export const setHeaders = h => {
    headers = h
}

const mergedHeaders = conf => {
    let o = { ...conf }
    o.headers = { ...o.headers, ...headers }
    return o
}

// some utility methods
export const getRaw = (url, conf = {}) => {
    return axios.get(baseurl() + url, mergedHeaders(conf))
}

export const get = async (url, conf = {}) => {
    return (await getRaw(url, conf)).data
}

export async function post(url, cont, conf) {
    return (await postRaw(url, cont, conf)).data
}

export async function postRaw(url, cont, conf) {
    let s = baseurl() + url
    return await axios.post(s, cont, mergedHeaders(conf))
}

export async function doDelete(url, conf) {
    return (await axios.delete(baseurl() + url, mergedHeaders(conf))).data
}

// some code to to do the setup
// jest.setTimeout(30000)

const baseurl = () => {
    const domain = 'localhost'
    const baseurl = 'http://' + domain + ':' + process.env.PORT
    return baseurl
}

let server

export async function startup({ port }) {
    process.env.PORT = port
    process.env.NODE_ENV = 'test'
    addDefault('routes.defaults.csrfProtection', false)

    server = await start()
}

export async function finish() {
    return server.shutdown()
}

export async function get$(url) {
    const res = await getRaw(url)

    return cheerio.load(res.data)
}
