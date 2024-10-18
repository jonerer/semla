export interface Validator {
    validate(instance: any, results: ResultsCollector): Promise<void>;
}
export type ValidationModes = 'update' | 'create';
export declare class PresentValidator implements Validator {
    private fields;
    private options;
    constructor(_fieldNames: any, options: any);
    validate(instance: any, results: any): Promise<void>;
}
export declare class CustomValidator implements Validator {
    private callback;
    private options;
    constructor(callback: any, options: any);
    validate(instance: any, results: any): Promise<void>;
}
export declare class ResultsCollector {
    private fails;
    constructor();
    fail(validator: Validator, fieldName: string, message: string): void;
    isValid(): boolean;
    messages(): string[];
}
export declare class ValidationRunner {
    private instance;
    private collector;
    private mode;
    constructor(instance: any, collector: any, mode: any);
    validate(): Promise<ResultsCollector>;
}
