// =============================================================================================

let map = new FehMap();

map.tiles = [

    [TERRAIN______, TERRAIN______, TERRAIN_BLOCK, TERRAIN_BLOCK, TERRAIN__WW__, TERRAIN______],
    [TERRAIN______, TERRAIN_BLOCK, TERRAIN_BLOCK, TERRAIN______, TERRAIN______, TERRAIN______],
    [TERRAIN______, TERRAIN_BLOCK, TERRAIN______, TERRAIN______, TERRAIN______, TERRAIN______],
    [TERRAIN______, TERRAIN______, TERRAIN______, TERRAIN__WW__, TERRAIN______, TERRAIN______],

    [TERRAIN______, TERRAIN_BLOCK, TERRAIN______, TERRAIN______, TERRAIN______, TERRAIN______],
    [TERRAIN______, TERRAIN_BLOCK, TERRAIN_BLOCK, TERRAIN______, TERRAIN______, TERRAIN______],
    [TERRAIN______, TERRAIN______, TERRAIN_BLOCK, TERRAIN__WW__, TERRAIN______, TERRAIN______],
    [TERRAIN______, TERRAIN______, TERRAIN_BLOCK, TERRAIN__WW__, TERRAIN__WW__, TERRAIN__WW__],
]
map.playerSpaces = [
    [1, 0],
    [2, 0],
    [4, 0],
    [5, 0],
];
map.enemySpaces = [
    [3, 5], // Red Mage
    [4, 5], // Lance Fighter
    [2, 4], // Axe Fighter
    [1, 4], // Blue Mage
    [5, 3], // Axe Fighter
    [5, 4], // Robin (F)
];
map.backgroundImageUri = 'res/img/maps/T0001.png';
map.backgroundPatternUri = 'res/img/maps/common/WavePattern.png';
map.foregroundImageUri = 'res/img/maps/common/CloudAdd.png';

// =============================================================================================

let enemyTeam = [];
let playerTeam = [];

// =============================================================================================

/**
 * @type {FehBattle}
 */
var battleSingleton = new FehBattle();
battleSingleton.map = map;
battleSingleton.playerTeam = playerTeam;
battleSingleton.enemyTeam = enemyTeam;

// =============================================================================================

let gui = new FehBattleGui(document.querySelector('#game-div'), battleSingleton.getController(KEY_PLAYER));
gui.aiStepFunction = () => aiStep(battleSingleton.getController(KEY_ENEMY));
battleSingleton.addBattleListener(gui);

// =============================================================================================

let mainMenu = new FehMainGui(document.querySelector('.main-menu'));

// =============================================================================================

HEROES_LOADED_PROMISE.then(() => {

    let olivia = new FehUnit();
    olivia.hero = getHeroByName('Olivia');
    olivia.equip(DANCE);

    let lynBraveHeroes = new FehUnit();
    lynBraveHeroes.hero = getHeroByName('Lyn (Brave Heroes)');
    lynBraveHeroes.equip(BRAVE_BOW_PLUS);
    lynBraveHeroes.equip(SMITE);

    let royBraveHeroes = new FehUnit();
    royBraveHeroes.hero = getHeroByName("Roy (Brave Heroes)");
    royBraveHeroes.equip(SHOVE);

    let leo = new FehUnit();
    leo.hero = getHeroByName("Leo");
    leo.equip(SWAP);

    playerTeam.push(olivia);
    playerTeam.push(lynBraveHeroes);
    playerTeam.push(royBraveHeroes);
    playerTeam.push(leo);

    battleSingleton.playerTeam = playerTeam;
    battleSingleton.restart();

});