import { MigratorInput } from '../../fw/db/migrations/collector'

class ExampleTableCreationMigration {
    change(m) {
        m.addTable('users', t => {
            t.text('name')
            t.text('email')
            t.timestamps()
        })
    }
}

test('Creation of a simple table with text and timestamps', () => {
    const migrator = new MigratorInput()
    const mInst = new ExampleTableCreationMigration()
    mInst.change(migrator)
    const generatedDDL = migrator.generateStatements()

    expect(generatedDDL.length).toBe(1)
    expect(generatedDDL[0]).toBe(`create table users
(
\tid bigserial not null
\t\tconstraint users_id_pk
\t\t\tprimary key,
\tname text,
\temail text,
\tcreated_at timestamptz NOT NULL,
\tupdated_at timestamptz
);

`)
})

class ExampleBooleansTable {
    change(m) {
        m.addTable('users', t => {
            t.boolean('hejsan')
            t.timestamptz('wut')
            t.timestamps()
        })
    }
}

test('Creation of booleans', () => {
    const migrator = new MigratorInput()
    const mInst = new ExampleBooleansTable()
    mInst.change(migrator)
    const generatedDDL = migrator.generateStatements()

    expect(generatedDDL.length).toBe(1)
    expect(generatedDDL[0]).toBe(`create table users
(
\tid bigserial not null
\t\tconstraint users_id_pk
\t\t\tprimary key,
\thejsan boolean,
\twut timestamptz,
\tcreated_at timestamptz NOT NULL,
\tupdated_at timestamptz
);

`)
})

class ExampleTableAlteringMigration {
    change(m) {
        m.alterTable('users', t => {
            t.add.integer('cat_id')
            t.add.text('mintext')
        })
    }
}

test('altering a table to add a field', () => {
    const migrator = new MigratorInput()
    const mInst = new ExampleTableAlteringMigration()
    mInst.change(migrator)

    const generatedDDL = migrator.generateStatements()

    expect(generatedDDL.length).toBe(1)
    expect(generatedDDL[0]).toBe(`alter table users
\tadd cat_id int;
alter table users
\tadd mintext text;`)
})

class ExampleSqlMigration {
    change(m) {
        m.query('SELECT 1 FROM hejsan')
        m.query('SELECT RAND() > 0.5')
    }
}

test('Running raw sql', () => {
    const migrator = new MigratorInput()
    const mInst = new ExampleSqlMigration()

    mInst.change(migrator)

    const generatedDDL = migrator.generateStatements()

    expect(generatedDDL.length).toBe(2)
    expect(generatedDDL[0]).toBe('SELECT 1 FROM hejsan')
    expect(generatedDDL[1]).toBe('SELECT RAND() > 0.5')
})

export const stmts = cls => {
    const migrator = new MigratorInput()
    const mInst = new cls()

    mInst.change(migrator)

    const generatedDDL = migrator.generateStatements()
    return generatedDDL
}

class ExampleFieldRenaming {
    change(m) {
        m.alterTable('users', t => {
            t.rename('createdat', 'created_at')
        })
    }
}

test('Renaming a field', () => {
    const ddl = stmts(ExampleFieldRenaming)

    expect(ddl[0]).toBe(
        `alter table users
\trename column createdat to created_at;`
    )
})

class ExampleCreateAllFieldTypes {
    change(m) {
        m.addTable('users', t => {
            t.boolean('hejsan')
            t.bigint('biggus')
            t.timestamptz('wut')
            t.timestamps()
        })
    }
}

test('Add various field types to a new table', () => {
const ddl = stmts(ExampleCreateAllFieldTypes)

    expect(ddl[0]).toBe(`create table users
(
\tid bigserial not null
\t\tconstraint users_id_pk
\t\t\tprimary key,
\thejsan boolean,
\tbiggus bigint,
\twut timestamptz,
\tcreated_at timestamptz NOT NULL,
\tupdated_at timestamptz
);

`)
})
