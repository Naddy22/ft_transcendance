var Player = /** @class */ (function () {
    function Player(name) {
        this.name = name;
        this.score = 0;
    }
    Player.prototype.drawScore = function (ctx, x, y) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial"; // Taille et style de police
        ctx.fillText(this.score.toString(), x, y); // Affichage du score
    };
    return Player;
}());
export { Player };
