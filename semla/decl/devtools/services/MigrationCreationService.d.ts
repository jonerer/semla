export class MigrationCreationService {
    name: string;
    changes: any[];
    input(json: any): void;
    classify(name: any): any;
    write(): void;
    generateMigrationFile(): MigrationFile;
}
declare class MigrationFile {
    constructor(name: any);
    name: any;
    setContents(conts: any): void;
    contents: any;
}
export {};
