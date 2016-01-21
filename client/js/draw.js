var cWidth = (window.screen.availWidth > 768?window.screen.availWidth*2/3:window.screen.availWidth*0.96);
var cHeight = window.screen.availHeight * 0.7;
var isMouseDown = false;
var lastLoc = {x:0,y:0};
var lastTime = null;
var curColor = "yellow";

var canvas = document.getElementById('canvas');
var cxt = canvas.getContext('2d');

canvas.width = cWidth;
canvas.height = cHeight;




$(document).ready(function(){
	iniCanvas();
	bindMouse();

	document.addEventListener("touchstart",touchStart,false);
	document.addEventListener("touchmove",touchMove,false);
	document.addEventListener("touchend",touchEnd,false);

	$('.colorBtn').each(function(){
		$(this).css('background-color',$(this).attr('data-value'));
	});
	$('#clearBtn').click(function(){
		talk('clear',{});
		// cxt.clearRect(0,0,cWidth,cHeight);
	});
	//for mobile
	document.getElementById('clearBtn').addEventListener("touchstart",clear,false);
	var currD = document.getElementsByClassName('colorBtn');
	for(var i =0;i<currD.length;i++){
		currD[i].addEventListener("touchstart",changeColor,false);
		currD[i].addEventListener("click",changeColor,false);
	}

	var socket = io('/C1');

	socket.on('connect', function(){
		console.log('connect');
	});

	socket.on('disconnect', function(){
		alert('disconnect');
		console.log('disconnect');
	});

	socket.on('ini', function (data) {
		socket_ini(data);
	});

	socket.on('draw', function (data) {
		socket_draw(data);
	});

	socket.on('clear', function (data) {
		socket_clearCanvas(data);
	});

	socket.on('changeColor', function (data) {
		socket_changeColor(data);
	});

	socket.on('stop', function (data) {
		socket_stopDraw(data);
	});




	function touchStart(e){
		e.preventDefault();
		var touch = event.touches[0];

		touch.currLoc = getPosition(touch.pageX,touch.pageY);
		touch.currTime = (new Date()).getTime();
		if(touch.currLoc.x == -1 || touch.currLoc.y == -1){return;}
		else{
			var data = {
				isMouseDown:true,
				lastLoc: touch.currLoc,
				lastTime: touch.currTime
			}
			talk('ini',data);
		}
	}

	function touchMove(e){
		e.preventDefault();
		var touch = event.touches[0];
		if(isMouseDown){
			var curLoc = getPosition(touch.pageX,touch.pageY);
			if(curLoc.x == -1 || curLoc.y == -1){return;}
			var data = {
				curLoc: curLoc,
				currT: (new Date()).getTime()
			}
			talk('draw',data);
		}
	}



	function bindMouse(){
		canvas.onmousedown = function(e){
			e.preventDefault();
			console.log('mouse down');
			var data = {
				isMouseDown:true,
				lastLoc: {
					x: e.clientX,
					y: e.clientY
				},
				lastTime: (new Date()).getTime()
			}
			talk('ini',data);
		};
		canvas.onmouseup = function(e){
			e.preventDefault();
			console.log('mouse up');
			talk('stopDraw',{});
		};
		canvas.onmouseout = function(e){
			e.preventDefault();
			console.log('mouse out');
			talk('stopDraw',{});
		};
		canvas.onmousemove = function(e){
			e.preventDefault();
			if(isMouseDown){
				var data = {
					curLoc: {
						x: e.clientX,
						y: e.clientY
					},
					currT: (new Date()).getTime()
				}
				talk('draw',data);
			}
		};
	}


	function changeColor(e){
		if(curColor == $(e.target).attr('data-value')){return;}
		curColor = $(e.target).attr('data-value');
		var data = {
			curColor: curColor
		}
		talk('changeColor',data);
	}

	function clear(){
		talk('clear',{});
	}

	function talk(action, obj) {
		console.log('talk');
		socket.emit(action, obj);
	}

});

function socket_clearCanvas(){
	cxt.clearRect(0,0,cWidth,cHeight);
}


function socket_changeColor(data){
	curColor = data.curColor;
}

function socket_stopDraw(){
	isMouseDown = false;
}

function socket_ini(data){
	isMouseDown = data.isMouseDown;
	lastLoc = getPosition(data.lastLoc.x,data.lastLoc.y);
	lastTime = data.lastTime.timeStanp;	
}

function socket_draw(data){
	console.log('move to '+data.curLoc.x+','+data.curLoc.y);
	data.curLoc.t = data.currT-lastTime;
	data.curLoc.d = getDistance(lastLoc,data.curLoc);

	cxt.beginPath();
	cxt.moveTo(lastLoc.x,lastLoc.y);
	cxt.lineTo(data.curLoc.x,data.curLoc.y);

	cxt.lineWidth = (data.curLoc.t/data.curLoc.d*3 > 10?10:data.curLoc.t/data.curLoc.d*5);
	cxt.strokeStyle = curColor;
	cxt.lineCap = 'round';
	cxt.lineJoin = 'round';
	cxt.stroke();

	lastLoc = data.curLoc;
	lastTime = data.currT;
}




function touchEnd(e){
	e.preventDefault();
}

function iniCanvas(){
	cxt.save();
	cxt.beginPath();
	
	cxt.moveTo(0,cHeight);
	cxt.lineTo(cWidth,cHeight);

	cxt.strokeStyle = 'gray';
	cxt.lineWidth = 2;
	//cxt.rect(0,0,cWidth,cHeight);
	//cxt.closePath();
	cxt.stroke();

	// cxt.beginPath();
	// cxt.lineWidth = 1;
	// cxt.strokeStyle = 'green';
	// cxt.moveTo(0,0);
	// cxt.lineTo(cWidth,cHeight);
	// cxt.moveTo(0,cHeight);
	// cxt.lineTo(cWidth,0)
	// cxt.moveTo(0,cHeight/2);
	// cxt.lineTo(cWidth,cHeight/2);
	// cxt.moveTo(cWidth/2,0);
	// cxt.lineTo(cWidth/2,cHeight);
	// cxt.closePath();
	// cxt.stroke();

	cxt.restore();
}

function getPosition(x,y){
	var data = canvas.getBoundingClientRect();
	data.x = Math.floor(x-data.left);
	data.y = Math.floor(y-data.top);
	return ({x:(data.x < 0 || data.x > data.width?-1:data.x),y:(data.y < 0 || data.y > data.height?-1:data.y)});
}

function getDistance(loc1,loc2){
	var data = Math.sqrt((loc2.x-loc1.x)*(loc2.x-loc1.x)+(loc2.y-loc1.y)*(loc2.y-loc1.y));
	return data;
}