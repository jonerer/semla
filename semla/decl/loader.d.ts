export function getLoadedFiles(): any[];
export function getLoadedDirs(): any[];
export function addAppDir(dir: any): void;
export function addAppImportDir(dir: any): void;
export function setAppImportDirs(dirs: any): void;
export function addAbsoluteImportDir(dir: any): void;
export function loadAllFiles(): Promise<void>;
