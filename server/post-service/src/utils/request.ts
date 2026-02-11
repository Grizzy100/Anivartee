export function getParam(param: string | string[]): string{
    return Array.isArray(param) ? param[0] : param;
}

export function getOptionalParam(param: string | string[] | undefined): string | undefined {
    if(!param) return undefined;
    return Array.isArray(param) ? param[0] : param;
}