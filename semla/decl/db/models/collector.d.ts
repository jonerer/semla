import { ValidationCollector } from '../validation/collection';
import { ModelType } from '../models';
export interface CollectedRelation {
    type: 'belongsTo' | 'hasMany';
    name: string;
    options: any;
    model: ModelType;
}
export interface BelongsToOptions {
    model?: string;
}
export interface HasManyOptions {
    model?: string;
}
export declare class ModelSetupCollector {
    relations: CollectedRelation[];
    fillable_fields: string[];
    model: ModelType;
    validationCollector: ValidationCollector;
    _getFromParamCallback: (id: any) => string;
    constructor(model: ModelType);
    belongsTo(name: any, options?: BelongsToOptions): void;
    fillable(fields: any): void;
    getFromParam(callback: any): void;
    hasMany(name: any, options?: HasManyOptions): void;
    validate(callback: (validations: ValidationCollector) => void): void;
}
