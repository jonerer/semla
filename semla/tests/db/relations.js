import { forceRunMigrationClass } from '../../fw/db/migrations/migration'
import {
    clearModels,
    prepareModels,
    registerModel,
    setDbAdapter,
} from '../../fw/db/models'
import { MockDbAdapter } from '../../fw/db/adapters'

// https://devhints.io/knex is really cool. I should have something like that.

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

const mockAdapter = new MockDbAdapter()
setDbAdapter(mockAdapter)

afterEach(() => {
    clearModels()
})

test('Should be able to resolve a belongsTo with specific model', async () => {
    registerModel(TestUser)
    registerModel(TestMembership)

    mockAdapter.addModelTableMetadata('test_memberships', [
        {
            name: 'id',
            type: 'BIGSERIAL',
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

    // adding the condition on the querybuilder's target model as a join condition
    const queryBuilder = TestMembership.join(TestMembership.member, {
        memberId: 5
    })

    const generatedSql = queryBuilder.sql()

    const [sql, data] = generatedSql

    expect(data.length).toBe(1)
    expect(data[0]).toBe(5)

    const expectedSql = `SELECT t."id", t."member_id"
FROM test_memberships t
JOIN test_users t1 
    ON t.member_id = t1.id
WHERE t."member_id" = $1`

    expect(sql).toBe(expectedSql)

    // adding the condition on the querybuilder's target model as a where condition
    const queryBuilder2 = TestMembership.join(TestMembership.member).where({
        memberId: 5
    })

    const generated2 = queryBuilder2.sql()[0]

    expect(generated2).toBe(`SELECT t."id", t."member_id"
FROM test_memberships t
JOIN test_users t1 
    ON t.member_id = t1.id
WHERE t."member_id" = $1`)

    // adding the condition on the relation target model
    // meaning here we ask for a specific *user* id
    const queryBuilder3 = TestMembership.join(TestMembership.member).where({
        member: {
            id: 5,
        }
    })

    const generated3 = queryBuilder3.sql()[0]

    expect(generated3).toBe(`SELECT t."id", t."member_id"
FROM test_memberships t
JOIN test_users t1 
    ON t.member_id = t1.id
WHERE t1."id" = $1`)

    // autojoining query
    const autojoiningQuery = TestMembership.where({
        member: {
            id: 5
        }
    })

    const autojoined = autojoiningQuery.sql()[0]

    expect(autojoined).toBe(generated3)
})

test('Should be able to query using the instance in addition to using an id.', async () => {
    registerModel(TestUser)
    registerModel(TestMembership)

    mockAdapter.addModelTableMetadata('test_memberships', [
        {
            name: 'id',
            type: 'BIGSERIAL',
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

    const userInstance = new TestUser()
    userInstance.id = 5

    const standardSql = TestMembership.where(TestMembership.member, 5).sql()

    const relatedSql = TestMembership.where(
        TestMembership.member,
        userInstance
    ).sql()

    expect(standardSql[0]).toBe(relatedSql[0])
    expect(standardSql[1]).toStrictEqual(relatedSql[1])

    expect(standardSql[1]).toStrictEqual([5])
})
