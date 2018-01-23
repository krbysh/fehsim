//console.log("exception.js");

export const EX = {
    /** null or undefined */
    MISSING_PARAM: 'MISSING_PARAM',
    /** not of expected type */
    BAD_PARAM: 'BAD_PARAM',
    /** not one of accepted values */
    INVALID_PARAM: 'INVALID_PARAM',
    /** not implemented yet */
    UNIMPLEMENTED: 'UNIMPLEMENTED',
    /** valid parameter, but resource was not found */
    NOT_FOUND: 'NOT_FOUND',
    /** illegal movement */
    ILLEGAL_MOVEMENT: 'ILLEGAL_MOVEMENT'
}

export class Exception {

    /**
     * 
     * @param {string} code 
     * @param {string} description 
     */
    constructor(code, description) {
        this.code = code;
        this.description = description;
    }

    toString() {
        return this.code + ": " + this.description;
    }
}