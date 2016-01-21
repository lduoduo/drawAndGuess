var express = require('express');
//require('date-utils');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);//.listen(server);

//live websocket
app.use(express.static(__dirname + '/client'));

// find index.html under /client/client2
app.use('/client2',express.static(__dirname + '/client'));

// app.use("/server", express.static(server));


var port = process.env.PORT || 3000; //set our port, PORT is global variable
var channel1= io.of('/C1');//set channel here
var userNum = 0;

channel1.on('connection', function(socket){
	userNum++;
	console.log('one request connected from: '+ socket.request.headers.referer);
	console.log('userNum'+ userNum);
	//监听新用户加入
	socket.on('ini', function(obj){		
		//向所有客户端广播用户加入
		
		console.log('开始画画');
		channel1.emit('ini', obj);
	});
	
	//监听用户退出
	socket.on('disconnect', function(){
		userNum--;
		console.log('user leave:'+userNum);
	});
	
	//监听用户发布聊天内容
	socket.on('draw', function(obj){
		channel1.emit('draw', obj);
		//console.log('画画中');
	});

	socket.on('clear', function(obj){
		channel1.emit('clear', obj);
		console.log('clear canvas');
	});

	socket.on('changeColor', function(obj){
		channel1.emit('changeColor', obj);
		console.log('changeColor');
	});

	socket.on('stopDraw', function(obj){
		channel1.emit('stopDraw', obj);
		console.log('stopDraw');
	});
});



server.listen(port,function(){
	console.log('Magic happens on port ' + port);
});

// if (!module.parent) {
//     app.listen(3000, function () {
//         console.log('Socket.io start on port:3000');
//     });
// }