const EX_INVALID_PLAYER = "EX_INVALID_PLAYER";
const EX_INVALID_TYPE = "EX_INVALID_TYPE";

const EX_MISSING_PARAM = "EX_MISSING_PARAM";
const EX_BAD_PARAM = "EX_BAD_PARAM";

const EX_WRONG_BATTLE = "EX_WRONG_BATTLE";
const EX_WRONG_PLAYER = "EX_WRONG_PLAYER";
const EX_WRONG_TIMING = "EX_WRONG_TIMING";

const EX_NOT_IMPLEMENTED = "EX_NOT_IMPLEMENTED";

class FehException {

    /**
     * 
     * @param {number} type 
     * @param {string} description 
     */
    constructor(type, description) {
        this.type = type;
        this.description = description;
    }

    toString() {
        return this.type + ': ' + this.description;
    }
}