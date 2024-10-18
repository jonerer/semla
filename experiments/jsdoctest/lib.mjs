/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 */
export class User {
    constructor(id, name, email) {
    }
}

/**
 * @param {number} id
 * @returns {User}
 */
export function getUser(id) {
    return new User({
        id
    })
}