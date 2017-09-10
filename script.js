// =============================================================================================

let map = new FehMap();

map.tiles = [
    [TERRAIN_BLOCK, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_BLOCK],
    [TERRAIN_BLOCK, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_BLOCK],
    [TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN],
    [TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_BLOCK, TERRAIN_BLOCK, TERRAIN_PLAIN, TERRAIN_PLAIN],
    [TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_WALL1, TERRAIN_BLOCK],
    [TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN],
    [TERRAIN_PLAIN, TERRAIN_BLOCK, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN, TERRAIN_PLAIN],
    [TERRAIN_PLAIN, TERRAIN_BLOCK, TERRAIN_BLOCK, TERRAIN_BLOCK, TERRAIN_PLAIN, TERRAIN_PLAIN],
]
map.playerSpaces = [
    [5, 4],
    [5, 5],
    [6, 3],
    [6, 4],
];
map.enemySpaces = [
    [2, 0], // Green Cavalier
    [2, 1], // Blue Mage
    [3, 0], // Thief
    [7, 0], // Sword Cavalier
    [0, 2], // Ephraim
    [0, 3], // Eirika
];
map.backgroundImageUri = 'res/img/maps/T0016.png';
map.backgroundPatternUri = 'res/img/maps/common/WavePattern.png';
map.foregroundImageUri = 'res/img/maps/common/CloudAdd.png';

// =============================================================================================

// ENEMIES

let greenCavalier = new FehUnit();
greenCavalier.hero = new FehOverwriteHero(
    "Green Cavalier",
    WEAPON_AXE, MOVEMENT_CAVALRY,
    46, 52 - GRONBLADE_PLUS.might, 28, 19, 38,
    "res/img/heroes/84px-Map_Green_Cavalier.png"
);

let blueMage = new FehUnit();
blueMage.hero = new FehOverwriteHero(
    "Blue Mage",
    WEAPON_BLUE_TOME, MOVEMENT_INFANTRY,
    52, 47 - BLARBLADE_PLUS.might, 35, 22, 31,
    "res/img/heroes/84px-Map_Blue_Mage.png"
);

let thief = new FehUnit();
thief.hero = new FehOverwriteHero(
    "Thief",
    WEAPON_DAGGER, MOVEMENT_INFANTRY,
    50, 38 - ROGUE_DAGGER_PLUS.might, 42, 15, 35,
    "res/img/heroes/84px-Map_Thief.png"
);

let swordCavalier = new FehUnit();
swordCavalier.hero = new FehOverwriteHero(
    "Sword Cavalier",
    WEAPON_SWORD, MOVEMENT_CAVALRY,
    57, 53 - SILVER_SWORD_PLUS.might, 27, 28, 33,
    "res/img/heroes/84px-Map_Sword_Cavalier.png"
);

let ephraim = new FehUnit();
ephraim.hero = new FehOverwriteHero(
    "Ephraim",
    WEAPON_LANCE, MOVEMENT_INFANTRY,
    73, 58 - SEIGMUND.might, 31, 38, 25,
    "res/img/heroes/78px-Icon_Portrait_Ephraim.png"
);

let eirika = new FehUnit();
eirika.hero = new FehOverwriteHero(
    "Eirika",
    WEAPON_SWORD, MOVEMENT_INFANTRY,
    67, 45 - SEIGLINDE.might, 39, 29, 31,
    "res/img/heroes/78px-Icon_Portrait_Eirika.png"
);

let enemyTeam = [];
enemyTeam.push(greenCavalier);
enemyTeam.push(blueMage);
enemyTeam.push(thief);
enemyTeam.push(swordCavalier);
enemyTeam.push(ephraim);
enemyTeam.push(eirika);

// ALLIES

let olivia = new FehUnit();
olivia.hero = new FehOverwriteHero("Olivia", WEAPON_SWORD, MOVEMENT_INFANTRY, 40, 30, 30, 25, 25);
olivia.equip(DANCE);

let lynBraveHeroes = new FehUnit();
lynBraveHeroes.hero = new FehOverwriteHero("Lyn (Brave Heroes)", WEAPON_BOW, MOVEMENT_CAVALRY, 40, 30, 30, 25, 25);
lynBraveHeroes.equip(DRAW_BACK);

let royBraveHeroes = new FehUnit();
royBraveHeroes.hero = new FehOverwriteHero("Roy (Brave Heroes)", WEAPON_SWORD, MOVEMENT_CAVALRY, 40, 30, 30, 25, 25);
royBraveHeroes.equip(DRAW_BACK);

let leo = new FehUnit();
leo.hero = new FehOverwriteHero("Leo", WEAPON_RED_TOME, MOVEMENT_CAVALRY, 40, 30, 30, 25, 25);
leo.equip(DRAW_BACK);

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
