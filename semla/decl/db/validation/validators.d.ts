export class PresentValidator {
    constructor(_fieldNames: any, options: any);
    fields: any[];
    options: any;
    validate(instance: any, results: any): Promise<void>;
}
export class CustomValidator {
    constructor(callback: any, options: any);
    callback: any;
    options: any;
    validate(instance: any, results: any): Promise<void>;
}
export class ValidationRunner {
    constructor(instance: any, collector: any, mode: any);
    instance: any;
    collector: any;
    mode: any;
    validate(): Promise<ResultsCollector>;
}
declare class ResultsCollector {
    fails: any[];
    fail(validator: any, fieldName: any, message: any): void;
    isValid(): boolean;
    messages(): any[];
}
export {};
