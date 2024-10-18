import {
    clearModels,
    prepareModels,
    registerModel,
    setDbAdapter,
} from '../../fw/db/models.js'
import { MockDbAdapter } from '../../fw/db/adapters'

const mockAdapter = new MockDbAdapter()
setDbAdapter(mockAdapter)

const makeMock = name => {
    mockAdapter.addModelTableMetadata(name, [
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
}

afterAll(() => {
    clearModels()
})

beforeAll(async () => {
    registerModel(Example)
    makeMock('examples')
    await prepareModels()
})

class Example {}

test('Should let you query from SQL', async () => {
    const [myCoolSqlWithoutVars, myCoolVars] = await Example.fromSql('select * from hejsan', {onlySql: true})

    expect(myCoolSqlWithoutVars).toBe('select * from hejsan')
    expect(myCoolVars).toStrictEqual([])
})

