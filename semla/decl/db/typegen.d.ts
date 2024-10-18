import { ModelType } from './models';
interface Attributes {
    settableName: string;
    settableContent: string;
    attributesName: string;
    attributesContent: string;
    joinableFieldsName: string;
    joinableFieldsType: string;
    queryFieldsName: string;
    queryFieldsContent: string;
}
export declare const generateAttributesForModel: (model: ModelType) => Attributes;
export declare const generateBaseClassForModel: (model: ModelType, attributes: Attributes) => string;
export declare const generateBodyForModel: (model: ModelType) => string;
export declare const generateTypes: () => Promise<void>;
export {};
