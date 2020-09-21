import { ModelType } from './models';
import { Field } from './querying/fields';
export declare function findStartEnd(definingFile: string, model: ModelType): {
    start: number;
    end: number;
};
export declare function lineForField(field: Field): [string, string, string, string];
export declare function generateComment(model: ModelType, newlineChar: string): Promise<string>;
export declare function insertComment(original: string, start: number, end: number, content: string): string;
export declare function generateNewContent(contentBefore: string, model: ModelType): Promise<string>;
export declare const generateDescriptions: () => Promise<void>;
