import { DevFileChange } from '../models/DevFileChange';
export type Variants = 'js' | 'ts';
interface GenerationInput {
    name: string;
    nestingParent: string;
    requiresAuth: boolean;
    variant: Variants;
    noSave: boolean;
}
export declare class GenerationService {
    private changes;
    constructor();
    basePath(): string;
    generate(_input: GenerationInput): Promise<DevFileChange[]>;
}
export {};
