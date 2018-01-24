//console.log("hero.js");

import { MOVEMENT, STAT, TERRAIN } from './enums.js';

const GVTABLE = [
    [0, 6, 7, 7, 8, 8],
    [1, 8, 8, 9, 10, 10],
    [2, 9, 10, 11, 12, 13],
    [3, 11, 12, 13, 14, 15],
    [4, 13, 14, 15, 16, 17],
    [5, 14, 15, 17, 18, 19],
    [6, 16, 17, 19, 20, 22],
    [7, 18, 19, 21, 22, 24],
    [8, 19, 21, 23, 24, 26],
    [9, 21, 23, 25, 26, 28],
    [10, 23, 25, 27, 28, 30],
    [11, 24, 26, 29, 31, 33]
];

const HP = 0;
const ATK = 1;
const SPD = 2;
const DEF = 3;
const RES = 4;

let indexOf = {};
indexOf[STAT.HP] = HP;
indexOf[STAT.ATK] = ATK;
indexOf[STAT.SPD] = SPD;
indexOf[STAT.DEF] = DEF;
indexOf[STAT.RES] = RES;

let stringOf = {};
stringOf[HP] = STAT.HP;
stringOf[ATK] = STAT.ATK;
stringOf[SPD] = STAT.SPD;
stringOf[DEF] = STAT.DEF;
stringOf[RES] = STAT.RES;

class StatValue {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    toString() {
        return stringOf[this.name] + ' with ' + this.value;
    }
}

/**
 * 
 */
export class Hero {

    /**
     * 
     * @param {string} name 
     * @param {string} weapon 
     * @param {string} movement 
     * @param {number} baseRarity 
     * @param {number[]} baseStats 
     * @param {number[]} growthValues 
     */
    constructor(name, weapon, movement, baseRarity, baseStats, growthValues) {
        this.baseRarity = baseRarity;
        this.baseStats = baseStats;
        this.growthValues = growthValues;
        this.movementType = movement;
        this.name = name;
        this.weaponType = weapon;
    }

    /**
     * 
     * @param {number} rarity 
     * @param {number} merges 
     * @param {number} level
     * @param {string} boon the stat to be booned
     * @param {string} bane the stat to be baned
     * @returns {number[]} an array containing each stat in the following order: HP, ATK, SPD, DEF, RES 
     */
    calculateStats(rarity = 5, merges = 0, level = 40, boon = null, bane = null) {

        /** @type {StatValue[]} */
        let stats = [];

        // ========================================================================================
        // BASE STATS

        // stats at level 1 and base rarity        
        for (let stat = 0; stat < 5; stat++) stats[stat] = new StatValue(stat, this.baseStats[stat]);

        // ========================================================================================
        // RARITY

        // Increasing the rarity of a hero by 1 increases two or three of the base stats, depending on which rarities are involved.
        let bestNonHpValues = stats.filter(stat => stat.name !== HP).sort((a, b) => b.value - a.value);

        for (let r = this.baseRarity; r < rarity; r++) {

            // Going to 2 increases the two highest non-HP stats by one each.
            // Going to 4 increases the two highest non-HP stats by one each.
            if (r % 2) {
                stats[bestNonHpValues[0].name].value++;
                stats[bestNonHpValues[1].name].value++;
            }
            // Going to 3 increases HP and the two remaining non-HP stats by one each.
            // Going to 5 increases HP and the two remaining non-HP stats by one each.
            if (!(r % 2)) {
                stats[HP].value++;
                stats[bestNonHpValues[2].name].value++;
                stats[bestNonHpValues[3].name].value++;
            }
        }

        // ========================================================================================
        // STAT VARIATIONS

        // boon stat and bane stat at level 1
        if (boon) stats[indexOf[boon]].value++;
        if (bane) stats[indexOf[bane]].value--;

        // ========================================================================================
        // MERGES

        let bestValuesAfterBoonAndBane = stats.filter(stat => true).sort((a, b) => b.value - a.value);

        let j = 0;
        for (let i = 0; i < merges * 2; i++) {
            stats[bestValuesAfterBoonAndBane[j++].name].value++;
            if (j >= 5) j = 0;
        }

        // ========================================================================================
        // MAX LEVEL STATS

        if (level !== 1 && level !== 40) throw "WTF MAN, LV 40 or LV 1, BE GOOD JEEEZ, IF YOU KNOW HOW TO CALCULATE LV " + level + ' STATS LET ME KNOW';

        if (level === 40) {
            let extra = [0, 0, 0, 0, 0];
            if (boon) extra[indexOf[boon]]++;
            if (bane) extra[indexOf[bane]]--
            for (let stat = 0; stat < 5; stat++)
                stats[stat].value += GVTABLE[this.growthValues[stat] + extra[stat]][rarity];
        }

        // ========================================================================================
        // OUTPUT

        return stats.map(e => e.value);
    }

    /**
     * 
     * @param {Hero} hero 
     */
    validate(hero) {

    }
}