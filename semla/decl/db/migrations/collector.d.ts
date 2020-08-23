interface FieldOptions {
    null?: boolean;
    default?: any;
}
interface TableObject {
    name: string;
}
declare abstract class MigrationField {
    protected name: string;
    protected options?: FieldOptions;
    type: string;
    constructor(name: any, options: any);
    nullableString(): "" | " NOT NULL";
    abstract ddl(param: TableObject): any;
}
declare class MigratorTable {
    private fields;
    name: string;
    constructor(name: string);
    integer(name: any, options?: FieldOptions): void;
    bigint(name: any, options?: FieldOptions): void;
    text(name: any, options?: FieldOptions): void;
    bool(name: any, options?: FieldOptions): void;
    boolean(name: any, options?: FieldOptions): void;
    timestamp(name: any, options?: FieldOptions): void;
    timestamptz(name: any, options?: FieldOptions): void;
    timestamps(): void;
    generateDDL(): string;
}
declare class FieldCollector {
    type: any;
    tableName: any;
    fields: MigrationField[];
    constructor(type: any, tableName: any);
    bool(name: any, opts: FieldOptions): void;
    boolean(name: any, opts: FieldOptions): void;
    text(name: any, opts: FieldOptions): void;
    integer(name: any, opts: FieldOptions): void;
    timestamp(name: any, opts: FieldOptions): void;
    timestamptz(name: any, opts: FieldOptions): void;
    generateDDL(): string;
}
declare abstract class TableOperation {
    tableName: string;
    constructor(tableName: any);
    abstract ddl(): any;
}
export declare class AlterTable {
    private field;
    operations: TableOperation[];
    add: FieldCollector;
    tableName: any;
    constructor(table: any);
    rename(from: any, to: any): void;
    dropColumn(name: any): void;
    generateOperationDDLs(): string;
    ddl(): string;
}
export declare class MigratorInput {
    private rawQueries;
    private tables;
    private alterTables;
    constructor();
    query(text: any): void;
    alterTable(name: any, cb: (t: AlterTable) => void): void;
    renameTable(nameBefore: string, nameAfter: string): void;
    addTable(name: any, cb: (t: MigratorTable) => void): void;
    generateStatements(): string[];
}
export {};
