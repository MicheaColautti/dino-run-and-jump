let acl = new Accelerometer({ frequency: 60 });
acl.addEventListener('reading', () => {
    console.log("Acceleration along the X-axis " + acl.x);
    console.log("Acceleration along the Y-axis " + acl.y);
    console.log("Acceleration along the Z-axis " + acl.z);


    document.getElementById("x").value = acl.x;
    document.getElementById("y").value = acl.y;
    document.getElementById("z").value = acl.z;

});

acl.start();