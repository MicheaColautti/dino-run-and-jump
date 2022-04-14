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