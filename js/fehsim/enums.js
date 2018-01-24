/**
 * @readonly
 * @enum {string}
 */
export var STAT = {
    /**
     * This is the unit's health. If this hits zero, they are KO'd 
     */
    HP: 'Hp',
    /**
     * This is the unit's overall damage stat regardless of what type of weapon they use. 
     */
    ATK: 'Atk',
    /** 
     * This is the unit's speed. 
     * If a unit has 5 or more SPD over an opponent, then that hero can attack the enemy twice. 
     * This does not affect a unit's movement distance.
     */
    SPD: 'Spd',
    /**
     * This is the unit's physical-based damage reduction stat.
     * This reduces how much damage a unit will take from physical damage.
     */
    DEF: 'Def',
    /**
     * This is the unit's magical-based damage reduction stat.
     * This reduces how much damage a unit will take from magic damage.
     */
    RES: 'Res'
}

/**
 * Each map has varying terrain, some of which can be destroyed, others which inhibit movement, or provide bonuses. 
 * For example, forests will slow Infantry units while completely blocking Cavalry units. 
 * Flying units can move through forest terrain with no problems.    
 * Another example is a rubble of rock blocking your unit's path. 
 * You can only pass through the rubble by destroying it via character action.
 * @readonly
 * @enum {string}
 */
export var TERRAIN = {
    /** Forests will slow Infantry units while completely blocking Cavalry units. Flying units can move through forest terrain with no problems. */
    FOREST: 'F',
    BLOCK: 'B',
    PLAIN: 'P',
    VOID: 'V'
};

/**
 * Movement is split into Infantry, Armored, Flying and Cavalry.
 * @readonly
 * @enum {string}
 */
export var MOVEMENT = {

    /** Infantry can only move 2 spaces on land and will only be able to move 1 space through forests. */
    INFANTRY: 'Infantry',
    /** Armored can only move 1 space on land and are able to move through forests. */
    ARMORED: 'Armored',
    /** Cavalry can move 3 spaces on land, but cannot move through forests. */
    CAVALRY: 'Cavalry',
    /** Flying can move 2 spaces regardless of terrain, but cannot move past walls or rocks (see Terrain). */
    FLYING: 'Flying'
}