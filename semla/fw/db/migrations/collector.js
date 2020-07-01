class MigrationField {
    constructor(name, options) {
        this.name = name
        this.options = options
    }

    nullableString() {
        if (this.options?.null === false) {
            return ' NOT NULL'
        }
        return ''
    }
}

class BoolField extends MigrationField {
    constructor(name, options) {
        super(name, options)
        this.type = 'boolean'
    }

    defaultString() {
        if (this.options?.default !== undefined) {
            return ' DEFAULT ' + (this.options.default ? 'true' : 'false')
        }
        return ''
    }

    ddl() {
        return `${
            this.name
        } boolean${this.nullableString()}${this.defaultString()}`
    }
}

class IntegerField extends MigrationField {
    constructor(name, options) {
        super(name, options)
        this.type = 'integer'
    }

    ddl() {
        return `${this.name} int${this.nullableString()}`
    }
}

class TextField extends MigrationField {
    constructor(name, options) {
        super(name, options)
        this.type = 'text'
    }

    ddl() {
        return `${this.name} text${this.nullableString()}`
    }
}

class TimestamptzField extends MigrationField {
    constructor(name, options) {
        super(name, options)
        this.type = 'timestamptz'
    }

    ddl() {
        const optionsText = this.nullableString()
        return `${this.name} timestamptz${optionsText}`
    }
}

class MigratorTable {
    constructor(name) {
        this.fields = []
        this.name = name

        this.fields.push({
            type: 'primary_key',
            name: 'id',
        })
    }

    text(name, options) {
        this.fields.push(new TextField(name, options))
    }

    bool(name, options) {
        this.fields.push(new BoolField(name, options))
    }

    boolean(name, options) {
        return this.bool(name, options)
    }

    timestamp(name, options) {
        this.fields.push(new TimestamptzField(name, options))
    }

    timestamptz(name, options) {
        this.fields.push(new TimestamptzField(name, options))
    }

    timestamps() {
        this.fields.push(
            new TimestamptzField('created_at', {
                null: false,
            })
        )

        this.fields.push(new TimestamptzField('updated_at'))
    }

    integer(name, options) {
        this.fields.push(new IntegerField(name, options))
    }

    generateDDL() {
        let ddl = ''
        ddl += `create table ${this.name}\n(\n`
        let idx = 0
        for (const field of this.fields) {
            switch (field.type) {
                case 'primary_key':
                    ddl += `\t${field.name} bigserial not null
\t\tconstraint ${this.name}_${field.name}_pk
\t\t\tprimary key`
                    break
                case 'text':
                    ddl += `\t${field.ddl()}`
                    break
                case 'boolean':
                    ddl += `\t${field.ddl()}`
                    break
                case 'integer':
                    ddl += `\t${field.ddl()}`
                    break
                case 'timestamptz':
                    ddl += `\t${field.ddl()}`
                    break
            }
            if (idx !== this.fields.length - 1) {
                ddl += ','
            }
            ddl += '\n'
            idx++
        }
        ddl += ');\n'
        return ddl
    }
}

class FieldCollector {
    constructor(type, tableName) {
        this.type = type
        this.fields = []
        this.tableName = tableName
    }

    bool(name, opts) {
        this.fields.push(new BoolField(name, opts))
    }

    boolean(name, opts) {
        return this.bool(name, opts)
    }

    text(name, opts) {
        this.fields.push(new TextField(name, opts))
    }

    integer(name, opts) {
        this.fields.push(new IntegerField(name, opts))
    }

    timestamp(name, opts) {
        this.fields.push(new TimestamptzField(name, opts))
    }

    timestamptz(name, options) {
        this.fields.push(new TimestamptzField(name, options))
    }

    generateDDL() {
        let toRet = ''
        let i = 0
        for (const f of this.fields) {
            toRet += `alter table ${this.tableName}\n\tadd ${f.ddl()};`
            i++
            if (i !== this.fields.length) {
                toRet += '\n'
            }
        }
        return toRet
    }
}

class AlterTable {
    constructor(table) {
        this.tableName = table
        this.field = null

        this.renameOperations = []
        this.add = new FieldCollector('add', table)
    }

    rename(from, to) {
        this.renameOperations.push({ from, to })
    }

    generateRenamings() {
        let stmts = []
        for (const op of this.renameOperations) {
            stmts.push(
                `alter table ${this.tableName}\n\trename column ${op.from} to ${op.to};`
            )
        }
        return stmts.join('\n').trim()
    }

    generateDDL() {
        const addStmts = this.add.generateDDL()
        const renameStmts = this.generateRenamings()

        let retval = ''
        if (renameStmts !== '') {
            retval += renameStmts
            if (addStmts !== '') {
                retval += '\n'
            }
        }

        if (addStmts !== '') {
            retval += addStmts
        }

        return retval
    }
}

export class MigratorInput {
    constructor() {
        this.tables = []
        this.alterTables = []
        this.rawQueries = []
    }

    query(text) {
        this.rawQueries.push(text)
    }

    alterTable(name, cb) {
        const table = new AlterTable(name)
        this.alterTables.push(table)
        cb(table)
    }

    addTable(name, cb) {
        const table = new MigratorTable(name)
        this.tables.push(table)
        cb(table)
    }

    generateStatements() {
        // first any ddl:s
        let ddl = ''
        for (const table of this.tables) {
            ddl += table.generateDDL() + '\n'
        }
        for (const adder of this.alterTables) {
            ddl += adder.generateDDL()
        }

        // then any queries
        let toRet = []
        if (ddl !== '') {
            toRet.push(ddl)
        }
        if (this.rawQueries.length > 0) {
            toRet = [...toRet, ...this.rawQueries]
        }
        return toRet
    }
}
