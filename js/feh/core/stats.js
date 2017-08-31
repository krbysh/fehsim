const HP = 0;
const ATK = 1;
const SPD = 2;
const DEF = 3;
const RES = 4;

class FehStats {

    constructor(hp, atk, spd, def, res) {
        this.stats = [];
        this.stats[HP] = hp;
        this.stats[ATK] = atk;
        this.stats[SPD] = spd;
        this.stats[DEF] = def;
        this.stats[RES] = res;
    }
}