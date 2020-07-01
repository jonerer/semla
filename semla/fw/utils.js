export function singularize(plural) {
    if (plural.toLowerCase() === 'people') {
        return plural.substr(0, 2) + 'rson'
    }
    if (plural.endsWith('ves')) {
        return plural.substr(0, plural.length - 3) + 'f'
    }
    if (plural.endsWith('ies')) {
        return plural.substr(0, plural.length - 3) + 'y'
    }
    if (plural.endsWith('s')) {
        return plural.substr(0, plural.length - 1)
    }
    return plural
}

export const pluralize = thing => {
    if (thing.toLowerCase() === 'person') {
        return thing.substr(0, 2) + 'ople'
    }
    if (thing.endsWith('f')) {
        return thing.substr(0, 3) + 'ves'
    }
    if (thing.endsWith('y')) {
        return thing.substr(0, thing.length - 1) + 'ies'
    }
    if (!thing.endsWith('s')) {
        return thing + 's'
    }
    return thing
}

export const jsFieldName = thing => {
    return thing.charAt(0).toLowerCase() + thing.substr(1)
}
