var Player3D = /** @class */ (function () {
    function Player3D(name) {
        this.name = name;
        this.score = 0;
    }
    Player3D.prototype.drawScore = function (ctx, x, y) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial"; // Taille et style de police
        ctx.fillText(this.score.toString(), x, y); // Affichage du score
    };
    return Player3D;
}());
export { Player3D };
