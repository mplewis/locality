// code from http://www.javascript-fx.com/development/colorcycle/spancycle.html

var colors = new Array("FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF", "00FFFF");
var startColorNum = 4;
var start  = colors[startColorNum];
var end    = colors[startColorNum];
var index  = 0;
var cindex = 0;
var faderObj = new Array();

function getColor(start, end, percent){
	function hex2dec(hex){return(parseInt(hex,16));}
	function dec2hex(dec){return (dec < 16 ? "0" : "") + dec.toString(16);}
	var r1 = hex2dec(start.slice(0,2)), g1=hex2dec(start.slice(2,4)), b1=hex2dec(start.slice(4,6));
	var r2 = hex2dec(end.slice(0,2)),   g2=hex2dec(end.slice(2,4)),   b2=hex2dec(end.slice(4,6));
	var pc = percent/100;
	var r  = Math.floor(r1+(pc*(r2-r1)) + .5), g=Math.floor(g1+(pc*(g2-g1)) + .5), b=Math.floor(b1+(pc*(b2-b1)) + .5);
	return("#" + dec2hex(r) + dec2hex(g) + dec2hex(b));
}

function doRainbow() {
    
    if(index == 0)
	{
		start = end;
		end = colors[ cindex = (cindex+1) % colors.length ];
	}

    $('.rainbowed').css("color", getColor(start, end, index));

	index = (index+2) % 100;
}

// KOMPRESSOR CRUSH CPU!!!

setInterval(function() {
    doRainbow();
}, 20);