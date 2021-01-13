import { finish, post, get, startup } from '../../fw/testing/testutils'

beforeAll(async () => {
    return startup({
        port: 3004,
    })
})

test('params, and allowed() filtering', async () => {
    const createdCat = await post(
        '/paramstest/paramOne/1/paramTwo/2?queryOne=1&queryTwo=2',
        {
            bodyOne: 1,
            bodyTwo: 2,
        }
    )

    expect(createdCat).toEqual({
        allowed: {
            paramOne: '1',
            queryOne: '1',
            bodyOne: 1,
        },
        all: {
            paramOne: '1',
            paramTwo: '2',
            queryOne: '1',
            queryTwo: '2',
            bodyOne: 1,
            bodyTwo: 2,
        },
    })
})

afterAll(() => {
    return finish()
})
