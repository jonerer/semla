import {
    clearModels,
    prepareModels,
    registerModel,
    setDbAdapter,
} from '../../fw/db/models.js'
import { MockDbAdapter } from '../../fw/db/adapters'
import { jsifyBody } from '../../fw/middlewares'

const mockAdapter = new MockDbAdapter()
setDbAdapter(mockAdapter)

class TestUser {
    static setup(m) {
        m.hasMany('testMemberships')
    }
}

class TestMembership {
    static setup(m) {
        m.belongsTo('member', {
            model: 'testUser',
        })
    }
}

afterEach(() => {
    clearModels()
})

test('Inserting with relation set to null', async () => {
    registerModel(TestUser)
    registerModel(TestMembership)

    mockAdapter.addModelTableMetadata('test_memberships', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
        {
            name: 'level',
            type: 'VARCHAR',
        },
        {
            name: 'member_id',
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

    const ex = new TestMembership()
    ex.set({
        level: 'member',
        member: null,
    })

    const [insertSql, insertValues] = await ex.save({
        onlySql: true,
    })

    expect(insertSql).toBe(
        'insert into test_memberships ("level", "member_id") VALUES ($1, $2) RETURNING *'
    )

    expect(insertValues[0]).toBe('member')
    expect(insertValues[1]).toBe(null)
})

class TestUser2 {
    static setup(m) {
        m.hasMany('testMembership2s')
    }
}

class TestMembership2 {
    static setup(m) {
        m.belongsTo('member', {
            model: 'testUser2',
        })
    }
}

test('Inserting with relation set to undefined', async () => {
    registerModel(TestUser2)
    registerModel(TestMembership2)

    mockAdapter.addModelTableMetadata('test_membership2s', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
        {
            name: 'level',
            type: 'VARCHAR',
        },
        {
            name: 'member_id',
            type: 'INTEGER',
        },
    ])

    mockAdapter.addModelTableMetadata('test_user2s', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
    ])

    await prepareModels()

    const ex = new TestMembership2()
    ex.set({
        level: 'member',
        member: undefined,
    })

    const [insertSql, insertValues] = await ex.save({
        onlySql: true,
    })

    expect(insertSql).toBe(
        'insert into test_membership2s ("level", "member_id") VALUES ($1, $2) RETURNING *'
    )

    expect(insertValues[0]).toBe('member')
    expect(insertValues[1]).toBe(undefined)
})
