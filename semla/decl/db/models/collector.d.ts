import { ValidationCollector } from '../validation/collection';
import { ModelType } from '../models';
export interface CollectedRelation {
    type: 'belongsTo' | 'hasMany';
    name: string;
    options: any;
    model: ModelType;
}
export declare class ModelSetupCollector {
    relations: CollectedRelation[];
    fillable_fields: string[];
    model: ModelType;
    validationCollector: ValidationCollector;
    _getFromParamCallback: (id: any) => string;
    constructor(model: ModelType);
    belongsTo(name: any, options?: {}): void;
    fillable(fields: any): void;
    getFromParam(callback: any): void;
    hasMany(name: any, options?: {}): void;
    validate(callback: any): void;
}
