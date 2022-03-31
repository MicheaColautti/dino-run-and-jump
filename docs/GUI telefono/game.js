/*let accelerometer = null;
try {
    navigator.permissions.query({ name: 'accelerometer' }).then(function(result) {
        if (result.state === 'granted') {
            accelerometer = new Accelerometer({ referenceFrame: 'device' });
            accelerometer.addEventListener('error', event => {
                // Handle runtime errors.
                if (event.error.name === 'NotAllowedError') {
                    // Branch to code for requesting permission.
                } else if (event.error.name === 'NotReadableError') {
                    console.log('Cannot connect to the sensor.');
                    document.getElementById("x").innerHTML = "errore di connessione";
                }
            });

            accelerometer.addEventListener('reading', () => {
                console.log("Acceleration along the X-axis " + accelerometer.x);
                console.log("Acceleration along the Y-axis " + accelerometer.y);
                console.log("Acceleration along the Z-axis " + accelerometer.z);

                document.getElementById("x").innerHTML = accelerometer.x;
                document.getElementById("y").innerHTML = accelerometer.y;
                document.getElementById("z").innerHTML = accelerometer.z;

            });

            accelerometer.start();
        }
    });
} catch (error) {
    // Handle construction errors.
    if (error.name === 'SecurityError') {
        // See the note above about feature policy.
        console.log('Sensor construction was blocked by a feature policy.');
    } else if (error.name === 'ReferenceError') {
        console.log('Sensor is not supported by the User Agent.');
    } else {
        throw error;
    }
}*/

function blockInput() {
    document.getElementById("btn_jump").disabled = !document.getElementById("btn_jump").disabled;
}

function getOS() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;

    if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';

    }
    document.getElementById("os").innerHTML = "Dispositivi IOS non supportati. <br>Usa il tasto Jump";
}

window.addEventListener("devicemotion", handleMotion, true);

    function handleMotion(event){
        var acc = event.acceleration.z;
        console.log(event.acceleration.z);
        if(acc>12){
            document.getElementById("z").innerHTML += "SALTO ";
        }
        

        
    }