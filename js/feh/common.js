/**
 * BLA2
 * @module Common 
 * */

const EX_ILLEGAL_MOVE = "EX_ILLEGAL_MOVE";

const EX_INVALID_PLAYER = "EX_INVALID_PLAYER";
const EX_INVALID_TYPE = "EX_INVALID_TYPE";

const EX_MISSING_PARAM = "EX_MISSING_PARAM";
const EX_BAD_PARAM = "EX_BAD_PARAM";

const EX_WRONG_BATTLE = "EX_WRONG_BATTLE";
const EX_WRONG_PLAYER = "EX_WRONG_PLAYER";
const EX_WRONG_TIMING = "EX_WRONG_TIMING";

const EX_NOT_IMPLEMENTED = "EX_NOT_IMPLEMENTED";

/**
 * 
 */
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

/**
* 
* @param {any[]} targetArray 
* @param {any[]} sourceArray 
*/
function addAllElementsNotInTargetArray(targetArray, sourceArray) {
    sourceArray.forEach(e => {
        if (targetArray.indexOf(e) < 0)
            targetArray.push(e);
    })
}


/**
 * BLA2.1
 * @param {Number} n 
 */
function truncate(n) { return Math.trunc(n); }

/**
 * BLA2.2
 * @param {Number} n 
 */
function roundTowardsZero(n) {
    if (n < 0) return Math.ceil(n);
    return Math.floor(n);
}

/**
 * BLA2.3
 * @param {Number} n 
 */
function roundAwayFromZero(n) {
    if (n > 0) return Math.ceil(n);
    return Math.floor(n);
}

/**
 * 
 * @param {any[]} array 
 * @param {any} element 
 * @returns {any}
 */
function removeFromArray(array, element) {
    const index = array.indexOf(element);
    array.splice(index, 1);
    return element;
}

function isNullOrUndefined(value) {
    if (value === null) return true;
    if (value === undefined) return true;
    return false;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}