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
    var itd = getIsTouchingDown();
    alert(itd+" acc"+acc);
    if(itd == undefined){
        itd = false;
    }
    
    if(acc>12 && itd){
        jump();
    }
    
}