document.getElementById("x").value = "ciao";
let accelerometer = null;
try {
    accelerometer = new Accelerometer({ referenceFrame: 'device' });
    accelerometer.addEventListener('error', event => {
        // Handle runtime errors.
        if (event.error.name === 'NotAllowedError') {
            // Branch to code for requesting permission.
        } else if (event.error.name === 'NotReadableError') {
            console.log('Cannot connect to the sensor.');
            document.getElementById("x").value = "errore di connessione";
        }
    });

    accelerometer.addEventListener('reading', () => {
        console.log("Acceleration along the X-axis " + accelerometer.x);
        console.log("Acceleration along the Y-axis " + accelerometer.y);
        console.log("Acceleration along the Z-axis " + accelerometer.z);


        document.getElementById("x").value = accelerometer.x;
        document.getElementById("y").value = accelerometer.y;
        document.getElementById("z").value = accelerometer.z;

    });



    accelerometer.start();

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