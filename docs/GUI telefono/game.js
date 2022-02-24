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
    // feature detect
    if (window.DeviceMotionEvent && typeof window.DeviceMotionEvent.requestPermission === 'function') {
        window.DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', function(event) {

                        var x = Math.floor(event.acceleration.x);


                        console.log("Acceleration along the X-axis " + x);
                        console.log("Acceleration along the Y-axis " + event.acceleration.y);
                        console.log("Acceleration along the Z-axis " + event.acceleration.z);

                        document.getElementById("x").innerHTML = event.acceleration.x;
                        document.getElementById("y").innerHTML = event.acceleration.y;
                        document.getElementById("z").innerHTML = event.acceleration.z;
                        document.getElementById("a").innerHTML = "Casted x" + x;
                        document.getElementById("b").innerHTML = "Gravity x" + event.accelerationIncludingGravity.y;


                    });
                } else {



                }
            })
            .catch(e => { console.error(e) });
    } else {
        // handle regular non iOS 13+ devices
    }
}

function blockInput() {
    document.getElementById("btn_jump").disabled = !document.getElementById("btn_jump").disabled;
}