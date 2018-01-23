import * as feh from '../fehsim/module.js';

export let specials = [];

/**
* @private
* @param {feh.Skill} e
*/
function reg(e) {
    specials[e.name] = e;
}

// =================================== //

let blazingFlame = new feh.Skill(feh.SKILL.SPECIAL, 'Blazing Flame');
let growingWind = new feh.Skill(feh.SKILL.SPECIAL, 'Growing Wind');
let moonbow = new feh.Skill(feh.SKILL.SPECIAL, 'Moonbow');

reg(growingWind);
reg(blazingFlame);
reg(moonbow);