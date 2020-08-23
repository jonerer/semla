import { pluralize, singularize } from '../../fw/utils'

test('Make sure pluralize can handle common English word endings', () => {
    expect(pluralize('Chair')).toBe('Chairs')
    expect(pluralize('Category')).toBe('Categories')
    expect(pluralize('Person')).toBe('People')
    expect(pluralize('Leaf')).toBe('Leaves')
    expect(pluralize('Key')).toBe('Keys')
    expect(pluralize('TwoFactorKey')).toBe('TwoFactorKeys')
})

test('Make sure singularize can handle common English word endings', () => {
    expect(singularize('Chairs')).toBe('Chair')
    expect(singularize('Categories')).toBe('Category')
    expect(singularize('People')).toBe('Person')
    expect(singularize('Leaves')).toBe('Leaf')
    expect(singularize('Keys')).toBe('Key')
})
