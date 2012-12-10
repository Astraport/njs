var net = require("net");
var SocketConnection = require("./SocketConnection");
var SocketMessage = require("./SocketMessage");

// функция, в которую будут попадать все коннекты от клиентов
var onAccept = function(socket) {

    var connection = new SocketConnection(socket);

    var messageStr = "hello!";
    var data = new Buffer(messageStr.length);
    data.write(messageStr);
	console.log(messageStr);
    var message = new SocketMessage(1, new Buffer("hello!"));
    connection.send(message);

};

// создаем сервер, принимающий коннекты через onAccept
var server = net.createServer(onAccept);
server.listen(80);

var onAccept2 = function(socket2) {

    var connection2 = new SocketConnection(socket2);

    var messageStr2 = "<?xml version="1.0"?><cross-domain-policy><allow-access-from domain="*" to-ports="*"/></cross-domain-policy>\0";
    var data2 = new Buffer(messageStr2.length);
    data2.write(messageStr2);
    var message2 = new SocketMessage(1, new Buffer(messageStr2));
    connection2.send(message2);

};

// создаем сервер, принимающий коннекты через onAccept
var server2 = net.createServer(onAccept2);
server2.listen(7777);