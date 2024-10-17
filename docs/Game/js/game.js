var host = "" //"/dino-run-and-jump/Game";
var game;


//configurazione firebase
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

/**
 * La funzione setSettingsPhaser, imposta le funzioni principali di phaser e 
 * imposta i metodi preload, create e update che saranno poi richiamati da phaser
 * stesso per far funzionare il gioco. Inoltre crea il gioco all'interno del div
 * con l'id "gameDiv".
 */
 function setSettingsPhaser() {

    var sceneLobby = {
        key: 'sceneLobby',
        preload: preloadGame,
        create: createGame,
        update: updateLobby
    };
    var sceneGame = {
        key: 'sceneGame',
        preload: preloadGame,
        create: createGame,
        update: updateGame
    };

    var config = {
        type: Phaser.auto,
        width: window.innerWidth,
        height: window.innerHeight,

        scene: [sceneLobby, sceneGame],

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

//#region dichiarazione costanti 

// Inizializzare Firebase
const app = firebase.initializeApp(firebaseConfig);

// Inizializzare database
const db = firebase.database();

// Inizializzare variabili globali legate a firebase
const auth = firebase.auth();
var timestamp = Date.now();
const user = firebase.auth().currentUser;
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
var uids = [];
var gameRef;
var runGame = false;

// Inizializzare costanti di gioco
var NUM_DINI = 0;
const NUM_GROUNDS = 3;
const NUM_MOUNTAINS = 10;
const NUM_CACTUS = 5;
const START_HEIGHT = 410;
const HEIGHT_SPACE = 30;
const START_DISTANCE_CACTUS = 900;
const START_DISTANCE_DINI = 240;
const TRANSLATION = 20;
const HEIGHT_CACTUS = 50;
const HEIGHT_DINI = 50;

// Inizializzare variabili di gioco
var grounds;
var mountains;
var cloud;
var colorDini = "0x";

var dini;
var cactus;
var linesGroup;

var minimumDistance;
var colliderDini;
var backgroundSpeed;
var score;
var cactusValidation;

var diniNicknames = [];
var childNum;
var diniJumps = [];
var diniColor = [];
var checkFirst = false;
//#endregion

/**
 * Questo codice viene richiamato quando un nuovo giocatore si collega alla sessione.
 * La funzione aggiunge elementi agli array nelle variabili globali, per aggiungere il nuovo dino e ricarica la scena di gioco.
 */
 db.ref("session/" + localStorage.getItem("sessionId")).on("child_added", function(snapshot) {
    db.ref('session/' + localStorage.getItem("sessionId") + "/").once('value', function(snapshot) {
        childNum = snapshot.numChildren();
    });
    if(checkFirst && childNum > 0){
        if (NUM_DINI < 10) {
            NUM_DINI++;
            var id = snapshot.key;
            if (id.startsWith("guest_")) {
                diniNicknames.push(snapshot.key);
                diniColor.push(snapshot.val().dino_color);
                uids.push(null);
            } else if (id.length == 28) {
                var dinoColor=getDinoColorNew(id);
                console.log("Eddi");
                console.log("Color: "+dinoColor.toString()+" | ");
                console.log("Ocane");
                db.ref('user/' + snapshot.key).once("value", function(data) {
                    var uid = data.key;
                    uids.push(uid);
                    diniNicknames.push(data.val().nickname);
                    diniColor.push(dinoColor);
                });
            }
            diniJumps.push(false);
            gameRef.scene.restart();
        }
    }else{
        checkFirst = true;
    }
});


/**
 * La funzione preloadGame viene richiamata direttamente da Phaser quando viene avviato il gioco.
 * Questa funzione carica gli assets per poi usarli nella scena gioco.
 */
function preloadGame() {
    this.load.image('ground', host + 'img/terreno3.png');
    this.load.image('mountains', host + 'img/montagne.png');
    this.load.image('cloud', host + 'img/Nuvola.png');
    this.load.image('cactus', host + 'img/Cactus.png');
    this.load.spritesheet('dinoSprite', host + 'img/dinoSprite.png', {
        frameWidth: 50,
        frameHeight: 52
    });
}

/**
 * La funzione updateLobby viene richiamata direttamente da Phaser dopo la funzione createGame, come impostato nel metodo setSettingsPhaser().
 * Questo metodo viene ciclato e richiamato 60 volte al secondo.
 * Il metodo permette al dino di saltare, senza però far muovere il gioco.
 * Quando la variabile runGame viene settata a true il metodo carica la scena di gioco.
 */
function updateLobby() {

    setTouchingDown();
    checkJump();
    if (runGame) {

        db.ref("session/" + localStorage.getItem("sessionId")).off("child_added", function(snapshot) {
            NUM_DINI++;
            gameRef.scene.restart();
        });

        this.scene.switch('sceneGame');
    }
}

/**
 * Il metodo createListeners crea 2 listeners che gestiscono la ricezione del salto connettendosi a firebase.
 * Un listener è utilizzato per gestire il salto dei guest, mentre l'altro per gestire il salto degli utenti loggati.
 */
 function createListeners() {
    for (var i = 0; i < diniNicknames.length; i++) {
        if (diniNicknames[i].startsWith("guest_")) {
            db.ref("session/" + localStorage.getItem("sessionId") + "/" + diniNicknames[i]).on("child_changed", function(data) {
                var index = diniNicknames.indexOf((data.ref_.path.pieces_)[2]);
                var player_jump = data.val();
                if (player_jump && (data.ref_.path.pieces_)[3] == "is_jumping") {
                    diniJumps[index] = true;
                }
            });
        } else {
            db.ref("session/" + localStorage.getItem("sessionId") + "/" + uids[i]).on("child_changed", function(snapshot) {
                var index = uids.indexOf((snapshot.ref_.path.pieces_)[2]);
                var player_jump = snapshot.val();
                if (player_jump && (snapshot.ref_.path.pieces_)[3] == "is_jumping") {
                    diniJumps[index] = true;
                }
            });
        }
    }
}


/**
 * La funzione setStartValues istanzia le variabili e gli array globali precedentemente creati e li prepara
 * per essere utilizzati nel gioco.
 */
function setStartValues() {
    grounds = new Array(NUM_GROUNDS);

    mountains = new Array(NUM_MOUNTAINS);

    cloud;
    colorDini = "0x";

    dini = new Array(NUM_DINI);
    cactus = new Array(NUM_DINI);

    for (var i = 0; i < cactus.length; i++) {
        cactus[i] = new Array(NUM_CACTUS);
    }

    linesGroup = [];

    minimumDistance = 260;
    colliderDini = new Array(NUM_DINI);
    backgroundSpeed = 5;
    score = new Array(NUM_DINI);
    for (var i = 0; i < score.length; i++) {
        score[i] = 0;
    }
    cactusValidation = new Array(NUM_DINI);
    for (var i = 0; i < cactusValidation.length; i++) {
        cactusValidation[i] = new Array(NUM_CACTUS);
    }

    for (var i = 0; i < cactusValidation.length; i++) {
        for (var j = 0; j < cactusValidation[i].length; j++) {
            cactusValidation[i][j] = false;
        }
    }

    for (var i = 0; i < diniNicknames.length; i++) {
        if (diniNicknames[i].startsWith("guest_")) {
            db.ref("session/" + localStorage.getItem("sessionId") + "/" + diniNicknames[i]).update({
                is_jumping: false
            });
        } else /*if (id.length == 28)*/ {
            db.ref("session/" + localStorage.getItem("sessionId") + "/" + uids[i]).update({
                is_jumping: false
            });
        }
    }
    createListeners();
}


/**
 * Il metodo setColliderLines crea delle linee di sostegno per i dini.
 * Queste linee invisibili permettono ai dini di non cadere in fondo alla pagina, ma di seguire 
 * la linea a loro assegnata in modo da rimanere nella giusta corsia.
 */
function setColliderLines() {
    linesGroup = gameRef.physics.add.staticGroup();
    for (var i = 0; i < NUM_DINI; i++) {
        var height = START_HEIGHT + (i * HEIGHT_SPACE);
        let line = gameRef.add.zone(0, height, innerWidth, 1)
        linesGroup.add(line);
    }
}

/**
 * La funzione setGrounds crea i terreni che si visualizzeranno.
 * I terreni creati sono solo delle immagini, dato che i dini sono già sostenuti
 * dalle linee create nel metodo setColliderLines.
 */
function setGrounds() {
    var counter = 0;
    for (var i = 0; i < grounds.length; i++) {
        grounds[i] = gameRef.physics.add.image(counter, 368, 'ground').setOrigin(0, 0);
        grounds[i].setImmovable(true); // fissa i terreni
        grounds[i].body.allowGravity = false; // toglie la gravità
        counter += 2000;
    }
}

/**
 * La funzione setMountains carica le immagini delle montagne di sfondo del gioco
 * e le imposta nella posizione corretta.
 */
function setMountains() {
    counter = 0;
    for (var i = 0; i < mountains.length; i++) {
        mountains[i] = gameRef.physics.add.image(counter, 275, 'mountains').setOrigin(0, 0);
        mountains[i].setImmovable(true); //fissa le mountains
        mountains[i].body.allowGravity = false; // toglie la gravità
        counter += 408;
    }
}

/**
 * La funzione setCloud carica l'immagine della nuvola di sfondo del gioco
 *  e la imposta nella posizione corretta.
 */
function setCloud() {
    cloud = gameRef.add.image(1200, 255, 'cloud').setOrigin(0, 0);
}

/**
 * La funzione set cactus crea i cactus per ogni corsia di ogni dino.
 * La posizione dei cactus è casuale, ma rimane comunque uguale per ogni utente.
 * I cactus vengono impostati non soggetti a gravità in modo da non dover creare delle linee di sostegno.
 */
function setCactus() {

    for (var i = 0; i < cactus.length; i++) {
        for (var j = 0; j < cactus[i].length; j++) {
            var distance = Math.floor(Math.random() * 200) + 70;
            var x = 0;
            if (j == 0) {
                x = START_DISTANCE_CACTUS + (i * TRANSLATION);
            } else if (i == 0) {
                x = (cactus[i][j - 1]).x + minimumDistance + distance;
            } else {
                x = cactus[i - 1][j].x + TRANSLATION;
            }
            cactus[i][j] = gameRef.physics.add.image(x, START_HEIGHT + (i * HEIGHT_SPACE) - HEIGHT_CACTUS, 'cactus').setOrigin(0, 0);
            cactus[i][j].setImmovable(true);
            cactus[i][j].body.allowGravity = false;
        }
    }
}

/**
 * La funzione setDiniNicknames serve a fare apparire per ogni dino il suo nickname, visualizzandolo
 * a sinistra all'inizio della sua corsia.
 */
function setDiniNicknames() {
    for (var i = 0; i < diniNicknames.length; i++) {
        gameRef.add.text(START_DISTANCE_DINI + (i * TRANSLATION) - 200, START_HEIGHT - 20 + HEIGHT_SPACE * i, diniNicknames[i], { fontFamily: 'Arial', fontSize: 20, color: '#000' });
    }
}

/**
 * La funzione setDini crea i dini per ogni utente collegato.
 * Setta i dini nella posizione corretta in modo che si posizionino su una retta obliqua.
 * Imposta per ogni dino il suo colore.
 * Imposta per ogni dino la collisione con la sua linea di sostegno create precedentemente nel metodo setColliderLines.
 * Come ultima cosa attiva l'animazione di corsa dei dini.
 */
function setDini() {
    graphics = gameRef.add.graphics({ lineStyle: { width: 4, color: 0xaa00aa } });
    for (var i = 0; i < dini.length; i++) {
        dini[i] = gameRef.physics.add.sprite(START_DISTANCE_DINI + (i * TRANSLATION), 0, 'dinoSprite').setOrigin(0, 0);
        dini[i].setTintFill(diniColor[i], diniColor[i], diniColor[i], diniColor[i]);
        dini[i].setCollideWorldBounds(true); //collisioni del dino con i bordi
        colliderDini[i] = gameRef.physics.add.collider(dini[i], linesGroup.getChildren()[i]);
        dini[i].play("run");
    }
}

/**
 * Questa funzione crea le animazioni dei dini da poter utilizzare nel codice.
 * Crea l'animazione di corsa (run), l'animazione di salto (jump) e l'animazione di morte (death).
 */
function setAnimations() {
    //animazione di corsa
    gameRef.anims.create({
        key: 'run',
        frames: gameRef.anims.generateFrameNumbers('dinoSprite', {
            start: 0,
            end: 1
        }),
        frameRate: 10,
        repeat: -1
    });

    //animazione di salto
    gameRef.anims.create({
        key: 'jump',
        frames: gameRef.anims.generateFrameNumbers('dinoSprite', {
            start: 2,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    });

    //animazione di morte
    gameRef.anims.create({
        key: 'death',
        frames: gameRef.anims.generateFrameNumbers('dinoSprite', {
            start: 3,
            end: 3
        }),
        frameRate: 10,
        repeat: -1
    });
}

/**
 * La funzione collideCactus è la funzione della morte del dino e viene richiamata quando un dino collide con un cactus.
 * Attiva l'animazione di morte, rallenta il dino e rimuove il collider con la sua linea di sostegno per far cadere il dino.
 * @param {*} dino Questo parametro è il dino che ha colliso e dunque quello a cui bisogna applicare le modifiche.
 */
function collideCactus(dino) {
    dino.setVelocityX(-200);
    var index = dini.indexOf(dino);
    dino.play("death");
    if (colliderDini[index] != null || colliderDini[index] != undefined) {
        this.physics.world.removeCollider(colliderDini[index]);
    }
}

/**
 * Il metodo setColliderCactusDini imposta per ogni dino le collisioni con i suoi rispettivi cactus.
 * Imposta quello che accade quando essi collidono: viene richiamata la funzione collideCactus.
 */
function setColliderCactusDini() {
    for (var i = 0; i < cactus.length; i++) {
        for (var j = 0; j < cactus[i].length; j++) {
            gameRef.physics.add.overlap(dini[i], cactus[i][j], collideCactus, null, gameRef);
        }
    }
}

/**
 * La funzione createGame imposta tutti gli elementi del gioco e lo prepara per essere completamente funzionante.
 * Questa funzione viene richiamata automaticamente da Phaser dopo la funzione preloadGame,
 * come impostato nel metodo setSettingsPhaser().
 */
function createGame() {
    document.getElementById('sessionId').innerHTML = localStorage.getItem("sessionId");
    gameRef = this;
    
    setStartValues();
    setColliderLines();
    setGrounds();
    setMountains();
    setCloud();
    setCactus();
    setAnimations();
    setDini();
    setColliderCactusDini();
    setDiniNicknames();
}


/**
 * La funzione updateGrounds sposta i terreni in modo da farli muovere sotto i "piedi" dei dini.
 * Inoltre se i terreni escono completamente dal canvas vengono ridisegnati in fondo.
 */
function updateGrounds() {
    //grounds si spostano
    for (var i = 0; i < grounds.length; i++) {
        grounds[i].x -= backgroundSpeed;
    }

    //se escono completamente dal canvas vengono ridisegnati in fondo
    for (var i = 0; i < grounds.length; i++) {
        if (grounds[i].x < -2000) {
            grounds[i].x = 1100;
        }
    }
}

/**
 * La funzione updateMountains sposta le montagne in modo da farle muovere nello sfondo.
 * Inoltre se escono completamente dal canvas vengono ridisegnate in fondo.
 */
function updateMountains() {
    //mountains si spostano
    for (var i = 0; i < mountains.length; i++) {
        mountains[i].x -= 1;
    }

    //se escono completamente dal canvas vengono ridisegnati infondo
    for (var i = 0; i < mountains.length; i++) {
        if (mountains[i].x < -2000) {
            mountains[i].x = 2000;
        }
    }
}

/**
 * La funzione updateCactus sposta i cactus in modo da muoverli in linea con il resto.
 * Quando una linea (verticale) di cactus esce dal canvas viene riposizionata in fondo
 * in modo casuale come nella creazione.
 */
function updateCactus() {
    //cactus si spostano

    for (var i = 0; i < cactus.length; i++) {
        for (var j = 0; j < cactus[i].length; j++) {
            cactus[i][j].x -= backgroundSpeed;
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
                    cactus[i][j].x = cactus[i][num].x + minimumDistance + Math.floor(Math.random() * 200) + 70;
                } else {
                    cactus[i][j].x = cactus[i - 1][j].x + TRANSLATION;
                }
                cactusValidation[i][j] = false;
            }
        }
    }
}

/**
 * La funzione updateCloud sposta la nuvola in modo da farla muovere nello sfondo.
 * Inoltre se esce completamente dal canvas viene ridisegnate in una posizione casuale.
 */
function updateCloud() {
    //movimento cloud
    cloud.x -= 3;

    //cloud random
    if (cloud.x < -97) {
        cloud.x = Math.floor(Math.random() * 2000) + 900;
    }
}

/**
 * Il metodo checkJump controlla per ogni dino se la variabile diniJumps è stata
 * settata a true dal listener dei jump. Se è impostata a true e il dino non sta già saltando,
 * dunque sta toccando terra, carica l'animazione di salto ed esegue il salto.
 * Alla fine imposta tutte le variabili di salto a false.
 */
function checkJump() {
    for (var i = 0; i < dini.length; i++) {
        if (diniJumps[i] && dini[i].body.touching.down) { // https://phaser.io/examples/v3/view/physics/arcade/body-on-a-path
            dini[i].play("jump");
            dini[i].setVelocityY(-950);
            dini[i].play("run");
            diniJumps[i] = false;
            if (diniNicknames[i].startsWith("guest_")) {
                db.ref('session/' + localStorage.getItem("sessionId") + "/" + diniNicknames[i]).update({ 'is_jumping': false });
            } else {
                db.ref('session/' + localStorage.getItem("sessionId") + "/" + uids[i]).update({
                    is_jumping: false
                });
            }
        }
    }
}

/**
 * Il metodo setScore imposta il punteggio per ogni dino, incrementandolo per ogni cactus superato.
 * Per evitare l'assegnazione dei punti dei cactus già precedentemente superati, si utilizza la matrice 
 * cactusValidation.
 */
function setScore() {
    for (var i = 0; i < dini.length; i++) {
        for (var j = 0; j < cactus[i].length; j++) {
            if (dini[i].x > cactus[i][j].x + TRANSLATION && !cactusValidation[i][j]) {
                score[i]++;
                cactusValidation[i][j] = true;
                updateDifficulty();
            }
        }
    }
}

/**
 * Il metodo setDifficulty incrementa la velocità di sfondo e la distaza minima tra i cactus in modo da 
 * rendere il gioco più difficile.
 * La funzione viene richiamata ad ogni superamento di un cactus.
 */
function updateDifficulty() {
    backgroundSpeed += 0.2 / NUM_DINI;
    minimumDistance += 8 / NUM_DINI;
}

/**
 * Il metodo controlla la posizione y di ogni dino, vedendo se è caduto e dunque morto.
 * Se tutti i dini sono morti richiama la funzione checkEndOfGame.
 * @param {*} game Il riferimento del gioco da passare alla funzione checkEndOfGame.
 */
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

/**
 * Questa funzione modifica il valore di firebase per ogni dino 'is_touchingDown' aggiornandolo controllando se 
 * effettivamente il dino in questione sta collidendo verso il basso.
 */
function setTouchingDown() {
    for (let i = 0; i < diniNicknames.length; i++) {
        if (diniNicknames[i].startsWith("guest_")) {
            db.ref('session/' + localStorage.getItem("sessionId") + "/" + diniNicknames[i]).update({ 'is_touchingDown': dini[i].body.touching.down });
        } else {
            db.ref('session/' + localStorage.getItem("sessionId") + "/" + uids[i]).update({ 'is_touchingDown': dini[i].body.touching.down });
        }
    }
}

/**
 * La funzione updateGame viene richiamata direttamente da Phaser dopo la funzione createGame, come impostato nel metodo setSettingsPhaser().
 * Questo metodo viene ciclato e richiamato 60 volte al secondo.
 * La funzione rende possibile il salto e la morte dei dini.
 * Aggiorna il gioco facendo muovere terreni, montagne, cactus e la nuvola.
 * Inoltre imposta il punteggio e la difficoltà e controlla se il gioco finisce.
 */
function updateGame() {
    setTouchingDown();
    updateGrounds();
    updateMountains();
    updateCactus();
    updateCloud();
    checkJump();
    setScore();
    checkEndOfGame(this);
}

/**
 * La funzione endOfTheGame fa terminare il gioco caricando la scena della leaderboard.
 * @param {*} game Questo parametro è il riferimento al gioco, che permette alla funzione di poterlo fermare.
 */
function endOfTheGame(game) {
    game.input.stopPropagation();
    leaderboard();
    game.scene.stop();
}

/**
 * La funzione StartGame fa iniziare il gioco, impostando la variabile globale runGame a true.
 */
function startGame() {
    runGame = true;
    gameRef.scene.restart();
}

/**
 * La funzione leaderboard lista tutti i giocatori e li ordina per il punteggio.
 * Crea una tabella con la classifica e genera una medaglia utilizzando il metodo
 * createMedal al primo classificato.
 * Inoltre se l'utente è loggato salva la medaglia su firebase e se ha realizzato
 * il suo punteggio più alto salva anch'esso su firebase.
 */
function leaderboard() {
    document.getElementById("game").style.display = "none";
    document.getElementById("leaderboard").style.display = "block";
    var result = {};
    diniNicknames.forEach((key, i) => result[key] = score[i]);

    var items = Object.keys(result).map(function(key) {
        return [key, result[key]];
    });

    // Sort the array based on the second element
    items.sort(function(first, second) {
        return second[1] - first[1];
    });
    document.getElementById("restart").style.display = "block";
    document.getElementById("home").style.display = "block";
    var table = document.getElementById("leader_table");
    var medal = createMedal(0, 0, 100);
    var i = 1;
    for (const [key, value] of items) {
        var row = "";
        row += '<tr><th scope="row">' + i + '</th><td>' + key + '</td><td>' + value + '</td>';
        if (i == 1) {
            row += '<td><svg width="100px" height="100px">' + medal + '</svg></td>';
            if (!key.includes("guest")) {
                saveMedal(medal, key);
                saveScore(value, key);
            }
        } else {
            row += "<td></td>";
        }
        row += "</tr>"
        table.innerHTML += row;
        i++;
    }
}

/**
 * La funzione saveMedal salva la medaglia su firebase all'utente passato come parametro.
 * @param {*} medal Il codice svg della medaglia da salvare
 * @param {*} user L'utente a cui salvare la medaglia su firebase
 */
function saveMedal(medal, user) {
    db.ref('user/' + uids[diniNicknames.indexOf(user)] + "/medals").push({
        medal
    });
}

/**
 * La funzione saveScore salva il punteggio su firebase all'utente passato come parametro.
 * @param {*} score Il punteggio da salvare
 * @param {*} user L'utente a cui salvare il punteggio su firebase
 */
function saveScore(score, nick) {
    console.log('user/' + uids[diniNicknames.indexOf(nick)]);
    console.log(score);
    db.ref('user/' + uids[diniNicknames.indexOf(nick)]).once("value", function(data) {
        var old_score = data.val().best_score;
        if (score > old_score) {
            db.ref('user/' + uids[diniNicknames.indexOf(nick)]).update({
                best_score: score,
            });
        }
    });

}

/**
 * Il metodo backToHome carica la pagina iniziale di login (login.html).
 * Inoltre elimina la sessione creata
 */
function backToHome() {

    db.ref('session/' + localStorage.getItem("sessionId")).remove();
    window.open("./../GUI/login.html", "_self");
}

/**
 * La funzione ritorna il colore del dino
 */
 async function getDinoColorNew(id) {
    return db.ref('user/' + id).once('value').then(function(snapshot) {
        return snapshot.val().dino_color;
    });
}