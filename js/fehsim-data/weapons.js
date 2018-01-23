import * as feh from '../fehsim/module.js';

export let weapons = [];

/**
* @private
* @param {feh.Weapon} e
*/
function reg(e) {
    weapons[e.name] = e;
}

// =================================== //

class Sword extends feh.Weapon { constructor(name, might) { super(feh.WEAPON.SWORD, name, might, 1); } }
class Lance extends feh.Weapon { constructor(name, might) { super(feh.WEAPON.LANCE, name, might, 1); } }
class Bow extends feh.Weapon { constructor(name, might) {super(feh.WEAPON.BOW, name, might, 2)} }
class GreenTome extends feh.Weapon { constructor(name, might) {super(feh.WEAPON.GREEN_TOME, name, might, 2)} }
class RedTome extends feh.Weapon { constructor(name, might) {super(feh.WEAPON.RED_TOME, name, might, 2)} }

// =================================== //

let amiti = new Sword('Amiti', 11);
let silverSword = new Sword('Silver Sword', 11);
let silverSwordPlus = new Sword('Silver Sword+', 15);

let silverLancePlus = new Sword('Silver Lance+', 15);
let vidofnir = new Lance('Vidofnir', 16);

let silverBowPlus = new Bow('Silver Bow+', 13);

let gronnbladePlus = new GreenTome('Gronnblade+', 13);

let fenrirPlus = new RedTome('Fenrir+', 13);

// =================================== //


// SWORDS
reg(amiti);
reg(silverSword);
reg(silverSwordPlus);

// LANCES
reg(vidofnir);
reg(silverLancePlus);

// BOWS
reg(silverBowPlus);

// GREEN TOMES
reg(gronnbladePlus);

// RED TOMES
reg(fenrirPlus);