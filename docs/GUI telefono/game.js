let accelerometer = null;
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
}


function reqmotionListener() {
    let accelerometer = null;

    // feature detect
    if (window.EventTarget && typeof window.EventTarget.requestPermission === 'function') {
        window.EventTarget.requestPermission()
            .then(response => {
                if (response === 'granted') {

                    let acl = new Accelerometer({ frequency: 60 });
                    acl.addEventListener('reading', () => {
                        console.log("Acceleration along the X-axis " + acl.x);
                        console.log("Acceleration along the Y-axis " + acl.y);
                        console.log("Acceleration along the Z-axis " + acl.z);
                        document.getElementById("x").innerHTML = acl.x;
                        document.getElementById("y").innerHTML = acl.y;
                        document.getElementById("z").innerHTML = acl.z;
                    });

                    acl.start();
                    /*window.addEventListener('linear', function(event) {

                        var x = Math.floor(event.acceleration.x);


                        console.log("Acceleration along the X-axis " + x);
                        console.log("Acceleration along the Y-axis " + event.acceleration.y);
                        console.log("Acceleration along the Z-axis " + event.acceleration.z);

                        document.getElementById("x").innerHTML = event.acceleration.x;
                        document.getElementById("y").innerHTML = event.acceleration.y;
                        document.getElementById("z").innerHTML = event.acceleration.z;
                        document.getElementById("a").innerHTML = "Casted X " + x;
                        document.getElementById("b").innerHTML = "Gravity Y " + event.accelerationIncludingGravity.y;
                        document.getElementById("c").innerHTML = "Only event Y " + event.y;




                    });*/
                } else {

                }
            })
            .catch(e => { console.error(e) });
    }
}

function blockInput() {
    document.getElementById("btn_jump").disabled = !document.getElementById("btn_jump").disabled;
}