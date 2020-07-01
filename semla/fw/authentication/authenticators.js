const authenticators = {}

export function registerAuthenticator(authenticator) {
    // Should be like "JwtAuthenticator"
    const name = authenticator.constructor.name
        .toLowerCase()
        .split('authenticator')[0]
    authenticators[name] = authenticator
}

export function getAuthenticator(name) {
    return name
}
export function getAuthenticatorForRoute(generatedRoute) {
    const expectedName = generatedRoute.options.authenticator
    return authenticators[expectedName]
}
