import { MigrationCreationService } from '../../fw/devtools/services/MigrationCreationService'

test('Should generate a valid migration file', () => {
    const serv = new MigrationCreationService()
    let input = {
        name: '2020-02-20_10-20_CreateTableAsdf',
        changes: [
            { type: 'createTable', tableName: 'CreateTable' },
            { type: 'alterTable', tableName: 'Cat' },
        ],
    }
    serv.input(input)
    const generated = serv.generateMigrationFile()

    const content = `export default class Migration_20200220_1020_CreateTableAsdf {
    change(m) {
        m.addTable('CreateTable', t => {
            // add your columns here...
            t.timestamps()
        })

        m.alterTable('cat', t => {
            // make your changes here...
        })
    }
}
`

    expect(generated.name).toBe(input.name)
    expect(generated.contents).toBe(content)
})
