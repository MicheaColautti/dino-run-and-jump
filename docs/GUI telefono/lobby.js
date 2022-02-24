// Inizializzare variabili
var id = localStorage.getItem('sessionId');
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

db.ref("session/" + id + "/").on("child_added", function(data) {
    if (data.key != "id") {
        document.getElementById('user_1').innerHTML = data.key;
    }

    console.log(data.key);
    console.log(data.val());
});