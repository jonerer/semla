import { MockDbAdapter } from '../../fw/db/adapters'
import { clearModels, prepareModels, registerModel, setDbAdapter } from '../../fw/db/models'
import { generateAttributesForModel, generateBodyForModel } from '../../fw/db/typegen'
import { withoutWhitespace } from '../templates/templateCompilation'

class User {
    static setup(m) {
        m.hasMany('memberships')
    }
}

class Team {
    static setup(m) {
        m.hasMany('memberships')
    }
}

class Membership {
    static setup(m) {
        m.belongsTo('team')
        m.belongsTo('user')
    }
}

const mockAdapter = new MockDbAdapter()
setDbAdapter(mockAdapter)

// https://www.typescriptlang.org/play?#code/AQ4SwOwFwUwJwGYEMDGNgCUYBsmwCYBiYO+APACoB8wMAHrBPgM7AAKcA9gLZjMyUaAbwBQocPgBcwCAFduAI3hjQAXxEqQKXM1YBVfnGBD147Ul3AKMJN2PqNkWIlTprtgIqz4AT2KlWUXEwfAB+aTlFeGAAH2BmKDhIAHMRByd4ZDRgA3gvX39sFmNNCXCZeSUjOISkiFSHEQB6ACoRAGUAC05ZIuAlYGSYCAgYKREWpo0RDJdsgFkYKLhmTrAABwBBKESwBVlYQNKQiMrlcVhbAEkpCuXSy+5pLFwCQvJ3bipS2UMb0-u4l+8GeODwY3eZFycG+4mwMAAbjhpLUUhozHAbARttIACLgn7rfDg-A44D42BpDRQHzrdCLZarDYAKU4kCQCnh71YAF5gAByR782IC4FwfmOaCZVzABlVJnrfJwPwkIpHYJhAFVEWo+rHfAAfQNEE4UHKkW1NV2eo1RuwZq10StdVStoN9pg5rO1Xi1tSDxs3BuXuWOr9AdsIctvpdIpeJMhnxocU+SpVAXRoDFwcdPt1rqzhijTpjKTjYLeqvI0OTOUMae5VOaTWANLpwAAcpwIABxYbwEly+AK7a7faHYB8gDyvCgZCHKzWWx2SXHMGYABpgAAiELbkXblCYknbfdxbeyIknqDb74zKVzelLeVL9owHYc+ElC6B4s+uTYNgIqfOWrwQlWlCBt8DjmJYC4KgAQhY6BgNw6zwtwwxQKw8FLqOq4HOu36gCcdxVBGQa3Ba5ygI8oJgUQEFJj8fxUd6LEgpgFbgaQUKGLCoDwki2AouGpRHliYxkhSMCEsS2JQHiBIUfRCZMVBpQJHgYAoK2gbSA2VaZiATQtpAWkQNkmFQN0LCae+0gABScAoABW0hdr2-ZwIOz7DnhK57IRzAAJSTjQCJsvgmlIEiTlhTyNAcDwfACLhGx3uIpnAJsGDANZtnMJpUDabpADunTwDATlIHAyQAAzSOlireMq3IJTQSAQD4xWlcArlshANV1Y1sp+YuLKDZ+MDclutXJAAjOUzWGQEHXAF1PXiFpUA6cAnBwPgnGOQgXBPBt3XrZtvW7bpCCQLcJ1neUm3rclvD8PO40KgA2gAugJIA7Xt91MFOoxOadPDSK94XsGdqVfYyS7QRo2Vtk+yMbEh-CTmNWPrDjMAAMLYEVIiwTh31LrQDDDMUzVE-YGgoN2CT5XjoxlfjL4bI5IUiNwAB0-BQI5QSCYiyI7sw25pALIjNULFVVeL+rSPyACs-IbipxHiCApEAMylOoqgK0rA2QI5gqBjr9gC0AA
const expectedAttributes = `interface MembershipAttributes {
    id: number
    teamId: number
    userId: number
    level: string
    createdAt: Date
    updatedAt: Date
    team: RelatedField<Team>
    user: RelatedField<User>
}`

const expectedJoinableFields = `type MembershipJoinableFields = 'team' | 'user'
`

const expectedQueryFields = `interface MembershipQueryFields {
    id?: number | string
    id__not?: number | string
    id__lt?: number | string
    id__lte?: number | string
    id__gt?: number | string
    id__gte?: number | string

    teamId?: number | string
    teamId__not?: number | string
    teamId__lt?: number | string
    teamId__lte?: number | string
    teamId__gt?: number | string
    teamId__gte?: number | string

    userId?: number | string
    userId__not?: number | string
    userId__lt?: number | string
    userId__lte?: number | string
    userId__gt?: number | string
    userId__gte?: number | string
    
    level?: string
    level__not?: string
    
    createdAt?: Date | string
    createdAt__not?: Date | string
    createdAt__lt?: Date | string
    createdAt__lte?: Date | string
    createdAt__gt?: Date | string
    createdAt__gte?: Date | string
    
    updatedAt?: Date | string
    updatedAt__not?: Date | string
    updatedAt__lt?: Date | string
    updatedAt__lte?: Date | string
    updatedAt__gt?: Date | string
    updatedAt__gte?: Date | string
    
    team?: number | string | RelatedField<Team> | TeamQueryFields
    user?: number | string | RelatedField<User> | UserQueryFields
}`

const expectedSettable =`
interface MembershipSettable {
    team?: number | null | Team | RelatedField<Team>
}
`

const expectedBaseClass = `
class MembershipBase implements MembershipAttributes {
    id: number
    level: string
    teamId: number
    userId: number
    createdAt: Date
    updatedAt: Date

    user: RelatedField<User>
    static user: QueryField
    team: RelatedField<Team>
    static team: QueryField

    // instance methods
    set: (obj: NonGeneratedMembershipAttributes) => void
    save: () => Promise<Membership>

    // AR methods
    static where: (arg0: MembershipQueryFields) => any
    static join: (arg0: MembershipJoinableFields, arg1?: MembershipQueryFields) => any
    static order: (from: any) => any
    static find: (from?: any) => Promise<Membership[]>
    static findOne: (from: any) => Promise<Membership>
}`

test('Should generate types for a membership model', async () => {
    registerModel(User)
    registerModel(Membership)
    registerModel(Team)

    mockAdapter.addModelTableMetadata('memberships', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
        {
            name: 'team_id',
            type: 'INTEGER'
        },
        {
            name: 'user_id',
            type: 'INTEGER',
        },
        {
            name: 'level',
            type: 'TEXT'
        },
        {
            name: 'created_at',
            type: 'TIMESTAMPTZ',
        },
        {
            name: 'updated_at',
            type: 'TIMESTAMPTZ',
        },
    ])

    mockAdapter.addModelTableMetadata('users', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
    ])

    mockAdapter.addModelTableMetadata('teams', [
        {
            name: 'id',
            type: 'BIGSERIAL',
        },
    ])

    await prepareModels()

    // @ts-ignore
    const generatedAttributes = generateAttributesForModel(Membership)

    expectEqualNoWhitespace(generatedAttributes.attributesContent, expectedAttributes)

    expect(generatedAttributes.joinableFieldsType).toEqual(expectedJoinableFields)

    expectEqualNoWhitespace(generatedAttributes.queryFieldsContent, expectedQueryFields)
    /*
    // @ts-ignore
    const body = generateBodyForModel(Membership, [User, Team, Membership])

    expect(body).toEqual(expectedBody)
     */
})

const expectEqualNoWhitespace = (one, two) => {
    expect(withoutWhitespace(one)).toEqual(withoutWhitespace(two))
}

afterEach(() => {
    clearModels()
})