import {getUser} from "./lib.mjs";


/**
 * @returns {User}
 */
function myUser() {
    const us = getUser("hej")
    return us
}

console.log(myUser.prototype.id)
