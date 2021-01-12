import { GenerationService } from '../../fw/devtools/services/GenerationService'
import { finish, startup } from '../../fw/testing/testutils'
import { prepareModels, registerModel, setDbAdapter } from '../../fw/db/models'
import { MockDbAdapter } from '../../fw/db/adapters'
import { DevFileChange } from '../../fw/devtools/models/DevFileChange'

// we need to init models for the generation service
const mockAdapter = new MockDbAdapter()
setDbAdapter(mockAdapter)

beforeAll(async () => {
    mockAdapter.addModelTableMetadata('dev_file_changes', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
        { name: 'example_field', type: 'TEXT' },
        {
            name: 'created_at',
            type: 'TIMESTAMPTZ',
        },
    ])
    await prepareModels()
    /*
    return startup({
        // we don't need a web server, but we do need the models.
        // so let's just runt it as an integration test for now
        port: 3003,
    })

     */
})

test('Should generate some stuff for a nested authenticated resource', async () => {
    const serv = new GenerationService()
    const generated = await serv.generate({
        name: 'Goal',
        nestingParent: 'Team',
        requireAuth: true,
        noSave: true
    })

    expect(generated.length).toBe(4)

    const modelConts = generated[0].text
    const controllerConts = generated[1].text
    const serializer = generated[2].text
    const migration = generated[3].text

    expect(modelConts).toBeTruthy()
    expect(controllerConts).toBeTruthy()
    expect(serializer).toBeTruthy()
    expect(migration).toBeTruthy()
    /*
    console.log(modelConts)
    console.log(controllerConts)
     */
})

test('Should take variant into account', async () => {
    const serv = new GenerationService()
    const generated = await serv.generate({
        name: 'Goal',
        nestingParent: 'Team',
        requireAuth: true,
        variant: 'ts',
        noSave: true
    })

    expect(generated.length).toBe(4)

    const modelConts = generated[0].text
    const modelPath = generated[0].path

    expect(modelPath.endsWith('Goal.ts'))
    expect(modelConts).toContain("types")
})

afterAll(async () => {
})
