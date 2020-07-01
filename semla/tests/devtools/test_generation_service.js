import { GenerationService } from '../../fw/devtools/services/GenerationService'
import { finish, startup } from '../../fw/testing/testutils'

beforeAll(async () => {
    return startup({
        // we don't need a web server, but we do need the models.
        // so let's just runt it as an integration test for now
        port: 3003,
    })
})

test('Should generate some stuff for a nested authenticated resource', async () => {
    const serv = new GenerationService()
    const generated = await serv.generate({
        name: 'Goal',
        nestingParent: 'Team',
        requireAuth: true,
    })

    expect(generated.length).toBe(3)

    const modelConts = generated[0].text
    const controllerConts = generated[1].text
    const serializer = generated[2].text
    const migration = generated[3].text

    console.log(modelConts)
    console.log(controllerConts)
})

afterAll(async () => {
    return finish()
})
