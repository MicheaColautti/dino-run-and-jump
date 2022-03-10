var host = "" //"/dino-run-and-jump/Game";
var game;

var firebaseConfig = {
    apiKey: "AIzaSyA4fyvc6p7bnP6TipjCpcc4V-dhysnRdx0",
    authDomain: "dino-run-and-jump-d2cdb.firebaseapp.com",
    databaseURL: "https://dino-run-and-jump-d2cdb-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "dino-run-and-jump-d2cdb",
    storageBucket: "dino-run-and-jump-d2cdb.appspot.com",
    messagingSenderId: "200118050769",
    appId: "1:200118050769:web:71d81d4e42b99e56110af0",
    measurementId: "G-S7CQ1S72TK"
};

// Inizializzare Firebase
const app = firebase.initializeApp(firebaseConfig);

// Inizializzare database
const db = firebase.database();

// Inizializzare variabili
const auth = firebase.auth();
var timestamp = Date.now();
const user = firebase.auth().currentUser;
var waitLobby = true;
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
var rif;
var runGame = false;

db.ref("session/" + localStorage.getItem("sessionId")).on("child_added", function(snapshot) {
    console.log(snapshot.val());
    NUM_DINI++;
    rif.scene.restart();
    console.log(NUM_DINI);
});

function setSettingsPhaser() {

    var sceneLobby = {
        key: 'sceneLobby',
        preload: preloadGame,
        create: createGame
    };
    var sceneGame = {
        key: 'sceneGame',
        preload: preloadGame,
        create: createGame,
        update: updateGame
    };

    var sceneLeaderboard = {
        key: 'sceneLeaderboard',
        preload: preloadLeaderboard,
        create: createLeaderboard,
        update: updateLeaderboard
    };

    var config = {
        type: Phaser.auto,
        width: window.innerWidth,
        height: window.innerHeight,

        scene: [sceneLobby, sceneGame, sceneLeaderboard],

        scale: {
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },

        physics: {
            default: 'arcade',
            arcade: {
                gravity: {
                    y: 3000
                },
                checkCollision: {
                    up: true,
                    down: false,
                    left: false,
                    right: true
                },
                debug: false
            }
        },

        parent: "gameDiv",

        dom: {
            createContainer: true
        },

        //backgroundColor: 0xDDDDDD
        backgroundColor: 0xFFFFFF,
    };
    game = new Phaser.Game(config);
}

//dichiarazione costanti 

var NUM_DINI = -1;
const NUM_TERRENI = 2;
const NUM_MONTAGNE = 2;
const NUM_CACTUS = 5;
const START_HEIGHT = 410;
const HEIGHT_SPACE = 30;
const START_DISTANCE_CACTUS = 900;
const START_DISTANCE_DINI = 240;
const TRANSLATION = 20;
const ALTEZZA_CACTUS = 50;
const ALTEZZA_DINI = 50;

var terreni;

var montagne;

var nuvola;
var colorDini = "0x";

var dini;
var cactus;
var linesGroup;
var heights;

var distanzaMinima;
var colliderDini;
var velocitaSfondo;
var punteggio;
var pAssegnati;
var supVelocita;

//funzione preloadGame, carica gli assets per poi usarli nella scena gioco
function preloadGame() {
    this.load.image('terreno', host + 'img/terreno2.png');
    this.load.image('montagne', host + 'img/montagne2.png');
    this.load.image('nuvola', host + 'img/Nuvola.png');
    this.load.image('cactus', host + 'img/Cactus.png');
    this.load.spritesheet('dinoSprite', host + 'img/dinoSprite.png', {
        frameWidth: 50,
        frameHeight: 52
    });
}

function setStartValues() {
    terreni = new Array(NUM_TERRENI);

    montagne = new Array(NUM_MONTAGNE);

    nuvola;
    colorDini = "0x";

    dini = new Array(NUM_DINI);

    cactus = new Array(NUM_DINI);
    for (var i = 0; i < cactus.length; i++) {
        cactus[i] = new Array(NUM_CACTUS);
    }

    linesGroup = [];
    heights = new Array(NUM_DINI);

    distanzaMinima = 180;
    colliderDini = new Array(NUM_DINI);
    velocitaSfondo = 5;
    punteggio = new Array(NUM_DINI);
    for (var i = 0; i < punteggio.length; i++) {
        punteggio[i] = 0;
    }
    pAssegnati = new Array(NUM_DINI);
    for (var i = 0; i < pAssegnati.length; i++) {
        pAssegnati[i] = new Array(NUM_CACTUS);
    }

    for (var i = 0; i < pAssegnati.length; i++) {
        for (var j = 0; j < pAssegnati[i].length; j++) {
            pAssegnati[i][j] = false;
        }
    }

    //var supporto per cambio difficoltà
    supVelocita = new Array(NUM_CACTUS);
    for (var i = 0; i < supVelocita.length; i++) {
        supVelocita[i] = true;
    }
}

function setColliderLines(gamescene) {
    linesGroup = gamescene.physics.add.staticGroup();
    for (var i = 0; i < NUM_DINI; i++) {
        var height = START_HEIGHT + (i * HEIGHT_SPACE);
        let line = gamescene.add.zone(0, height, innerWidth, 1)
        linesGroup.add(line);
        heights[i] = height;
        console.log("linea " + i + " " + height)
    }
}

function setTerreni(gamescene) {
    var counter = 0;
    for (var i = 0; i < terreni.length; i++) {
        terreni[i] = gamescene.physics.add.image(counter, 350, 'terreno').setOrigin(0, 0);
        terreni[i].setImmovable(true); //fissa i terreni
        terreni[i].body.allowGravity = false; // toglie la gravità
        counter += 2000;
    }
}

function setMontagne(gamescene) {
    counter = 0;
    for (var i = 0; i < montagne.length; i++) {
        montagne[i] = gamescene.physics.add.image(counter, 275, 'montagne').setOrigin(0, 0);
        montagne[i].setImmovable(true); //fissa le montagne
        montagne[i].body.allowGravity = false; // toglie la gravità
        counter += 2000;
    }
}

function setNuvola(gamescene) {
    nuvola = gamescene.add.image(1200, 255, 'nuvola').setOrigin(0, 0);
}

function setCactus(gamescene) {

    for (var i = 0; i < cactus.length; i++) {
        for (var j = 0; j < cactus[i].length; j++) {
            var distanza = Math.floor(Math.random() * 200) + 70;
            var x = 0;
            if (j == 0) {
                x = START_DISTANCE_CACTUS + (i * TRANSLATION);
            } else if (i == 0) {
                x = (cactus[i][j - 1]).x + distanzaMinima + distanza;
            } else {
                x = cactus[i - 1][j].x + TRANSLATION;
            }
            cactus[i][j] = gamescene.physics.add.image(x, START_HEIGHT + (i * HEIGHT_SPACE) - ALTEZZA_CACTUS, 'cactus').setOrigin(0, 0);
            cactus[i][j].setImmovable(true);
            cactus[i][j].body.allowGravity = false;
        }
    }
}

function setDini(gamescene) {

    graphics = gamescene.add.graphics({ lineStyle: { width: 4, color: 0xaa00aa } });
    for (var i = 0; i < dini.length; i++) {
        dini[i] = gamescene.physics.add.sprite(START_DISTANCE_DINI + (i * TRANSLATION), 0, 'dinoSprite').setOrigin(0, 0);
        dini[i].setTintFill(colorDini, colorDini, colorDini, colorDini);
        dini[i].setCollideWorldBounds(true); //collisioni del dino con i bordi
        colliderDini[i] = gamescene.physics.add.collider(dini[i], linesGroup.getChildren()[i]);
        dini[i].play("run");

    }

}

function setAnimations(gamescene) {
    //animazione di corsa
    gamescene.anims.create({
        key: 'run',
        frames: gamescene.anims.generateFrameNumbers('dinoSprite', {
            start: 0,
            end: 1
        }),
        frameRate: 10,
        repeat: -1
    });

    //animazione di salto
    gamescene.anims.create({
        key: 'jump',
        frames: gamescene.anims.generateFrameNumbers('dinoSprite', {
            start: 2,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    });

    //animazione di morte
    gamescene.anims.create({
        key: 'death',
        frames: gamescene.anims.generateFrameNumbers('dinoSprite', {
            start: 3,
            end: 3
        }),
        frameRate: 10,
        repeat: -1
    });
}

function collideCactus(dino) {
    dino.setVelocityX(-200);
    var index = dini.indexOf(dino);
    dino.play("death");
    if (colliderDini[index] != null || colliderDini[index] != undefined) {
        this.physics.world.removeCollider(colliderDini[index]);
    }
}

function setColliderCactusDini(gamescene) {
    for (var i = 0; i < cactus.length; i++) {
        for (var j = 0; j < cactus[i].length; j++) {
            gamescene.physics.add.overlap(dini[i], cactus[i][j], collideCactus, null, gamescene);
        }
    }
}


var keySpace;
//funzione createGame, crea nel canvas tutti i vari assets caricati nella funzione preload game
function createGame() {
    document.getElementById('sessionId').innerHTML = localStorage.getItem("sessionId");
    rif = this;
    setStartValues();
    setColliderLines(this);
    setTerreni(this);
    setMontagne(this);
    setNuvola(this)
    setCactus(this);
    setAnimations(this);
    setDini(this);
    setColliderCactusDini(this);
    keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    if (runGame) {
        this.scene.switch('sceneGame');
    }
}

function updateTerreni() {
    //terreni si spostano
    for (var i = 0; i < terreni.length; i++) {
        terreni[i].x -= velocitaSfondo;
    }

    //se escono completamente dal canvas vengono ridisegnati in fondo
    for (var i = 0; i < terreni.length; i++) {
        if (terreni[i].x < -2000) {
            terreni[i].x = 1100;
        }
    }
}

function updateMontagne() {
    //montagne si spostano
    for (var i = 0; i < montagne.length; i++) {
        montagne[i].x -= 1;
    }


    //se escono completamente dal canvas vengono ridisegnati infondo
    for (var i = 0; i < montagne.length; i++) {
        if (montagne[i].x < -2000) {
            montagne[i].x = 2000;
        }
    }
}

function updateCactus() {
    //cactus si spostano

    for (var i = 0; i < cactus.length; i++) {
        for (var j = 0; j < cactus[i].length; j++) {
            cactus[i][j].x -= velocitaSfondo;
        }
    }

    //cacactus riposizionamento

    for (var i = 0; i < cactus.length; i++) {
        for (var j = 0; j < cactus[i].length; j++) {
            if (cactus[i][j].x < -26) {
                if (i == 0) {
                    var num = 0;
                    if (j == 0) {
                        num = cactus[i].length - 1;
                    } else {
                        num = j - 1;
                    }
                    cactus[i][j].x = cactus[i][num].x + distanzaMinima + Math.floor(Math.random() * 200) + 70;
                } else {
                    cactus[i][j].x = cactus[i - 1][j].x + TRANSLATION;
                }
                pAssegnati[i][j] = false;
            }
        }
    }

}

function updateNuvola() {
    //movimento nuvola
    nuvola.x -= 3;

    //nuvola random
    if (nuvola.x < -97) {
        nuvola.x = Math.floor(Math.random() * 2000) + 900;
    }
}

function checkJump() {
    if (keySpace.isDown) {
        for (var i = 0; i < dini.length; i++) {
            if (dini[i].body.touching.down) { // https://phaser.io/examples/v3/view/physics/arcade/body-on-a-path
                //salto
                dini[i].play("jump");
                dini[i].setVelocityY(-800);
                dini[i].play("run");

            }
        }
    }
}

function setScore() {
    for (var i = 0; i < dini.length; i++) {
        for (var j = 0; j < cactus[i].length; j++) {
            if (dini[i].x > cactus[i][j].x + TRANSLATION && !pAssegnati[i][j]) {
                punteggio[i]++;
                pAssegnati[i][j] = true;
            }
        }
    }
}

function setDifficulty() {
    var count = 4;
    for (var i = 0; i < 5; i++) {
        var check = false;
        for (var j = 0; j < dini.length; j++) {
            if (!check) {
                check = check || (punteggio[j] > count && supVelocita[i]);
            } else {
                break;
            }
        }
        if (check) {
            velocitaSfondo += 1;
            supVelocita[i] = false;
            distanzaMinima += 30;
        }
        check++;

    }
}

function checkEndOfGame(game) {
    var check = true;
    for (var i = 0; i < dini.length; i++) {
        check = check && dini[i].x < -50;
    }

    if (check) {
        endOfTheGame(game);
        check = false;
    }

}

//funzione updateGame, viene richiamata 60 volte al secondo, utilizzata per i movimenti nel animazione
function updateGame() {
    updateTerreni();
    updateMontagne();
    updateCactus();
    updateNuvola();
    checkJump();
    setScore();
    setDifficulty();
    checkEndOfGame(this);

}



//collisione tra dinosauri e cactus
//function collideCactus(num) {



function endOfTheGame(game) {
    game.input.stopPropagation();
    game.scene.switch('sceneLeaderboard');
}


//scena leaderboard

function preloadLeaderboard() {}

var line3;

function createLeaderboard() {
    graphics = this.add.graphics({
        lineStyle: {
            width: 4,
            color: 0xaa00aa
        }
    });
    line3 = new Phaser.Geom.Line(0, 80, 700, 80);

    var style = {
        font: "bold 32px Arial",
        fill: "#000",
        boundsAlignH: "center",
        boundsAlignV: "middle"
    };
    this.add.text(250, 25, "Leaderboard", style).setOrigin(0, 0);
}

function updateLeaderboard() {
    graphics.strokeLineShape(line3);
}

function startGame() {
    runGame = true;
    rif.scene.restart();
}