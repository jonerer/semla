import { ModelInstance, ModelType } from '../models';
import { Field } from './fields';
type SqlOperators = '=' | '!=' | '<' | '<=' | '>' | '>=' | 'ANY';
export declare class QueryField {
    private field;
    model: ModelType;
    private name;
    dbName: any;
    private operator;
    relation?: Field;
    constructor(model: ModelType, field: Field, operator: SqlOperators);
    setRelation(rel: any): void;
    needsIdx(value: any): boolean;
    sql(alias: any, value: any, paramId: any): string | undefined;
}
export declare class QueryBuilder {
    private conditions;
    private joinFields;
    private aliases;
    private orderings;
    private limitCount;
    private model;
    constructor();
    joinedColumnNames(): string;
    join(...conditions: any[]): this;
    isJoinedWith(relation: any): boolean;
    isAliasAvailable(str: any): boolean;
    setUpAliases(): void;
    getAlias(model: any): string;
    joinTablesString(): string;
    conditionsString(values: any): string;
    sql(): (string | never[])[];
    limitStr(): string;
    orderingStr(): string;
    first(): Promise<ModelInstance>;
    one(): Promise<ModelInstance>;
    query(): Promise<ModelInstance[]>;
    all(): void;
    get(): Promise<ModelInstance[]>;
    targetModel(model: any): void;
    addConditions(conditions: any): void;
    addCondition(param: any): void;
    order(param: any, direction: any): this;
    limit(count: any): this;
    where(...args: any[]): this;
}
export {};
