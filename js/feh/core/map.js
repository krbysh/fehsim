class FehMap {

    /**
     * 
     * @param {String} backgroundImageUri 
     * @param {String} backgroundPatterUri 
     * @param {Number[][]} playerSpaces
     * @param {Number[][]} enemySpaces
     */
    constructor(backgroundImageUri, backgroundPatterUri, playerSpaces, enemySpaces) {
        this.backgroundImageUri = backgroundImageUri;
        this.backgroundPatterUri = backgroundPatterUri;
        this.playerSpaces = playerSpaces;
        this.enemySpaces = enemySpaces;
    }
}