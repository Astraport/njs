/**
 * Сообщение, полученное (или отправляемое) по сокетному соединению
 */

/**
 * @param type  {Number}    Тип сообщения (2 байта)
 * @param data  {Buffer}    Данные сообщения (от 0 до 0xFFFF байт)
 *
 * @constructor
 */
var SocketMessage = function(type, data) {

    if (typeof(type) != "number") throw new Error("Тип сообщения должен задаваться числом!");
    if (isNaN(type)) throw new Error("Тип сообщения должне быть действительным числом!");
    if (~~type != type) throw new Error("Тип сообщения должен быть целым числом!");
    if (type < 0) throw new Error("Тип сообщения должен быть неотрицательным числом!");
    if (type >= 0xFF) throw new Error("Тип сообщения должне быть представлен 1 байтом!");

    if (data) {
        if (!(data instanceof Buffer)) throw new Error("Данные должны быть представлены буфером!");
        if (data.length >= 0xFFFF - 1) throw new Error("Сообщение слишком длинное!");
    }

    this._type = type;
    this._data = data;

};

/**
 * Тип сообщения
 */
SocketMessage.prototype.getType = function() {
    return this._type;
};

/**
 * Данные сообщения
 */
SocketMessage.prototype.getData = function() {
    return this._data;
};

/**
 * Сериализовать данное сообщение в буфер.
 * Если буфер для сериализации не передан - создается и
 * возвращается новый буфер. Если передан - возвращается
 * переданный буфер с дописанными в него данными сообщения.
 *
 * @param buffer    {Buffer}    Буфер для записи данных сообщения
 */
SocketMessage.prototype.toBytes = function(buffer) {
    if (buffer) {
        if (!(buffer instanceof Buffer)) throw new Error("Контейнер для данных должен быть буфером!");
    }else {

        // если нет данных, то длина буфера 3 байта
        // 2 на длину и 1 на тип сообщения
        var len = 3;

        if (this._data) len += this._data.length;

        buffer = new Buffer(len);
    }

    buffer.writeUInt16BE(this._data.length + 1, 0);
    buffer.writeUInt8(this._type, 2);
    if (this._data) buffer.copy(this._data, 0, 3, 3 + this._data.length);

    return buffer;
};

module.exports = SocketMessage;