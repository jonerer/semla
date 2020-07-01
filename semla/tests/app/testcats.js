import { finish, post, get, startup } from './testutils'

beforeAll(async () => {
    return startup({
        port: 3002,
    })
})

test('should be able to CRUD cats with users', async () => {
    const createdCat = await post(catCreate() + '/', {
        color: 'white',
        name: 'mjaou',
    })

    const oneUser = await post(apiUserCreate(), {
        name: 'husse',
        cat_id: createdCat.id,
    })

    expect(oneUser.id).not.toBeNull()

    await post(apiUserCreate(), {
        name: 'matte',
        cat_id: createdCat.id,
    })

    const cc = await get(catShow(createdCat))

    expect(cc.id).toBe(createdCat.id)
    const users = cc.users
    expect(users.length).toBe(2)
    expect(users[0].name).toBe('husse')
    expect(users[1].name).toBe('matte')
})

afterAll(() => {
    return finish()
})
