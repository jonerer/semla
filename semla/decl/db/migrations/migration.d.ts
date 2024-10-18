export function addMigrationFileDir(dir: any): void;
export function getMigrations(env: any): Promise<MigrationFile[]>;
export function forceRunMigrationClass(cls: any): Promise<any>;
export function getStatements(cls: any): Promise<string[]>;
export function runMigrations(env: any): Promise<{
    success: boolean;
    message: string;
    numSuccessful: number;
}>;
declare class MigrationFile {
    fullpath: string;
    name: string;
    hasRun: boolean;
}
export {};
