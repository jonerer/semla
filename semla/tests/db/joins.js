import {
    clearModels,
    prepareModels,
    registerModel,
    setDbAdapter,
} from '../../fw/db/models'
import { MockDbAdapter } from '../../fw/db/adapters'
import {
    forceRunMigrationClass,
    runMigrations,
} from '../../fw/db/migrations/migration'

/*
Let's mock this instead. keeping it here in case I want this for something else in the future.

Hm... or maybe with an sqlite db...
class Migration_20200220_1429_CreateTables {
    change(m) {
        m.addTable('test_users', t => {
            t.text('email')
            t.timestamps()
        })

        m.addTable('test_memberships', t => {
            t.text('level')
            t.integer('test_user_id')
            t.integer('test_team_id')
            t.timestamps()
        })

        m.addTable('test_teams', t => {
            t.text('name')
            t.timestamps()
        })
    }
}
 */

class TestUser {
    static setup(m) {
        m.hasMany('testMemberships')
    }
}

class TestMembership {
    static setup(m) {
        m.belongsTo('testUser')
        m.belongsTo('testTeam')
    }

    static validation(v) {
        v.present('testUser')
        v.present('testTeam')
    }
}

class TestTeam {
    static setup(m) {
        m.hasMany('testMemberships')
    }
}

test('Should handle a three table join', async () => {
    /*
    try {
        await forceRunMigrationClass(Migration_20200220_1429_CreateTables)
    } catch (e) {} // only works once, then the tables already exist
     */
    const mockAdapter = new MockDbAdapter()
    setDbAdapter(mockAdapter)

    mockAdapter.addModelTableMetadata('test_users', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
        {
            name: 'email',
            type: 'TEXT'
        }
    ])
    mockAdapter.addModelTableMetadata('test_memberships', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
        {
            name: 'level',
            type: 'TEXT'
        },
        {
            name: 'test_user_id',
            type: 'INTEGER'
        },
        {
            name: 'test_team_id',
            type: 'INTEGER'
        },
    ])
    mockAdapter.addModelTableMetadata('test_teams', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
        {
            name: 'name',
            type: 'TEXT'
        }
    ])

    registerModel(TestUser)
    registerModel(TestMembership)
    registerModel(TestTeam)
    await prepareModels()

    const me = new TestUser()
    me.email = 'mejl'
    await me.save()

    const teamOne = new TestTeam()
    teamOne.name = 'ett'
    await teamOne.save()

    const teamTwo = new TestTeam()
    teamTwo.name = 'två'
    await teamTwo.save()

    const membone = new TestMembership()
    membone.set({
        testTeam: teamOne,
        testUser: me,
        level: 'user',
    })
    membone.save()

    const membtwo = new TestMembership()
    membtwo.set({
        testTeam: teamTwo,
        testUser: me,
        level: 'admin',
    })
    await membtwo.save()

    // lets get the teams where I'm an admin, to try out some joining
    const queryBuilder = TestTeam.join(TestTeam.testMemberships) // a hasMany relation
        .join(TestMembership.testUser) // a belongsTo relation
        .where(TestMembership.level, 'admin')
        .where(TestUser.id, me.id)

    const generatedSql = queryBuilder.sql()

    const [sql, data] = generatedSql

    expect(data.length).toBe(2)
    expect(data[0]).toBe('admin')
    expect(data[1]).toBe(me.id)

    const expectedSql =
        'SELECT t."id", t."name", t."created_at", t."updated_at"\n' +
        'FROM test_teams t\n' +
        'JOIN test_memberships t1 \n' +
        '    ON t1."test_team_id" = t."id"\n' +
        'JOIN test_users t2 \n' +
        '    ON t1."test_user_id" = t2."id"\n' +
        'WHERE t1."level" = $1 AND  t2."id" = $2'

    expect(sql).toBe(expectedSql)

    const queryResult = await queryBuilder.get()
    expect(queryResult.length).toBe(1)
    expect(queryResult[0].name).toBe('två')
})
