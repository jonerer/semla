import {
    clearModels,
    prepareModels,
    registerModel,
    setDbAdapter,
} from '../../fw/db/models'
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

    mockAdapter.addModelTableMetadata('users', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
    ])
    mockAdapter.addModelTableMetadata('memberships', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
        {
            name: 'level',
            type: 'TEXT',
        },
        {
            name: 'team_id',
            type: 'INTEGER',
        },
        {
            name: 'user_id',
            type: 'INTEGER',
        },
    ])
    mockAdapter.addModelTableMetadata('teams', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
        {
            name: 'name',
            type: 'TEXT',
        },
        {
            name: 'creator_id',
            type: 'INTEGER',
        },
    ])
    registerModel(User)
    registerModel(Membership)
    registerModel(Team)

    await prepareModels()
})

class Example {}
class Membership {
    static setup(m) {
        m.belongsTo('team')
        m.belongsTo('user')
    }

    static validation(v) {
        v.present('team')
    }
}

class User {
    static setup(m) {
        m.hasMany('teams')
    }
}

class Team {
    static setup(m) {
        m.hasMany('memberships')
        m.belongsTo('creator', {
            model: 'User',
        })
    }

    static validation(v) {}
}

test('Should be able to produce IN() queries', async () => {
    const findInSql = await Example.where({
        id__in: [5, 10, 12],
    }).sql()[0]

    /*
    Should I implement this? Or too ripe for misuse by for instance passing in an array-like via HTTP parameters?

    const findInSqlAuto = await Example.where({
        id: [5, 10, 12]
    }).sql()[0]

    expect(findInSql).toEqual(findInSqlAuto)
     */

    expect(findInSql.split('\n').join(' ')).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."id" = ANY ($1)'
    )
})

/*
test('Should be able to give \'findOne()\' a whole selector thing', async () => {
    const findOneSql = await Example.findOne({

    })
})
 */

test('Should handle related field querying', async () => {
    const team = new Team()
    team.set({
        id: 1,
        creatorId: 100,
    })
    const memb = await Membership.findOne({ team }, { onlySql: true })

    expect(memb.split('\n').join(' ')).toBe(
        'SELECT m."id", m."level", m."team_id", m."user_id" FROM memberships m INNER JOIN teams t      ON m.team_id = t.id WHERE t."id" = $1'
    )

    const someMembership = new Membership()
    someMembership.set({
        teamId: 5,
    })
    const memb2 = await Membership.find(
        { user: team.creator },
        { onlySql: true }
    )

    expect(memb2.split('\n').join(' ')).toBe(
        'SELECT m."id", m."level", m."team_id", m."user_id" FROM memberships m INNER JOIN users u      ON m.user_id = u.id WHERE u."id" = $1'
    )
})

test('Should handle simple query operations', async () => {
    const findOneSql = await Example.findOne(5, { onlySql: true })

    expect(findOneSql.split('\n').join(' ')).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."id" = $1'
    )

    const findOneWhere = await Example.where({
        id: 5,
    }).sql()[0]

    expect(findOneWhere).toEqual(findOneSql)

    expect(findOneSql.split('\n').join(' ')).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."id" = $1'
    )

    const findOneByObject = await Example.findOne(
        {
            id: 5,
        },
        { onlySql: true }
    )

    expect(findOneByObject).toEqual(findOneSql)

    const findSql = await Example.find([Example.exampleField, 'fniss'], {
        onlySql: true,
    })

    expect(findSql.split('\n').join(' ')).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."example_field" = $1'
    )
})

test('Should be able to produce sorting SQL', async () => {
    const findOneSql = Example.order([Example.exampleField, 'ASC']).sql()[0]

    expect(findOneSql.split('\n').join(' ')).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e  ORDER BY e."example_field" ASC'
    )
})

test('Should be able to produce limit SQL', async () => {
    const findOneSql = Example.limit(10).sql()[0]

    expect(findOneSql.split('\n').join(' ')).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e  LIMIT 10'
    )
})

test('Should be able to compare to NULL', async () => {
    const findOneSql = Example.where([Example.exampleField, null]).sql()[0]

    expect(
        findOneSql
            .trim()
            .split('\n')
            .join(' ')
    ).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."example_field" IS NULL'
    )
})

test('Should be able to compare to NOT NULL', async () => {
    const findOneSql = Example.where([Example.exampleField__not, null]).sql()[0]

    expect(
        findOneSql
            .trim()
            .split('\n')
            .join(' ')
    ).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."example_field" IS NOT NULL'
    )
})

test('Should be able to compare to NOT NULL', async () => {
    const findOneSql = Example.where([Example.exampleField__not, 5]).sql()[0]

    expect(
        findOneSql
            .trim()
            .split('\n')
            .join(' ')
    ).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."example_field" != $1'
    )
})

test('Should be able to compare with an AND', async () => {
    const findOneSql = Example.where([Example.exampleField__not, 5])
        .where(Example.id, 10)
        .sql()[0]

    expect(
        findOneSql
            .trim()
            .split('\n')
            .join(' ')
    ).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."example_field" != $1 AND e."id" = $2'
    )
})

test('Should be able to combine two ANDs, an order and a LIMIT', async () => {
    const findOneSql = Example.where([Example.exampleField__not, 5])
        .where(Example.id, 10)
        .order(Example.createdAt, 'ASC')
        .limit(30)
        .sql()[0]

    const findOneSql2 = Example.order([Example.createdAt, 'ASC'])
        .where(Example.exampleField__not, 5)
        .where(Example.id, 5)
        .limit(30)
        .sql()[0]

    expect(
        findOneSql
            .trim()
            .split('\n')
            .join(' ')
    ).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."example_field" != $1 AND e."id" = $2 ORDER BY e."created_at" ASC LIMIT 30'
    )

    expect(findOneSql2).toBe(findOneSql)
})

test('Should be able to pass order via array or two params', () => {
    const qb1 = Example.order([Example.id, 'ASC'])
    const qb2 = Example.order(Example.id, 'ASC')
    const qb3 = Example.where().order(Example.id, 'ASC')

    expect(qb1.orderings.length).toBe(1)
    expect(qb1.orderings[0][1]).toBe('ASC')
    expect(qb1.orderings).toEqual(qb2.orderings)
    expect(qb2.orderings).toEqual(qb3.orderings)
})

test('Should be able to pass in a param *after* a null-parameter', async () => {
    const findOneSql = Example.where([Example.exampleField__not, null])
        .where(Example.id, 2)
        .sql()[0]

    expect(
        findOneSql
            .trim()
            .split('\n')
            .join(' ')
    ).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."example_field" IS NOT NULL  AND e."id" = $1'
    )
})

test('Should be able to "less than" queries', async () => {
    const findOneSql = Example.where(
        Example.exampleField__lt,
        '2020-08-23'
    ).sql()[0]

    expect(
        findOneSql
            .trim()
            .split('\n')
            .join(' ')
    ).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."example_field" < $1'
    )
})

test('Should be able to "less than or equal" queries', async () => {
    const findOneSql = Example.where(
        Example.exampleField__lte,
        '2020-08-23'
    ).sql()[0]

    expect(
        findOneSql
            .trim()
            .split('\n')
            .join(' ')
    ).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."example_field" <= $1'
    )
})

test('Should be able to "greater than" queries', async () => {
    const findOneSql = Example.where(
        Example.exampleField__gt,
        '2020-08-23'
    ).sql()[0]

    expect(
        findOneSql
            .trim()
            .split('\n')
            .join(' ')
    ).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."example_field" > $1'
    )
})

test('Should be able to "greater than or equal" queries', async () => {
    const findOneSql = Example.where(
        Example.exampleField__gte,
        '2020-08-23'
    ).sql()[0]

    expect(
        findOneSql
            .trim()
            .split('\n')
            .join(' ')
    ).toBe(
        'SELECT e."id", e."example_field", e."created_at" FROM examples e WHERE e."example_field" >= $1'
    )
})
