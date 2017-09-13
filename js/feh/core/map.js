/**
 * BLA3
 * @module Map
 * */

/**
 * asd
 */
class FehMap {


    constructor() {

        /**
         * @type {string[][]}
         */
        this.tiles = [];

        /**
         * @type {string}
         */
        this.backgroundImageUri = '';

        /**
         * @type {string}
         */
        this.backgroundPatterUri = '';

        /**
         * @type {number[][]}
         */
        this.playerSpaces = [];

        /**
         * @type {number[][]}
         */
        this.enemySpaces = [];
    }

}

const TERRAIN__WW__ = 'TERRAIN_WATER';
const TERRAIN_TREES = 'TERRAIN_TREES';
const TERRAIN______ = 'TERRAIN_PLAIN';
const TERRAIN_MNTIN = 'TERRAIN_MNTIN';
const TERRAIN_BLOCK = 'TERRAIN_BLOCK';
const TERRAIN_WALL1 = 'TERRAIN_WALL1';