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