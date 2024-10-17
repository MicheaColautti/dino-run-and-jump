// Configurazioni di Firebase
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
const nickname = "";
var code = 0;
var isTouchingDown = true;
var childNum;
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

//#region bacheca.html
function writeMedals() {
    db.ref('user/' + localStorage.getItem("userUid") + "/medals").once('value', function(snapshot) {
        var elemento = document.getElementById("tabMedaglie");
        snapshot.forEach(function(childSnapshot) {
            elemento.innerHTML += '<svg width="120px" height="120px">' + childSnapshot.node_.children_.root_.value.value_ + '</svg>';
        });
    });
}

//#endregion

//#region collegamentoPartita.html

/**
 * La funzione connectToGame prende il codice della partita inserita dall'utente e se esiste lo aggiunge alla partita.
 * Ogni partita può avere al massimo 10 giocatori connessi.
 */
function connectToGame() {
    code = document.getElementById("code").value;
    localStorage.setItem('code', code);
    db.ref('session/' + code + "/").once('value', function(snapshot) {
        childNum = snapshot.numChildren();
    });
    if (childNum < 11 && childNum != null && childNum != undefined) {
        if (firebase.auth().currentUser == null) {
            generateGuestId();
            db.ref('session/').once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    if (code == childSnapshot.key) {
                        db.ref('session/' + childSnapshot.key + '/' + id).set({
                            is_jumping: false,
                            is_alive: true,
                            is_touchingDown: false,
                            score: 0,
                            dino_color: "0x000",
                        });
                        window.open("game.html", "_self");
                    }
                });
            });
        } else {
            id = firebase.auth().currentUser.uid;
            color=getDinoColor(id);
            db.ref('session/').once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    if (code == childSnapshot.key) {
                        db.ref('session/' + childSnapshot.key + '/' + id).set({
                            is_jumping: false,
                            is_alive: true,
                            is_touchingDown: false,
                            score: 0,
                            dino_color: color,
                        });
                        window.open("game.html", "_self");
                    }
                });
            });
        }
    } else if (childNum >= 10) {
        alert("Troppi giocatori (numero massimo: 10)");
    }
}

/**
 * La funzione generateGuestId crea un nome univoco per i giocatori che non haffo effettuato il login.
 * La stringa contiene un numero randomico di 6 cifre: 'guest_XXXXXX'.
 */
function generateGuestId() {
    id = "guest_" + Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('guestId', id);
    window.open("personalizzaDino.html", "_self");
}

//#endregion

//#region game.html

let isJumping = false;
const jumpCooldown = 1000; // 500 ms cooldown

function jump() {
    if (isJumping) return; // Prevent the function from running if it's already in cooldown

    isJumping = true; // Set the flag to true to prevent further jumps within the cooldown

    db.ref('session/' + localStorage.getItem('code')).once('value', function(snapshot) {
        db.ref('session/').once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                childSnapshot.forEach(function(childChildSnapshot) {
                    console.log("jumpOut");
                    if (localStorage.getItem('guestId') == "null") {
                        if (firebase.auth().currentUser.uid != null && childChildSnapshot.key == firebase.auth().currentUser.uid) {
                            db.ref('session/' + childSnapshot.key + '/' + firebase.auth().currentUser.uid).update({
                                is_jumping: true,
                                score: childChildSnapshot.val().score,
                                is_alive: childChildSnapshot.val().is_alive,
                                dino_color:getDinoColor(childChildSnapshot.key),
                            });
                        }
                    } else if (localStorage.getItem('guestId') == childChildSnapshot.key) {
                        db.ref('session/' + childSnapshot.key + '/' + localStorage.getItem('guestId')).update({
                            is_jumping: true,
                            score: childChildSnapshot.val().score,
                            is_alive: childChildSnapshot.val().is_alive,
                            dino_color: childChildSnapshot.val().dino_color,
                        });
                    }
                });
            });
        });
    });

    // Reset the flag after the cooldown time
    setTimeout(() => {
        isJumping = false;
    }, jumpCooldown);
}


//#endregion

//#region login.html

/**
 * La funzione registerNewUser prende nickname e password inseriti dall'utente e con Firebase l'account viene creato.
 * Se Firebase restituisce un errore viene mostrato all'utente.
 */
function registerNewUser() {
    var password = document.getElementById("password_signIn").value;
    var nickname = document.getElementById("nickname_signIn").value;
    var email = nickname + "@dino.ch";

    // creare nuovo account
    auth.createUserWithEmailAndPassword(email, password)
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            document.getElementById('singIn_error').innerHTML = error.message;
        });
    console.log(firebase.auth().currentUser.uid);
    db.ref('user/' + firebase.auth().currentUser.uid).update({
        best_score: 0,
    })
}

/**
 * La funzione loginUser permette all'utente di autenticarsi con nickname e password.
 */
function loginUser() {
    var password = document.getElementById("password_logIn").value;
    var nickname = document.getElementById("nickname_logIn").value;
    var email = nickname + "@dino.ch";

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            nickname = firebase.auth().currentUser.email.split("@")[0];

            document.getElementById("btn_logout").classList.remove("d-none");
            document.getElementById("btn_account").classList.remove("d-none");
            document.getElementById("btn_account").innerHTML == nickname;
            document.getElementById("div_signin").style.display = "none";
            document.getElementById("btn_login").style.display = "none";

            localStorage.setItem('guestId', null);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            document.getElementById('singIn_error').innerHTML = error.message;
        });
}

/**
 * La funzione logoutUser permette all'utente di disconnettersi dal proprio account.
 */
function logoutUser() {
    firebase.auth().signOut().then(function() {
        location.reload();
    });
}


/**
 * La funzione openUserInformation permette agli utenti di vedere e modificare le proprie informazioni.
 * Apre il file paginaUtente.html.
 */
function openUserInformation() {
    window.open("paginaUtente.html", "_self");

}

/**
 * La funzione generateSession genera un numero a 8 cifre randomico per identificare univocamente le sessioni.
 */
function generateSession() {
    id = Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem("sessionId", id);
    db.ref("session/" + id).set({
            session_id: id,
        })
        .then(() => {
            window.open("../Game/index.html", "_self");
        });
}

//#endregion

//#region personalizzaDino.html

/**
 * La funzione changeDinoColor modifica il colore del dino in base al parametro indicato.
 * @param {*} color il nuovo colore per il dino
 */
function changeDinoColor(color) {
    document.getElementById('dino').style.fill = color;
}

/**
 * La funzione saveDinoColor registra il colore scelto dagli utenti che hanno effettuato il login.
 */
function saveDinoColor() {

    try {
        var idUsr = firebase.auth().currentUser.uid;
    } catch (error) {
        var idUsr = null;
    }
    color = document.getElementById('color_input').value;
    if (localStorage.getItem('guestId') != null && idUsr == null) {
        db.ref('session/').once('value', function(snapshot) {

            snapshot.forEach(function(childSnapshot) {
                if (localStorage.getItem("code") == childSnapshot.key) {
                    color = color.replace("#", "0x");
                    db.ref('session/' + childSnapshot.key + '/' + localStorage.getItem('guestId')).set({
                        is_jumping: false,
                        is_touchingDown: true,
                        is_alive: true,
                        score: 0,
                        dino_color: color,
                    });
                }
            });
        }).then(() => {
            window.open("game.html", "_self");
        });
    } else {
        color = color.replace("#", "0x");
        db.ref('user/' + firebase.auth().currentUser.uid).update({
            dino_color: color,
        }).then(() => {
            window.open("paginaUtente.html", "_self");
        });
    }
}

//#endregion

/**
 * La funzione showUserInformation dopo aver effettuato il login mostra le informazioni dell'utente e le opzioni non visibili ai guest.
 */
function showUserInformation() {
    document.getElementById('user').innerHTML = firebase.auth().currentUser.email.split("@")[0];

    db.ref('user/').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if (firebase.auth().currentUser.uid == childSnapshot.key) {
                var path = window.location.pathname;
                path = path.split("/");
                path = path[path.length - 1];
                var c = childSnapshot.val().dino_color.replace("0x", "#");
                if (path == "paginaUtente.html") {
                    document.getElementById('best_score').innerHTML = childSnapshot.val().best_score == null ? "" : childSnapshot.val().best_score;
                    document.getElementById('dino').style.fill = c;
                } else if (path = "personalizzaDino.html") {
                    document.getElementById('color_input').value = c;
                    document.getElementById('dino').style.fill = c;
                }
            }
        });
    });
}

/**
 * Il listener viene chiamato alla modifica dello stato dell'autenticazione.
 * Serve per avere le informazioni di Firebase sugli utenti autenticati anche
 * dopo che si sono spostati dalla pagina principale del'applicazione.
 */
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        localStorage.setItem('guestId', null);
        localStorage.setItem("userUid", firebase.auth().currentUser.uid);
        var path = window.location.pathname;
        path = path.split("/");
        path = path[path.length - 1];
        //dino-run-and-jump/GUI%20telefono/paginaUtente.html
        if (path == "login.html") {
            document.getElementById("btn_logout").classList.remove("d-none");
            document.getElementById("btn_account").classList.remove("d-none");
            document.getElementById("btn_account").innerHTML += user.email.split("@")[0];
            document.getElementById("div_signin").style.display = "none";
            document.getElementById("btn_login").style.display = "none";
        } else if (path == "paginaUtente.html") {
            showUserInformation();
        } else if (path == "personalizzaDino.html") {
            showUserInformation();
            db.ref('user/').once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    if (firebase.auth().currentUser.uid == childSnapshot.key) {
                        document.getElementById('dino').style.fill = childSnapshot.val().dino_color;
                        document.getElementById('color_input').value = childSnapshot.val().dino_color;
                    }
                });
            });

        } else if (path == "bacheca.html") {
            document.getElementById('username').innerHTML = firebase.auth().currentUser.email.split("@")[0];
        }
        db.ref('user/').once('value', function(snapshot) {
            if (!snapshot.child(firebase.auth().currentUser.uid).exists()) {
                db.ref('user/' + firebase.auth().currentUser.uid).set({
                    best_score: 0,
                    dino_color: "0x0",
                    nickname: firebase.auth().currentUser.email.split("@")[0],
                });
            }
        });
    }
});

/**
 * La funzione checkLoggedUser controlla se l'utente è autenticato e mostra alcune informazioni invisibili agli utenti guest.
 */
function checkLoggedUser() {
    document.getElementById('dino').style.fill = document.getElementById('color_input').value;
    if (localStorage.getItem('guestId') != null) {
        document.getElementById("user_menu").style.display = "none";
    }
}

/**
 * La funzione isTouchingDown legge se il dino dell'utente corrente sta toccando a terra o meno
 * @returns is_touching down
 */
function getIsTouchingDown() {

    if (localStorage.getItem("guestId") == "null") {
        db.ref('session/' + localStorage.getItem("code") + "/" + firebase.auth().currentUser.uid).once('value', function(snapshot) {
            isTouchingDown = snapshot.val().is_touchingDown;

        });
    } else {
        db.ref('session/' + localStorage.getItem("code") + "/" + localStorage.getItem("guestId")).once('value', function(snapshot) {
            isTouchingDown = snapshot.val().is_touchingDown;

        });
    }

    return isTouchingDown;
}


/**
 * La funzione ritorna il colore del dino
 */
function getDinoColor(id) {
    return db.ref('user/' + id).once('value').then(function(snapshot) {
        var color = snapshot.val().dino_color;
        alert(color);
        return color;
    });
}