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
            document.getElementById("btn_account").innerHTML += nickname;
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

function openUserInformation() {
    window.open("paginaUtente.html", "_self");

}

function showUserInfromation() {
    document.getElementById('user').innerHTML = firebase.auth().currentUser.email.split("@")[0];

    db.ref('user/').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if (firebase.auth().currentUser.uid == childSnapshot.key) {
                document.getElementById('dino').style.fill = childSnapshot.val().dino_color;
            }
        });
    });
}

function generateSession() {
    id = Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem("sessionId", id);
    console.log(id);
    db.ref("session/" + id).set({
            id,
        })
        .then(() => {
            window.open("/../Game2/index.html", "_self");
        });
}

function generateGuestId() {
    id = "guest_" + Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('guestId', id);
    db.ref('session/').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if (code == childSnapshot.key) {
                db.ref('session/' + childSnapshot.key + '/' + id).set({
                    is_jumping: false,
                    is_alive: true,
                    score: 0,
                });
                window.open("personalizzaDino.html", "_self");
            }
        });
    });
}

function connectToGame() {
    code = document.getElementById("code").value;

    if (firebase.auth().currentUser == null) {
        generateGuestId();
    } else {
        id = firebase.auth().currentUser.uid;
    }
    db.ref('session/').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if (code == childSnapshot.key) {
                db.ref('session/' + childSnapshot.key + '/' + id).set({
                    is_jumping: false,
                    is_alive: true,
                    score: 0,
                });
                window.open("game.html", "_self");
            }
        });
    });
}

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
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
            showUserInfromation();
        } else if (path == "personalizzaDino.html") {
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
    }
});

function watchGame() {

}

function changeDinoColor(color) {
    document.getElementById('dino').style.fill = color;
}

function saveDinoColor() {
    color = document.getElementById('color_input').value;
    console.log(localStorage.getItem('guestId'));
    if (localStorage.getItem('guestId') != null) {
        db.ref('guest_user/' + localStorage.getItem('guestId')).set({
                dino_color: color,
            })
            .then(() => {
                window.open("game.html", "_self");
            });
    } else {
        db.ref('user/' + firebase.auth().currentUser.uid).set({
            dino_color: color,
        }).then(() => {
            window.open("paginaUtente.html", "_self");
        });
    }
}

function checkLoggedUser() {
    document.getElementById('dino').style.fill = document.getElementById('color_input').value;
    if (localStorage.getItem('guestId') != null) {
        document.getElementById("user_menu").style.display = "none";
    }
}

function jump() {
    db.ref('session/').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            childSnapshot.forEach(function(childChildSnapshot) {
                if (childChildSnapshot.key == firebase.auth().currentUser.uid) {
                    db.ref('session/' + childSnapshot.key + '/' + firebase.auth().currentUser.uid).set({
                        is_jumping: true,
                        score: childChildSnapshot.val().score,
                        is_alive: childChildSnapshot.val().is_alive,
                    });
                }
            });
        });
    });
}