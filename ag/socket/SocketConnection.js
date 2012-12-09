/**
 * Сокетное соединение с возможностью обмена сообщениями
 */

var EventEmitter = require("events").EventEmitter;
var Util = require("util");
var SocketMessage = require("./SocketMessage");

/**
 * @param   socket  Входящее сокетное соединение
 *
 * @constructor
 */
var SocketConnection = function(socket) {

    var _self = this;
    this._socket = socket;

    var onData = function(data) {
        console.log(data);
    };

    var onEnd = function() {
        _self.emit(SocketConnection.DISCONNECT);
    };

    var onTimeout = function() {
        _self.disconnect();
    };

    var onError = function() {
        _self.emit(SocketConnection.ERROR);
    };

    var onClose = function(had_error) {
        if (had_error) {
            onError();
        }else {
            _self.emit(SocketConnection.DISCONNECT);
        }
    };

    socket.addListener("data", onData);
    socket.addListener("end", onEnd);
    socket.addListener("timeout", onTimeout);
    socket.addListener("error", onError);
    socket.addListener("close", onClose);

};

// добавляем возможность отправлять события
// ВАЖНО! вызов должен быть именно тут, потому что в процессе заменяется прототип
Util.inherits(SocketConnection, EventEmitter);

/**
 * Закрыть соединение
 */
SocketConnection.prototype.disconnect = function() {
    this._socket.end();
    this._socket.destroy();
    this.emit(SocketConnection.DISCONNECT);
};

/**
 *
 * @param message   {SocketMessage}
 */
SocketConnection.prototype.send = function(message) {
    if (!message) throw new Error("Объект сообщения должен быть не нулевым!");
    if (!(message instanceof SocketMessage)) throw new Error("Объект сообщения должен быть SocketMessage!");

    this._socket.write(message.toBytes());
};

/**
 * Событие обрыва соединения
 */
SocketConnection.DISCONNECT = "disconnect";

/**
 * Событие получения нового сообщения
 */
SocketConnection.MESSAGE = "message";

/**
 * Событие ошибки
 */
SocketConnection.ERROR = "error";



module.exports = SocketConnection;