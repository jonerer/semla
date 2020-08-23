interface FieldOptions {
    null?: boolean
    default?: any
}

interface TableObject {
    name: string
}

abstract class MigrationField {
    protected name: string
    protected options?: FieldOptions
    public type: string

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

    abstract ddl(param: TableObject): any
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

class BigintField extends MigrationField {
    constructor(name, options) {
        super(name, options)
        this.type = 'bigint'
    }

    ddl() {
        return `${this.name} bigint${this.nullableString()}`
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
    constructor(name, options?) {
        super(name, options)
        this.type = 'timestamptz'
    }

    ddl() {
        const optionsText = this.nullableString()
        return `${this.name} timestamptz${optionsText}`
    }
}

class PrimaryKeyField extends MigrationField {
    constructor(name, options?) {
        super(name, options)
        this.type = 'primary_key'
    }

    ddl(table: MigratorTable) {
        return `${this.name} bigserial not null
\t\tconstraint ${table.name}_${this.name}_pk
\t\t\tprimary key`
    }
}

class MigratorTable {
    private fields: MigrationField[]
    public name: string

    constructor(name: string) {
        this.fields = []
        this.name = name

        this.fields.push(new PrimaryKeyField('id'))
    }

    integer(name, options?: FieldOptions) {
        this.fields.push(new IntegerField(name, options))
    }

    bigint(name, options?: FieldOptions) {
        this.fields.push(new BigintField(name, options))
    }

    text(name, options?: FieldOptions) {
        this.fields.push(new TextField(name, options))
    }

    bool(name, options?: FieldOptions) {
        this.fields.push(new BoolField(name, options))
    }

    boolean(name, options?: FieldOptions) {
        return this.bool(name, options)
    }

    timestamp(name, options?: FieldOptions) {
        this.fields.push(new TimestamptzField(name, options))
    }

    timestamptz(name, options?: FieldOptions) {
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

    generateDDL() {
        let ddl = ''
        ddl += `create table ${this.name}\n(\n`
        let idx = 0
        for (const field of this.fields) {
            ddl += `\t${field.ddl(this)}`
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
    public type: any
    tableName: any
    fields: MigrationField[]

    constructor(type, tableName) {
        this.type = type
        this.fields = []
        this.tableName = tableName
    }

    bool(name, opts: FieldOptions) {
        this.fields.push(new BoolField(name, opts))
    }

    boolean(name, opts: FieldOptions) {
        return this.bool(name, opts)
    }

    text(name, opts: FieldOptions) {
        this.fields.push(new TextField(name, opts))
    }

    integer(name, opts: FieldOptions) {
        this.fields.push(new IntegerField(name, opts))
    }

    timestamp(name, opts: FieldOptions) {
        this.fields.push(new TimestamptzField(name, opts))
    }

    timestamptz(name, opts: FieldOptions) {
        this.fields.push(new TimestamptzField(name, opts))
    }

    generateDDL() {
        let toRet = ''
        let i = 0
        const tableinfo = {
            name: this.tableName
        }
        for (const f of this.fields) {
            toRet += `alter table ${this.tableName}\n\tadd ${f.ddl(tableinfo)};`
            i++
            if (i !== this.fields.length) {
                toRet += '\n'
            }
        }
        return toRet
    }
}

abstract class TableOperation {
    tableName: string

    constructor(tableName) {
        this.tableName = tableName
    }

    abstract ddl()
}

class DropColumnOperation extends TableOperation {
    private name: any
    constructor(tableName, name) {
        super(tableName)
        this.name = name
    }

    ddl() {
        return `alter table ${this.tableName}\n\tdrop column ${this.name};`
    }
}

/*
class ChangeColumnType {
    constructor(tableName, name, targetType) {
        this.tableName = tableName
        this.name = name
        this.targetType = targetType
    }

    ddl() {
        return `alter table ${this.tableName}\n\trename column ${op.from} to ${op.to};`
    }
}
 */

class RenameColumnOperation extends TableOperation {
    private from: any
    private to: any

    constructor(tableName, from, to) {
        super(tableName)
        this.tableName = tableName
        this.from = from
        this.to = to
    }

    ddl() {
        return `alter table ${this.tableName}\n\trename column ${this.from} to ${this.to};`
    }
}

export class AlterTable {
    private field: null
    operations: TableOperation[]
    add: FieldCollector
    tableName: any

    constructor(table) {
        this.tableName = table
        this.field = null

        this.operations = []
        this.add = new FieldCollector('add', table)
    }

    rename(from, to) {
        this.operations.push(new RenameColumnOperation(this.tableName, from, to))
    }

    dropColumn(name) {
        this.operations.push(new DropColumnOperation(this.tableName, name))
    }

    /*
    changeType(name, to) {
        this.operations.push(new ChangeColumnType(this.tableName, name, to))
    }
     */

    generateOperationDDLs() {
        let stmts: string[] = []
        for (const op of this.operations) {
            stmts.push(
                op.ddl()
            )
        }
        return stmts.join('\n').trim()
    }

    ddl() {
        const opers = this.generateOperationDDLs()
        const addStmts = this.add.generateDDL()

        let retval = ''
        if (opers !== '') {
            retval += opers
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

class RenameTable extends TableOperation {
    private _nameAfter: any

    constructor(tableName, nameAfter) {
        super(tableName)
        this._nameAfter = nameAfter
    }

    ddl() {
        return 'alter table ' + this.tableName + ' rename to ' + this._nameAfter + ';'
    }
}

export class MigratorInput {
    private rawQueries: string[]
    private tables: any[]
    private alterTables: TableOperation[]

    constructor() {
        this.tables = []
        this.alterTables = []
        this.rawQueries = []
    }

    query(text) {
        this.rawQueries.push(text)
    }

    alterTable(name, cb: (t: AlterTable) => void) {
        const table = new AlterTable(name)
        this.alterTables.push(table)
        cb(table)
    }

    renameTable(nameBefore: string, nameAfter: string) {
        this.alterTables.push(new RenameTable(nameBefore, nameAfter))
    }

    addTable(name, cb: (t: MigratorTable) => void) {
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
            ddl += adder.ddl() + '\n'
        }

        // then any queries
        let toRet: string[] = []
        if (ddl !== '') {
            toRet.push(ddl)
        }
        if (this.rawQueries.length > 0) {
            toRet = [...toRet, ...this.rawQueries]
        }
        return toRet
    }
}
