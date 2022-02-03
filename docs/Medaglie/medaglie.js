

function createMedal(x, y, d){ 
    var medal = [];
    var c = [x+d/2, y+d/2];
    var len = d/Math.sqrt(2);

    medal.push('<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+d/2+'" />');

    var xx = x+(d-len)/2;
    var yy = y+(d-len)/2;

    medal.push('<rect x="'+xx+'" y="'+yy+'"width="'+len+'" height="'+len+'"/>');
    medal.push('<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+len/2+'" />');

    var x75 = xx+len/100*75;
    var y75 = yy+len/100*75;
    var x20 = xx+len/100*20;
    var y20 = yy+len/100*20;
    var x80 = xx+len/100*80;
    var y80 = yy+len/100*80;
    var x65 = xx+len/100*65;
    var y65 = yy+len/100*65;
    var x35 = xx+len/100*35;
    var y35 = yy+len/100*35;
    var x25 = xx+len/100*25;
    var y25 = yy+len/100*25;
    var x50 = xx+len/2;
    var y50 = yy+len/2;

    medal.push('<circle cx="'+x75+'" cy="'+y25+'" r="'+len*0.05+'" />');
    medal.push('<circle cx="'+x75+'" cy="'+y75+'" r="'+len*0.05+'" />');
    medal.push('<circle cx="'+x25+'" cy="'+y25+'" r="'+len*0.05+'" />');
    medal.push('<circle cx="'+x25+'" cy="'+y75+'" r="'+len*0.05+'" />');

    medal.push('<polygon points="'+x35+','+y35+' '+x65+','+y35+' '+x50+','+x80+'" /> ');
    medal.push('<polygon points="'+x20+','+y50+' '+x50+','+(yy+len)+' '+x80+','+y50+' '+x50+','+yy+'" /> ');

    medal.push('<polygon points="'+x20+','+yy+' '+xx+','+y20+' '+xx+','+yy+'" />');
    medal.push('<polygon points="'+x80+','+yy+' '+(xx+len)+','+y20+' '+(xx+len)+','+yy+'" />');
    medal.push('<polygon points="'+xx+','+y80+' '+x20+','+(yy+len)+' '+xx+','+(yy+len)+'" />');
    medal.push('<polygon points="'+x80+','+(yy+len)+' '+(xx+len)+','+y80+' '+(xx+len)+','+(yy+len)+'" />');
    drawMedal(medal);
}

function drawMedal(medal){
    result = "";
    medal.forEach(element => result+= element);
    document.getElementById("svg").innerHTML = result;

}

function getRandomColor(){
    var letters = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f" ];
    var result = "#";
    for(var i = 0; i<6; i++){
        result += letters[Math.floor(Math.random() * letters.length)];
    }
    return result;
}

function fillMedal(medal){

    var quantity = Math.floor(Math.random() * medal.length) + 1;
    var selectedMedals = [];
    var colors = [];
    for(var i = 0; i<quantity; i++){
        var num =  Math.floor(Math.random() * medal.length) + 1;
        if(!num.includes(num)){
            selectedMedals.push(num);
        }
    }


}