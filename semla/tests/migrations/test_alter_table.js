import { MigratorInput } from '../../fw/db/migrations/collector'

class ExampleTableCreationMigration {
    change(m) {
        m.alterTable('posts', t => {
            t.add.integer('category_id', {
                null: false,
            })
            t.add.bool('published', {
                null: false,
                default: false,
            })
        })
    }
}

test('Adding a couple of fields, with options', () => {
    const migrator = new MigratorInput()
    const mInst = new ExampleTableCreationMigration()
    mInst.change(migrator)
    const generatedDDL = migrator.generateStatements()

    expect(generatedDDL.length).toBe(1)
    expect(generatedDDL[0]).toBe(`alter table posts
\tadd category_id int NOT NULL;
alter table posts
\tadd published boolean NOT NULL DEFAULT false;`)
})
