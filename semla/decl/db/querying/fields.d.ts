import { ModelType } from '../models';
export declare const jsifyFieldName: (underscored_name: any) => string;
export declare const dbIfyJsName: (jsName: any) => any;
declare type FieldTypes = 'hasMany' | 'belongsTo';
export declare class Field {
    dbName: string;
    jsName: string;
    type: FieldTypes;
    relation: boolean;
    targetModel?: ModelType;
    model: ModelType;
    tsType: string;
    static typeStringToTsType(string: any): "string" | "number" | "boolean" | "Date";
    static FromDb(dbName: any, type: any): Field;
    static FromRelation(relation: any): Field;
    jsIfy(dbName: any): string;
}
export declare class Fields {
    private all;
    constructor(arr: any);
    getAll(): Field[];
    dbFieldNames(): string[];
    jsFieldNames(): string[];
    addField(field: any): void;
    getByJsName(changedJsName: any): Field | undefined;
    getByDbName(column: any): Field | undefined;
}
export {};
