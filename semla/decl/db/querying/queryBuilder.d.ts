export class QueryField {
    constructor(model: any, field: any, operator: any);
    field: any;
    model: any;
    name: any;
    dbName: any;
    operator: any;
    relation: any;
    setRelation(rel: any): void;
    needsIdx(value: any): boolean;
    sql(alias: any, value: any, paramId: any): string | undefined;
}
export class QueryBuilder {
    conditions: any[];
    joinFields: any[];
    aliases: {};
    orderings: any[];
    limitCount: number;
    joinedColumnNames(): any;
    join(relation: any): QueryBuilder;
    isAliasAvailable(str: any): boolean;
    setUpAliases(): void;
    getAlias(model: any): any;
    joinTablesString(): string;
    conditionsString(values: any): string;
    sql(): (string | any[])[];
    limitStr(): string;
    orderingStr(): string;
    first(): Promise<any>;
    one(): Promise<any>;
    query(): Promise<any[]>;
    all(): void;
    get(): Promise<any[]>;
    targetModel(model: any): void;
    model: any;
    addConditions(conditions: any): void;
    addCondition(param: any): void;
    order(param: any, direction: any): QueryBuilder;
    limit(count: any): QueryBuilder;
    where(...args: any[]): QueryBuilder;
}
