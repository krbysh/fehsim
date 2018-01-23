//console.log("app.js");

import * as feh from './js/fehsim/module.js';
import { BattleGui } from './js/fehsim-gui/battle-gui.js';
import { BattleMenuGui } from './js/fehsim-gui/battle-menu-gui.js';
import { TeamMenuGui } from './js/fehsim-gui/team-menu-gui.js';
import { DATA_PROMISE as Data } from './js/fehsim-data/data.js';


Data.then(data => {

    /*
    let nino = data.findHero('Nino');
    let stats = nino.calculateStats(5, 1, 40, feh.STAT.ATK, feh.STAT.RES);
    console.log(stats); 
    return;
    */

    let teamMenu = new TeamMenuGui();
    teamMenu.init(document.querySelector('#builder'))

    let battleMenu = new BattleMenuGui();
    battleMenu.init(document.querySelector('#battle-menu'));

    let battleGui = new BattleGui();
    battleGui.init(document.querySelector('#battle'));

    let battle = new feh.Battle();
    teamMenu.battle = battle;
    battle.addBattleListener(battleGui.listener);

    let map = data.findMap('data/maps/birthright-trial.json');

    let build = new feh.Build();
    build.hero = data.findHero('Camus');
    build.weapon = data.findSkill('Silver Lance+');

    let player = [
        data.createBuild('Tana', 5, 0, 40, null, null, null, "Draw Back", null, null, null, null, null),
        data.createBuild('Tana', 5, 0, 40, null, null, 'Silver Lance+', "Draw Back", null, "Defiant Atk 1", null, null, null),
        data.createBuild('Tana', 5, 0, 40, null, null, 'Silver Lance+', "Draw Back", null, "Defiant Atk 2", null, null, null),
        data.createBuild('Tana', 5, 0, 40, null, null, 'Silver Lance+', "Draw Back", null, "Defiant Atk 3", null, null, null),
    ];

    let enemy = [
        data.createBuild('Marth', 5, 0, 40, null, null, 'Fenrir+', null, null, "Life and Death 3", null, null, null),
        data.createBuild('Effie', 5, 0, 40, null, null, 'Silver Bow+', null, null, null, null, null, null),
        data.createBuild('Tharja', 5, 0, 40, null, null, 'Fenrir+', null, null, null, null, null, null), // CLOSE
        data.createBuild('Camus', 5, 0, 40, null, null, 'Silver Lance+', null, null, 'Close Def 3', null, null, null),
    ];

    battle.setup(map, player, enemy);


});

