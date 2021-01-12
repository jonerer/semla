import { ResultsCollector, ValidationModes, Validator } from './validators';
export declare class ValidationCollector {
    private validators;
    constructor();
    present(fields: string[] | string, _options: any): void;
    custom(callback: (instance: any, results: ResultsCollector) => Promise<void>, _options: any): void;
    getForMode(mode: ValidationModes): Validator[];
}
