import { finish, post, get, startup, postRaw } from '../../fw/testing/testutils'

beforeAll(async () => {
    return startup({
        port: 3004,
    })
})

test('should be able to create some session stuff', async () => {
    const sess = await postRaw('/setSession', {
        toSet: 'example',
    })
    expect(sess.data.value).toBe('example')

    const cookie = sess.headers['set-cookie'][0]
    const ge = await get('/getSession', {
        headers: {
            cookie,
        },
    })
    expect(ge.value).toBe('example')
})

afterAll(() => {
    return finish()
})
