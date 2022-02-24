// Inizializzare variabili
var id = localStorage.getItem('sessionId');
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

db.ref("session/" + id + "/").on("child_added", function(data) {
    console.log(data.key);
    console.log(data.val());
});