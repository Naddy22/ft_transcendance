import * as BABYLON from 'babylonjs';
import { Ball3D } from './ball3D.js';
import { Paddle3D } from './paddle3D.js';
import { Player3D } from './player3D.js';
var gameLoopId = null;
var gameStarted = false; // Variable pour savoir si le jeu a commencé
export function startPongGame3D() {
    // 1. Récupère le canvas et crée le moteur BabylonJS
    var canvas = document.getElementById('gameCanvas');
    var engine = new BABYLON.Engine(canvas, true);
    // 2. Crée la scène
    var scene = new BABYLON.Scene(engine);
    // 3. Ajoute une caméra qui regarde vers le centre de la scène
    var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 20, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    // 4. Ajoute une lumière simple
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    // 5. Instancie les objets de jeu en 3D
    var ball = new Ball3D(scene, 0, 0, 10);
    var leftPaddle = new Paddle3D(scene, 10, canvas.height / 2);
    var rightPaddle = new Paddle3D(scene, canvas.width - 20, canvas.height / 2);
    var leftPlayer = new Player3D("Player 1");
    var rightPlayer = new Player3D("Player 2");
    // 6. Gestion des entrées clavier pour les paddles et pour démarrer le jeu
    var gameStarted = false;
    window.addEventListener("keydown", function (event) {
        if (event.key === "w")
            leftPaddle.movingUp = true;
        if (event.key === "s")
            leftPaddle.movingDown = true;
        if (event.key === "ArrowUp")
            rightPaddle.movingUp = true;
        if (event.key === "ArrowDown")
            rightPaddle.movingDown = true;
        if (event.code === "Space" && !gameStarted) {
            gameStarted = true;
        }
    });
    window.addEventListener("keyup", function (event) {
        if (event.key === "w")
            leftPaddle.movingUp = false;
        if (event.key === "s")
            leftPaddle.movingDown = false;
        if (event.key === "ArrowUp")
            rightPaddle.movingUp = false;
        if (event.key === "ArrowDown")
            rightPaddle.movingDown = false;
    });
    // 7. La boucle de jeu : ici, on met à jour la logique avant chaque rendu de la scène
    scene.registerBeforeRender(function () {
        if (gameStarted) {
            ball.update(canvas.height, leftPaddle, rightPaddle);
            leftPaddle.update(canvas.height);
            rightPaddle.update(canvas.height);
            // Ici, tu pourras ajouter ta logique de détection des buts, réinitialisation, etc.
        }
        else {
            // Tu peux afficher un message de démarrage via le DOM ou en utilisant le GUI de BabylonJS
        }
    });
    // 8. Lancer la boucle de rendu de BabylonJS
    engine.runRenderLoop(function () {
        scene.render();
    });
    // 9. Adapter le redimensionnement du canvas
    window.addEventListener("resize", function () {
        engine.resize();
    });
}
