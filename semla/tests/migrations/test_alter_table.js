import { MigratorInput } from '../../fw/db/migrations/collector'
import { stmts } from './testSqlGeneration'

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
\tadd published boolean NOT NULL DEFAULT false;
`)
})

class ExampleTableRenaming {
    change(m) {
        m.renameTable('tag', 'tags')
    }
}

test('renaming a table', () => {
    const migrator = new MigratorInput()
    const mInst = new ExampleTableRenaming()
    mInst.change(migrator)
    const generatedDDL = migrator.generateStatements()

    const exp = `alter table tag rename to tags;\n`;

    expect(generatedDDL.length).toBe(1)
    expect(generatedDDL[0]).toBe(exp)
})

class Migration_20200725_1106_AlterLocalFiles {
    change(m) {
        m.alterTable('local_files', t => {
            // make your changes here...
            t.dropColumn('base_path')
            t.add.integer('base_path_id')
        })
    }
}

test('dropping a column', () => {
    const ddl = stmts(Migration_20200725_1106_AlterLocalFiles)

    expect(ddl.length).toBe(1)
    expect(ddl[0]).toBe(`alter table local_files
\tdrop column base_path;
alter table local_files
\tadd base_path_id int;
`)
})
