import { start } from '../../fw/fw'
import * as axios from 'axios'
import { setAppBasedir } from '../../fw/appinfo'
// import * as jest from 'jest'

process.env.PORT = 3001

jest.setTimeout(30000)

const domain = 'localhost'
const baseurl = 'http://' + domain + ':' + process.env.PORT

const get = async url => {
    return (await axios.get(baseurl + url)).data
}

async function post(url, cont) {
    return (await axios.post(baseurl + url, cont)).data
}

async function doDelete(url) {
    return (await axios.delete(baseurl + url)).data
}

let server = null
beforeAll(async () => {
    setAppBasedir(__dirname + '/../../')
    server = await start()
})

test('should be able to CRUD users', async () => {
    const before = await get(apiUserIndex())
    //console.log(before)

    const created = await post(apiUserCreate(), {
        name: 'namn',
        email: 'maejl',
    })

    //console.log(created)
    expect(created.id).not.toBeNull()
    expect(created.name).toBe('namn')
    expect(created.email).toBe('maejl')

    const after = await get(apiUserIndex())

    expect(before.length).toBe(after.length - 1)

    const updated = await post(apiUserUpdate(created.id), {
        name: 'nyttnamn',
    })

    expect(updated.name).toBe('nyttnamn')

    await doDelete(apiUserDelete(created.id))

    const lastly = await get(apiUserIndex())

    expect(lastly.length).toBe(before.length)
})

test('should be able to CRUD someone with a cat', async () => {
    const before = await get(apiUserIndex())

    const cat = await post(catIndex(), {
        name: 'zingo',
        color: 'brown',
    })

    const created = await post(apiUserIndex(), {
        name: 'namn',
        email: 'maejl',
        cat_id: cat.id,
    })

    //console.log(created)
    expect(created.id).not.toBeNull()
    expect(created.cat.id).not.toBeNull()

    const after = await get(apiUserIndex())

    expect(before.length).toBe(after.length - 1)

    const updated = await post(apiUserShow(created.id), {
        name: 'nyttnamn',
    })

    expect(updated.name).toBe('nyttnamn')

    await doDelete(apiUserShow(created.id))

    const lastly = await get(apiUserIndex())

    expect(lastly.length).toBe(before.length)
})

afterAll(() => {
    server.shutdown()
})
