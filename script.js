let map = new FehMap();
map.backgroundImageUri = '/res/img/maps/S0201.png';
map.backgroundPatternUri = '/res/img/maps/common/WavePattern.png';
map.foregroundImageUri = '/res/img/maps/common/CloudAdd.png';
map.playerSpaces = [
    [3, 0],
    [4, 0],
    [3, 1],
    [4, 1],
];
map.enemySpaces = [
    [3, 4],
    [4, 5],
    [5, 5]
]

let heroBuild = new FehBuild();

let teamBuild1 = [];
teamBuild1.push(heroBuild);
teamBuild1.push(heroBuild);
teamBuild1.push(heroBuild);
teamBuild1.push(heroBuild);

let teamBuild2 = [];
teamBuild2.push(heroBuild);
teamBuild2.push(heroBuild);
teamBuild2.push(heroBuild);


let battle1 = new FehBattle(map, teamBuild1, teamBuild2);

let p1_ = battle1.getController(KEY_PLAYER);
let p2_ = battle1.getController(KEY_ENEMY);

let heroes_ = p1_.getTeam();
let enemies_ = p1_.getEnemyTeam();

// *********************

let gui = new FehBattleGui(document.querySelector('#game-div'), p1_);
gui.aiStepFunction = () => aiStep(p2_);

battle1.addBattleListener(gui);
battle1.restart();

// **************************