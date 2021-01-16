import { Field, Fields } from './querying/fields';
import { ValidationCollector } from './validation/collection';
import { ModelSetupCollector } from './models/collector';
export interface ModelType {
    _fields: Fields;
    _relationFields: Field[];
    _modelName: string;
    prototype: any;
    _routeParamName: string;
    _setup: ModelSetupCollector;
    _tableName: string;
    _validations: ValidationCollector;
    _loaded: boolean;
    _registeringPath: string;
    loaded(): boolean;
    findOne(any: any): any;
    find(any: any): any;
}
interface ModelsType {
    [s: string]: ModelType;
}
export interface ModelInstance {
}
export declare const assureBucket: (obj: any) => void;
export declare function setDbAdapter(adapter: any): void;
export declare const registerModelsAsQueryParams: (app: any) => Promise<void>;
export declare const modelNameToTableName: (name: any) => any;
export declare const getLowercasedModel: (name: any) => ModelType | undefined;
export declare const collectSetup: (model: any) => void;
export declare const prepareModels: () => Promise<void>;
export declare const models: ModelsType;
export declare function registerModel(model: any): void;
export declare function clearModels(): void;
export declare function getUserModels(): ModelsType;
export declare function getLoadedUserModelList(): ModelType[];
export declare function getModels(): ModelsType;
export {};
