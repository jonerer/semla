import { ValidationCollector } from '../../fw/db/validation/collection.js'
import { ValidationRunner } from '../../fw/db/validation/validators.js'
import { MockDbAdapter } from '../../fw/db/adapters'
import {
    clearModels,
    collectSetup,
    prepareModels,
    registerModel,
    setDbAdapter,
} from '../../fw/db/models.js'

class TestUser {
    static setup(m) {
        m.validate(v => {})
    }
}

class TestMembership {
    static setup(m) {
        m.belongsTo('user', {
            model: 'testuser',
        })

        m.validate(v => {
            v.present('user')
        })
    }
}

const mockAdapter = new MockDbAdapter()
setDbAdapter(mockAdapter)

afterEach(() => {
    clearModels()
})

test('Should be able to detect presence on belongsTo relations.', async () => {
    registerModel(TestUser)
    registerModel(TestMembership)

    mockAdapter.addModelTableMetadata('test_memberships', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
        {
            name: 'user_id',
            type: 'INTEGER',
        },
    ])

    mockAdapter.addModelTableMetadata('test_users', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
    ])

    await prepareModels()

    const memb = new TestMembership()
    const valid1 = await memb.validate()
    expect(valid1.isValid()).toBe(false)

    memb.userId = '5'
    const valid2 = await memb.validate()
    expect(valid2.isValid()).toBe(true)

    const memb2 = new TestMembership()
    const user2 = new TestUser()
    user2.id = '10'

    expect((await memb2.validate()).isValid()).toBe(false)
    memb2.user = user2
    expect((await memb2.validate()).isValid()).toBe(true)
    memb2.userId = null
    expect((await memb2.validate()).isValid()).toBe(false)
})
