export type flashTypes = 'info' | 'error' | 'warn';
export declare class Flasher {
    private session;
    constructor(_session: any);
    flashes(): {
        type: any;
        text: any;
    }[];
    flash(type: flashTypes, text: string): void;
}
