//console.log("data.js");

import * as feh from '../fehsim/module.js'
import { weapons } from './weapons.js';
import { assists } from './assists.js';
import { specials } from './specials.js';
import { passives } from './passives.js';
import { heroes } from './heroes.js';

export { weapons, assists, specials, passives, heroes };

// =====================================================================

let sacredSeals = [];

let breathOfLife1 = new feh.Skill(feh.SKILL.SACRED_SEAL, 'Breath of Life 1');
let distantDef1 = new feh.Skill(feh.SKILL.SACRED_SEAL, 'Distant Def 1');
let fortifyDef1 = new feh.Skill(feh.SKILL.SACRED_SEAL, 'Fortify Def 1');
let fortifyRes1 = new feh.Skill(feh.SKILL.SACRED_SEAL, 'Fortify Res 1');

sacredSeals[breathOfLife1.name] = breathOfLife1;
sacredSeals[distantDef1.name] = distantDef1;
sacredSeals[fortifyDef1.name] = fortifyDef1;
sacredSeals[fortifyRes1.name] = fortifyRes1;

// =====================================================================

function get(url) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.onload = function () {
            if (req.status == 200) { resolve(req.response); }
            else { reject(Error(req.statusText)); }
        };
        req.onerror = function () { reject(Error("Network Error")); };
        req.send();
    });
}

let maps = [];

function registerMapFromJson(url, json) {
    let map = new feh.Map(
        json.tiles,
        json.middleground, json.background, json.foreground,
        json.player, json.enemy);
    maps[url] = map;
}

/**
 * 
 */
class Data {

    /**
     * Find a hero by the given name
     * @param {string} hero the name of the hero 
     * @return {feh.Hero} the requested hero
     */
    findHero(hero) {
        if (!heroes[hero]) throw new feh.Exception(feh.EX.NOT_FOUND, "There's no registered heroe named '" + hero + "'");
        return heroes[hero];
    }

    /**
     * Find a map by the given url
     * @param {string} map the url of the map
     * @return {feh.Map} the requested map
     */
    findMap(map) {
        if (!maps[map]) throw new feh.Exception(feh.EX.NOT_FOUND, "There's no map asociated to the url '" + map + "'");
        return maps[map];
    }

    findSacredSeal(sacredSeal) {
        if (!sacredSeals[sacredSeal]) throw new feh.Exception(feh.EX.NOT_FOUND, "There's no registered sacred seal named '" + sacredSeal + "'");
        return sacredSeals[sacredSeal];
    }

    findSkill(skill) {
        if (assists[skill]) return assists[skill];
        if (weapons[skill]) return weapons[skill];
        if (specials[skill]) return specials[skill];
        if (passives[skill]) return passives[skill];
        throw new feh.Exception(feh.EX.NOT_FOUND, "There's no registered skill named '" + skill + "'");
    }

    /**
     * 
     * @param {string} hero 
     * @param {number} level 
     * @param {number} merges 
     * @param {number} rarity 
     * @param {string} boon 
     * @param {string} bane 
     * @param {string} weapon 
     * @param {string} assist 
     * @param {string} special 
     * @param {string} passiveA 
     * @param {string} passiveB 
     * @param {string} passiveC 
     * @param {string} sacredSeal 
     */
    createBuild(hero, rarity, merges, level, boon, bane, weapon, assist, special, passiveA, passiveB, passiveC, sacredSeal) {
        let build = new feh.Build();
        if (hero) build.hero = this.findHero(hero);
        if (level) build.level = level;
        if (merges) build.merges = merges;
        if (rarity) build.rarity = rarity;
        if (boon) build.boon = boon;
        if (bane) build.bane = bane;
        if (weapon) build.weapon = this.findSkill(weapon);
        if (assist) build.assist = this.findSkill(assist);
        if (special) build.special = this.findSkill(special);
        if (passiveA) build.passiveA = this.findSkill(passiveA);
        if (passiveB) build.passiveB = this.findSkill(passiveB);
        if (passiveC) build.passiveC = this.findSkill(passiveC);
        if (sacredSeal) build.sacredSeal = this.findSkill(sacredSeal);
        return build;
    }
}

let heroesUrl = 'data/heroes.json';
let mapsUrl = 'data/maps.json';
let bundlesUrl = 'data/bundles.json';

/**
 * Singleton object for retrieving data
 * @type {Promise<Data>}
 */
export const DATA_PROMISE = new Promise((resolve, reject) => {
    Promise
        .all([
            get(mapsUrl),
            get(bundlesUrl)
        ])
        .then(responses => {
            //JSON.parse(responses[0]).forEach(e => registerHeroFromJson(e));
            //JSON.parse(responses[1]).forEach(e => registerMap(e));

            let mapUrls = JSON.parse(responses[0]);

            let mapPromises = mapUrls.map(url => get(url));
            Promise
                .all(mapPromises)
                .then(responseTexts => {
                    let jsonArray = responseTexts.map(text => JSON.parse(text));
                    for (let i = 0; i < jsonArray.length; i++)
                        registerMapFromJson(mapUrls[i], jsonArray[i])
                })
                .catch(err => console.error(err))
                .then(o => { resolve(new Data()); });

        }).catch(e => {
            console.error(e);
        });
});