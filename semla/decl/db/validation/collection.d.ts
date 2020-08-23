export class ValidationCollector {
    validators: any[];
    present(fields: any, _options: any): void;
    custom(callback: any, _options: any): void;
    getForMode(mode: any): any[];
}
