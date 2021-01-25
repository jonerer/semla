export class DbAdapter {
    getModelTableMetadata(): void;
}
export class PostgresDbAdapter extends DbAdapter {
    typeIdToString(tableName: any, name: any, dataTypeId: any): "BOOL" | "BIGSERIAL" | "INTEGER" | "REAL" | "TEXT" | "VARCHAR" | "TIMESTAMP" | "TIMESTAMPTZ" | "DECIMAL";
}
export class MockDbAdapter extends DbAdapter {
    metas: {};
    allEmpty: boolean;
    addModelTableMetadata(modelName: any, metas: any): void;
    setAllEmpty(): void;
}
