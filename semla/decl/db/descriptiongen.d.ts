import { ModelType } from './models';
export declare function findStartEnd(definingFile: string, model: ModelType): {
    start: number;
    end: number;
};
export declare function generateComment(model: ModelType): Promise<string>;
export declare function insertComment(original: string, start: number, end: number, content: string): Promise<string>;
export declare const generateDescriptions: () => Promise<void>;
