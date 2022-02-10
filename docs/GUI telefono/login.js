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
            console.log(userCredential);
            console.log(document.getElementById("btn_account").innerHTML);

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
    console.log(firebase.auth().currentUser);
    console.log("entra");
    console.log(firebase.auth().currentUser.uid);
    document.getElementById('user').innerHTML = firebase.auth().currentUser.email;
}


function generateSession() {
    var id = Math.floor(100000 + Math.random() * 900000);
    db.ref("session/" + id).set({
        id,
    });
}

function connectToGame() {
    var code = document.getElementById("code").value;

    db.ref('session/').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if (code == childSnapshot.key) {
                console.log(childSnapshot.key);
            }
        });
    });
}