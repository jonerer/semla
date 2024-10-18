import { ResultsCollector, ValidationModes, Validator } from './validators';
export interface ValidationOptions {
    updating?: boolean;
    creation?: boolean;
}
export declare class ValidationCollector {
    private validators;
    constructor();
    present(fields: string[] | string, _options?: ValidationOptions): void;
    custom(callback: (instance: any, results: ResultsCollector) => Promise<void>, _options?: ValidationOptions): void;
    getForMode(mode: ValidationModes): Validator[];
}
