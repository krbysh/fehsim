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

// ENEMIES

let redMage = new FehUnit(new FehOverwriteHero(
    "Red Mage", WEAPON_RED_TOME, MOVEMENT_INFANTRY,
    52, 45 - RAUORRAVEN_PLUS.might, 35, 22, 31,
    "../res/img/heroes/Map_Red_Mage.png"
), RAUORRAVEN_PLUS);

let lanceFighter = new FehUnit(new FehOverwriteHero(
    "Lance Fighter", WEAPON_LANCE, MOVEMENT_INFANTRY,
    61, 49 - SILVER_LANCE_PLUS.might, 34, 33, 25,
    "../res/img/heroes/Map_Lance_Fighter.png"
), SILVER_LANCE_PLUS);

let axeFighter1 = new FehUnit(new FehOverwriteHero(
    "Axe Fighter", WEAPON_AXE, MOVEMENT_INFANTRY,
    61, 45 - KILLER_AXE_PLUS.might, 34, 33, 25,
    "../res/img/heroes/Map_Axe_Fighter.png"
), KILLER_AXE_PLUS);

let blueMage = new FehUnit(new FehOverwriteHero(
    "Blue Mage", WEAPON_BLUE_TOME, MOVEMENT_INFANTRY,
    52, 47 - THORON_PLUS.might, 35, 22, 31,
    "../res/img/heroes/Map_Blue_Mage.png"
), THORON_PLUS);

let axeFighter2 = new FehUnit(new FehOverwriteHero(
    "Axe Fighter", WEAPON_AXE, MOVEMENT_INFANTRY,
    61, 45 - KILLER_AXE_PLUS.might, 34, 33, 25,
    "../res/img/heroes/Map_Axe_Fighter.png"
), KILLER_AXE_PLUS);

let robin = new FehUnit(new FehOverwriteHero(
    "Robin (F)", WEAPON_GREEN_TOME, MOVEMENT_INFANTRY,
    64, 42 - GRONNWOLF_PLUS.might, 32, 32, 25
), GRONNWOLF_PLUS);

let enemyTeam = [];
enemyTeam.push(redMage);
enemyTeam.push(lanceFighter);
enemyTeam.push(axeFighter1);
enemyTeam.push(blueMage);
enemyTeam.push(axeFighter2);
enemyTeam.push(robin);

// ALLIES

let olivia = new FehUnit();
olivia.hero = new FehOverwriteHero("Olivia", WEAPON_SWORD, MOVEMENT_INFANTRY, 40, 30, 30, 25, 25);
olivia.equip(DANCE);

let lynBraveHeroes = new FehUnit();
lynBraveHeroes.hero = new FehOverwriteHero("Lyn (Brave Heroes)", WEAPON_BOW, MOVEMENT_CAVALRY, 35, 33, 35, 18, 28);
lynBraveHeroes.equip(SMITE);
lynBraveHeroes.equip(SILVER_BOW_PLUS);

let royBraveHeroes = new FehUnit();
royBraveHeroes.hero = new FehOverwriteHero("Roy (Brave Heroes)", WEAPON_SWORD, MOVEMENT_CAVALRY, 40, 30, 30, 25, 25);
royBraveHeroes.equip(SHOVE);

let leo = new FehUnit();
leo.hero = new FehOverwriteHero("Leo", WEAPON_RED_TOME, MOVEMENT_CAVALRY, 40, 30, 30, 25, 25);
leo.equip(SWAP);

let playerTeam = [];
playerTeam.push(olivia);
playerTeam.push(lynBraveHeroes);
playerTeam.push(royBraveHeroes);
playerTeam.push(leo);

// =============================================================================================

let battle = new FehBattle();
battle.map = map;
battle.playerTeam = playerTeam;
battle.enemyTeam = enemyTeam;

// =============================================================================================

let gui = new FehBattleGui(document.querySelector('#game-div'), battle.getController(KEY_PLAYER));
gui.aiStepFunction = () => aiStep(battle.getController(KEY_ENEMY));
battle.addBattleListener(gui);
battle.restart();

// =============================================================================================
