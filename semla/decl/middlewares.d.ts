export function jsifyBody({ req }: {
    req: any;
}): void;
export function requireParams(names: any): ({ req, params }: {
    req: any;
    params: any;
}) => void;
