//console.log("map.js");

import { MOVEMENT, STAT, TERRAIN } from './enums.js';

/**
 * 
 */
export class Map {

    /**
     * 
     * @param {string[][]} terrain a matrix describind the map terrain
     * @param {string} middleground The main image of the map
     * @param {string} background The background image of the map (like water or lava)
     * @param {string} foreground The foreground image of the map (like clouds, or lights)
     * @param {number[][]} player starting player positions
     * @param {number[][]} enemy starting enemy positions
     */
    constructor(terrain = null, middleground = null, background = null, foreground = null, player = [], enemy = []) {

        if (!terrain) {
            this.terrain = [];
            for (let row = 0; row < 8; row++) {
                this.terrain[row] = [];
                for (let col = 0; col < 6; col++) {
                    this.terrain[row][col] = TERRAIN.PLAIN;
                }
            }
        }

        /**
         * a matrix describind this map terrains
         * @type {string[][]}
         */
        this.terrain = terrain;

        /**
         * The main image of the map
         * @type {string}
         */
        this.middlegroundImage = middleground;

        /**
         * The background image of the map (like water or lava)
         * @type {string}
         */
        this.backgroundImage = background;

        /**
         * The foreground image of the map (like clouds, or lights)
         * @type {string}
         */
        this.foregroundImage = foreground;

        /**
         * An array of coordinates in matrix form corresponding to the player units starting position
         * @type {number[][]}
         */
        this.playerStartingPositions = player;
        
        /**
         * An array of coordinates in matrix form corresponding to the enemy units starting position
         * @type {number[][]}
         */
        this.enemyStartingPositions = enemy;

    }
}