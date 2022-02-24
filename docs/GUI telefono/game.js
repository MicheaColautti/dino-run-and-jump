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


/*function motionListener() {
    // feature detect
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', function(event) {
                        console.log(event.acceleration.x + ' m/s2');
                        console.log("Acceleration along the X-axis " + event.acceleration.x);
                        console.log("Acceleration along the Y-axis " + event.acceleration.y);
                        console.log("Acceleration along the Z-axis " + event.acceleration.z);

                        document.getElementById("x").innerHTML = event.acceleration.x;
                        document.getElementById("y").innerHTML = event.acceleration.y;
                        document.getElementById("z").innerHTML = event.acceleration.z;
                    });
                }
            })
            .catch(console.error);
    } else {
        // handle regular non iOS 13+ devices
    }
}*/

function getAccel() {
    DeviceMotionEvent.requestPermission().then(response => {
        if (response == 'granted') {
            window.addEventListener('devicemotion', function(event) {
                console.log(event.acceleration.x + ' m/s2');
                console.log("Acceleration along the X-axis " + event.acceleration.x);
                console.log("Acceleration along the Y-axis " + event.acceleration.y);
                console.log("Acceleration along the Z-axis " + event.acceleration.z);

                document.getElementById("x").innerHTML = event.acceleration.x;
                document.getElementById("y").innerHTML = event.acceleration.y;
                document.getElementById("z").innerHTML = event.acceleration.z;
            });
        }
    });
}

function blockInput() {
    document.getElementById("btn_jump").disabled = !document.getElementById("btn_jump").disabled;
}