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
function connectToGame() {
    code = document.getElementById("code").value;
    localStorage.setItem('code', code);

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
        db.ref('session/').once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                if (code == childSnapshot.key) {
                    db.ref('session/' + childSnapshot.key + '/' + id).set({
                        is_jumping: false,
                        is_alive: true,
                        is_touchingDown: false,
                        score: 0,
                    });
                    window.open("game.html", "_self");
                }
            });
        });
    }
}

function generateGuestId() {
    id = "guest_" + Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('guestId', id);
    window.open("personalizzaDino.html", "_self");
}

//#endregion

//#region game.html
function jump() {
    db.ref('session/' + localStorage.getItem('code')).once('value', function(snapshot) {
        if (snapshot.val().started) {
            console.log("jump");
            db.ref('session/').once('value', function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    childSnapshot.forEach(function(childChildSnapshot) {
                        if (localStorage.getItem('guestId') == null) {
                            if (firebase.auth().currentUser.uid != null && childChildSnapshot.key == firebase.auth().currentUser.uid) {
                                db.ref('session/' + childSnapshot.key + '/' + firebase.auth().currentUser.uid).update({
                                    is_jumping: true,
                                    score: childChildSnapshot.val().score,
                                    is_alive: childChildSnapshot.val().is_alive,
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
        }
    });
}

//#endregion

//#region login.html
function registerNewUser() {
    var password = document.getElementById("password_signIn").value;
    var nickname = document.getElementById("nickname_signIn").value;
    var email = nickname + "@dino.ch";

    // creare nuovo account
    var creato = true;
    auth.createUserWithEmailAndPassword(email, password)
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            document.getElementById('singIn_error').innerHTML = error.message;
        });
}

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
            //window.open("paginaUtente.html", "_self");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            document.getElementById('singIn_error').innerHTML = error.message;
        });
}

function logoutUser() {
    firebase.auth().signOut().then(function() {
        location.reload();
    });
}

function openUserInformation() {
    window.open("paginaUtente.html", "_self");

}

function generateSession() {
    id = Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem("sessionId", id);
    db.ref("session/" + id).set({
            started: false,
        })
        .then(() => {
            window.open("../Game/index.html", "_self");
        });
}

//#endregion

//#region personalizzaDino.html
function changeDinoColor(color) {
    document.getElementById('dino').style.fill = color;
}

function saveDinoColor() {

    try {
        var idUsr = firebase.auth().currentUser.uid;
    } catch (error) {
        console.log(error);
        var idUsr = null;
    }
    color = document.getElementById('color_input').value;
    if (localStorage.getItem('guestId') != null && idUsr == null) {
        db.ref('session/').once('value', function(snapshot) {

            snapshot.forEach(function(childSnapshot) {
                console.log(localStorage.getItem("code") + " || " + childSnapshot.key);
                if (localStorage.getItem("code") == childSnapshot.key) {
                    color = color.replace("#", "0x");
                    db.ref('session/' + childSnapshot.key + '/' + localStorage.getItem('guestId')).set({
                        is_jumping: false,
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

function showUserInformation() {
    document.getElementById('user').innerHTML = firebase.auth().currentUser.email.split("@")[0];

    db.ref('user/').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if (firebase.auth().currentUser.uid == childSnapshot.key) {
                console.log(document.getElementById('dino').style.fill);
                var path = window.location.pathname;
                path = path.split("/");
                path = path[path.length - 1];
                console.log(path);
                var c = childSnapshot.val().dino_color.replace("0x", "#");
                if (path == "paginaUtente.html") {
                    document.getElementById('best_score').innerHTML = childSnapshot.val().best_score == null ? "" : childSnapshot.val().best_score;
                    document.getElementById('dino').style.fill = c;
                } else if (path = "personalizzaDino.html") {
                    document.getElementById('color_input').value = c;
                    document.getElementById('dino').style.fill = c;
                }

                console.log(c);
            }
        });
    });
}

function watchGame() {
    code = document.getElementById("code").value;
    window.open("../Game/index.html", "_self");

    var vieweId = "view" + Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('viewId', vieweId);

    db.ref('session/').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if (code == childSnapshot.key) {
                db.ref('session/' + childSnapshot.key + '/' + vieweId).set({
                    is_jumping: false,
                    is_alive: true,
                    is_touchingDown: false,
                    score: 0,
                });
                window.open("../Game/index.html", "_self");
            }
        });
    });
}

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
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
                    dino_color: "0x0",
                    nickname: firebase.auth().currentUser.email.split("@")[0],
                });
            }
        });


    }
});

function checkLoggedUser() {
    document.getElementById('dino').style.fill = document.getElementById('color_input').value;
    if (localStorage.getItem('guestId') != null) {
        document.getElementById("user_menu").style.display = "none";
    }
}


function getIsTouchingDown() {
    db.ref('session/' + localStorage.getItem("sessionId") + "/" + localStorage.getItem("guestId")).once('value', function(snapshot) {
        return snapshot.val().is_touchingDown;
    });
}