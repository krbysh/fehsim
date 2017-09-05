const TERRAIN_WATER = 'TERRAIN_WATER';
const TERRAIN_TREES = 'TERRAIN_TREES';
const TERRAIN_PLAIN = 'TERRAIN_PLAIN';
const TERRAIN_MNTIN = 'TERRAIN_MNTIN';
const TERRAIN_BLOCK = 'TERRAIN_BLOCK';

class FehMap {

    /**
     * @param {String[][]} tiles
     * @param {String} backgroundImageUri 
     * @param {String} backgroundPatterUri 
     * @param {Number[][]} playerSpaces
     * @param {Number[][]} enemySpaces
     */
    constructor(tiles, backgroundImageUri, backgroundPatterUri, playerSpaces, enemySpaces) {
        this.tiles = tiles;
        this.backgroundImageUri = backgroundImageUri;
        this.backgroundPatterUri = backgroundPatterUri;
        this.playerSpaces = playerSpaces;
        this.enemySpaces = enemySpaces;
    }
}