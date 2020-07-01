import { finish, post, get, startup, get$ } from './testutils'

beforeAll(async () => {
    return startup({
        port: 3002,
    })
})

test('should be able get template test', async () => {
    const $ = await get$('/templateTest?qryVar=55')

    const fib = $('#fiboutput').text()

    expect(fib).toBe('8')

    const prom = $('#promiseoutput').text()

    expect(prom).toBe('55')

    const localprom = $('#localprom').text()
    expect(localprom).toBe('100')
})

afterAll(() => {
    return finish()
})
