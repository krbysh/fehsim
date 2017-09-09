/*
let unit = new FehMapHero();
unit.addModifier(new FehOverwriteModifier(WEAPON_LANCE, "Camus", 42, 32, 33, 31, 17));
unit.addModifier(new FehWeaponModifier(GRADIVUS));

let foe = new FehMapHero();
foe.addModifier(new FehOverwriteModifier(WEAPON_SWORD, "Xander", 44, 32, 24, 37, 17))

console.log(unit);
console.log(foe);

console.log(unit + ' vs ' + foe);

let combat = new FehCombat(unit, foe);
combat.debug();
*/


// let attack = new FehAttack(unit, foe);
// attack.debug();

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
map.backgroundImageUri = '/res/img/maps/T0016.png';
map.backgroundPatternUri = '/res/img/maps/common/WavePattern.png';
map.foregroundImageUri = '/res/img/maps/common/CloudAdd.png';

// =============================================================================================

let battle = new FehBattle();
battle.map = map;

// ENEMIES

let greenCavalier = new FehUnit();
greenCavalier.addModifier(new FehOverwriteModifier("Green Cavalier", "/res/img/heroes/84px-Map_Green_Cavalier.png", WEAPON_GREEN_TOME, MOVEMENT_CAVALRY,
    46, 52 - GRONBLADE_PLUS.might, 28, 19, 38));
greenCavalier.addModifier(new FehWeaponModifier(GRONBLADE_PLUS));

let blueMage = new FehUnit();
blueMage.addModifier(new FehOverwriteModifier("Green Cavalier", "/res/img/heroes/84px-Map_Blue_Mage.png", WEAPON_BLUE_TOME, MOVEMENT_INFANTRY,
    52, 47 - BLARBLADE_PLUS.might, 35, 22, 31));
blueMage.addModifier(new FehWeaponModifier(BLARBLADE_PLUS));

let thief = new FehUnit();
thief.addModifier(new FehOverwriteModifier("Thief", "/res/img/heroes/84px-Map_Thief.png", WEAPON_DAGGER, MOVEMENT_INFANTRY,
    50, 38 - ROGUE_DAGGER_PLUS.might, 42, 15, 35));
thief.addModifier(new FehWeaponModifier(ROGUE_DAGGER_PLUS));

let swordCavalier = new FehUnit();
swordCavalier.addModifier(new FehOverwriteModifier("Sword Cavalier", "/res/img/heroes/84px-Map_Sword_Cavalier.png", WEAPON_SWORD, MOVEMENT_CAVALRY,
    57, 53 - SILVER_SWORD_PLUS.might, 27, 28, 33));
swordCavalier.addModifier(new FehWeaponModifier(SILVER_SWORD_PLUS));

let ephraim = new FehUnit();
ephraim.addModifier(new FehOverwriteModifier("Sword Cavalier", "/res/img/heroes/78px-Icon_Portrait_Ephraim.png", WEAPON_SWORD, MOVEMENT_INFANTRY,
    73, 58 - SEIGMUND.might, 31, 38, 25));
ephraim.addModifier(new FehWeaponModifier(SEIGMUND));

let eirika = new FehUnit();
eirika.addModifier(new FehOverwriteModifier("Sword Cavalier", "/res/img/heroes/78px-Icon_Portrait_Eirika.png", WEAPON_SWORD, MOVEMENT_INFANTRY,
    67, 45 - SEIGLINDE.might, 39, 29, 31));
eirika.addModifier(new FehWeaponModifier(SEIGLINDE));

battle.enemyTeam.push(greenCavalier);
battle.enemyTeam.push(blueMage);
battle.enemyTeam.push(thief);
battle.enemyTeam.push(swordCavalier);
battle.enemyTeam.push(ephraim);
battle.enemyTeam.push(eirika);

// ALLIES

let olivia = new FehUnit();
olivia.addModifier(new FehOverwriteModifier(
    "Olivia", "/res/img/heroes/Icon_Portrait_Olivia.png",
    WEAPON_SWORD, MOVEMENT_INFANTRY,
    42, 32, 33, 31, 17));
olivia.addModifier(new FehWeaponModifier(GRADIVUS));

let lynBraveHeroes = new FehUnit();
lynBraveHeroes.addModifier(new FehOverwriteModifier(
    "Lyn (Brave Heroes)", "/res/img/heroes/Icon_Portrait_Lyn_(Brave_Heroes).png",
    WEAPON_LANCE, MOVEMENT_CAVALRY,
    42, 32, 33, 31, 17));
lynBraveHeroes.addModifier(new FehWeaponModifier(GRADIVUS));

let royBraveHeroes = new FehUnit();
royBraveHeroes.addModifier(new FehOverwriteModifier(
    "Roy (Brave Heroes)", "/res/img/heroes/Icon_Portrait_Roy_(Brave_Heroes).png",
    WEAPON_LANCE, MOVEMENT_CAVALRY,
    42, 32, 33, 31, 17));
royBraveHeroes.addModifier(new FehWeaponModifier(GRADIVUS));

let leo = new FehUnit();
leo.addModifier(new FehOverwriteModifier(
    "Leo", "/res/img/heroes/Icon_Portrait_Leo.png",
    WEAPON_LANCE, MOVEMENT_CAVALRY,
    42, 32, 33, 31, 17));
leo.addModifier(new FehWeaponModifier(GRADIVUS));

// OPCION.2 - onEquip(unit) este se ve mejor, en ese momento le ponemos el modifier

battle.playerTeam.push(olivia);
battle.playerTeam.push(lynBraveHeroes);
battle.playerTeam.push(royBraveHeroes);
battle.playerTeam.push(leo);

// =============================================================================================

let gui = new FehBattleGui(document.querySelector('#game-div'), battle.getController(KEY_PLAYER));
gui.aiStepFunction = () => aiStep(battle.getController(KEY_ENEMY));
battle.addBattleListener(gui);
battle.restart();

// =============================================================================================
