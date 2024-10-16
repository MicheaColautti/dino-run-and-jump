
detectOs();
function blockInput() {
    document.getElementById("btn_jump").disabled = !document.getElementById("btn_jump").disabled;
}

function detectOs() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;


    if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
        window.addEventListener("devicemotion", handleMotionIos, true);

    }else{
        os = 'Android';
        window.addEventListener("devicemotion", handleMotionAndroid, true);
    }
    document.getElementById("os").innerHTML = "Dispositivi IOS non supportati. <br>Usa il tasto Jump";
}



function handleMotionIos(event) {
    var itd = getIsTouchingDown();
    var acc = event.acceleration.y;
    if (acc > 10 && itd) {
        jump();
    }
}

function handleMotionAndroid(event) {
    var itd = getIsTouchingDown();
    var acc = event.acceleration.z;
    if (acc > 10 && itd) {
        jump();

    }

}

function requestPermission() {
    if (typeof(DeviceMotionEvent) !== "undefined" && typeof(DeviceMotionEvent.requestPermission) === "function") {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response == "granted") {
                    window.addEventListener("devicemotion", (e) => {})
                }
            })
            .catch(console.error)
    } else {
        alert("DeviceMotionEvent is not defined");
    }
}