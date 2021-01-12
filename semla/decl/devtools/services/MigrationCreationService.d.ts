import { Variants } from './GenerationService';
declare class MigrationFile {
    name: any;
    contents: any;
    constructor(name: any);
    setContents(conts: any): void;
}
export declare class MigrationCreationService {
    name: string;
    changes: any[];
    private variant;
    constructor();
    input(json: any): void;
    classify(name: any): any;
    setVariant(string: Variants): void;
    write(): void;
    generateMigrationFile(): MigrationFile;
}
export {};
