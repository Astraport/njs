//require.paths.unshift(__dirname + '/lib');

var io = require('socket.io'),
  http = require('http');

var fs = require('fs'),
  util = require('util');

var url = require('url'),
  path = require('path'),
  mime = require('mime');

function findType(uri) {
  var ext = uri.match(/\.\w+$/gi);
  if (ext && ext.length > 0) {
    ext = ext[0].split(".")[1].toLowerCase();
    return mime.lookup(ext);
  }
  return undefined;
}

function sendError(code, response) {
  response.writeHead(code);
  response.end();
  return;
}

	var app = http.createServer(function(request, response) {
	  var uri = url.parse(request.url).pathname;
	  if (uri === '/') {
		uri = '/index.html';
	  } else if (uri === '/server.js') {
		sendError(404, response);
		return;
	  }
	  var _file = path.join(process.cwd(), uri);
	
	  path.exists(_file, function(exists) {
		if (!exists) {
		  sendError(404, response);
		} else {
		  fs.stat(_file, function(err, stat) {
			var file = __dirname + uri,
				type = findType(uri),
				size = stat.size;
			if (!type) {
			  sendError(500, response);
			}
			response.writeHead(200, {'Content-Type':type + "; charset=utf-8", 'Content-Length':size});
			console.log("START");
			var rs = fs.createReadStream(file);
			util.pump(rs, response, function(err) {
			  if (err) {
				console.log("ReadStream, WriteStream error for util.pump");
				response.end();
			  }
			});
		  });
		}
	  });
	
	});

var socket = io.listen(app, {transports:['websocket', 'xhr-polling']}),
  buffer = [],
  MAXBUF = 1024,
  json = JSON.stringify;

var clients = [];
clients.usernames = function(client) {
  return client.username;
}
var userpositions = [{p:0, x:850, y:1100},{p:1, x:110, y:850},{p:2, x:1100, y:1400},{p:3, x:1450, y:1100}];
		
socket.sockets.on('connection', function(client) {
	console.log("connection");
  client.on('message', function(data) {
	  console.log("message");
	  var res = JSON.parse(data);
	  if (res.TYPE == "getuserlist") {
		  var len = clients.length;
		client.json.send({announcement:"senduserlist", clients:len});
		  return;
	  }
		
    if (res.TYPE == "new") {
      var username = res.USERNAME;
	  var pers = res.P;
	  
      if (!username || username == '') {
        client.json.send({announcement:"You must specify a username. Please reload the app."});
        return;
      }

      var usernames = clients.map(clients.usernames);
      if (usernames.indexOf(username) >= 0) {
        client.json.send({announcement:"Username in use. Select another username"});
        return;
      } 
	client.id = client.id;
      client.username = username;
	  client.pers = pers;
	  var pos = userpositions[clients.length];
	  client.x = pos.x;
	  client.y = pos.y;
     client.json.broadcast.send({announcement:"newE", id:client.id, user: client.username, pers: pers, pos: pos.p});
     //client.json.send({messages:buffer});
     //client.json.send({userlist:usernames});
    client.json.send({announcement:"Me", id:client.id, user: client.username, pers: pers,  pos: pos.p});
     
	  	for (var i = 0; i<clients.length; i++)
	{
		client.json.send({announcement:"Enemy", id:clients[i].id, user: clients[i].username, pers: clients[i].pers, xpos: clients[i].x, ypos: clients[i].y});
	}
	
	clients.push(client);
	  	if (clients.length > 4){
		client.json.send({announcement: "Maximum number of players - 5 users. Connect to the game later. Sorry."});
		return;		
	}
      return;
    } 
	if (!client.username) {
      client.json.send({announcement:"You must specify a username. Please reload the app."});
      return;
    }
	if (res.TYPE == "move"){
		var move = res.MOVE;
		var message = {'message':move};
		var userid = res.ID;
		var valuex = res.X;
		var valuey = res.Y;
		for (var j = 0; j<clients.length; j++)
	{
		if (clients[j].id == userid)
		{
			clients[j].x = res.X;
			clients[j].y = res.Y;
		}
	}
		//buffer.push(message);
		//if (buffer.length > MAXBUF) {
		  //buffer.shift();
		//}
		 //console.log('mess' + move + 'id' + client.id);
		 client.json.send({mess:move, id: userid, valuex: valuex, valuey: valuey});
    client.json.broadcast.send({mess:move, id: userid, valuex: valuex, valuey: valuey});
	//create coin for all clients
	if(clients.length > 1){
		var randomnumber=Math.floor(Math.random()*90);
		if (randomnumber==5){
		var coinsx = Math.floor(Math.random() * (50 - 2300 + 1) + 2200);
		var coinsy = Math.floor(Math.random() * (70 - 2300 + 1) + 2200);
		var coinname = "coin" + Math.random();
		client.json.send({coins: "coins", coinsx: coinsx, coinsy: coinsy, coinname:coinname});
		client.json.broadcast.send({coins: "coins", coinsx: coinsx, coinsy: coinsy, coinname:coinname});
		}
	} 
	
	}
		if (res.TYPE == "chat"){
		var chatid = res.USERNAME;
		var chattext = res.TEXT;
		 client.json.send({chat:chatid, text: chattext});
    	client.json.broadcast.send({chat:chatid, text: chattext});
	}
	
	if (res.TYPE == "shoot"){
		var angle = res.ANGLE;
		var shooterid = res.USERNAME;
		var booltid = res.UID;
		var speed = res.SPEED;
		var power = res.POWER;
		//console.log('shoot' + shooterid + 'angle' + angle);
		// client.json.send({shoot: angle, id: shooterid, boolrtid:boolrtid});
    client.json.broadcast.send({shoot: angle, id: shooterid, booltid:booltid, speed: speed, power:power});
	}
	
	if (res.TYPE == "hit"){
		var username2 = res.USERNAME2;
		var userhealth = res.USERHEALTH;
		var bulletname= res.BULLETNAME;
		client.json.send({hit: username2, value: userhealth, bulletname: bulletname});
    client.json.broadcast.send({hit: username2, value: userhealth, bulletname: bulletname});
	var rndbonus =Math.floor(Math.random()*5);
		if (rndbonus==0){
			var namehealth = "health" + Math.random();
			var posx = Math.floor(Math.random() * (100 - 2300 + 1) + 2200);
			var posy = Math.floor(Math.random() * (70 - 2300 + 1) + 2200);
			client.json.send({bonus: "health", posx: posx, posy: posy, name:namehealth});
			client.json.broadcast.send({bonus: "health", posx: posx, posy: posy, name:namehealth});
		} else if (rndbonus==1){
			var nameavto = "avto" + Math.random();
			var posx2 = Math.floor(Math.random() * (100 - 2300 + 1) + 2200);
			var posy2 = Math.floor(Math.random() * (70 - 2300 + 1) + 2200);
			client.json.send({bonus: "avto", posx: posx2, posy: posy2, name:nameavto});
			client.json.broadcast.send({bonus: "avto", posx: posx2, posy: posy2, name:nameavto});
		} else if (rndbonus==2){
			var namespeed = "speed" + Math.random();
			var posx3 = Math.floor(Math.random() * (100 - 2300 + 1) + 2200);
			var posy3 = Math.floor(Math.random() * (70 - 2300 + 1) + 2200);
			client.json.send({bonus: "speed", posx: posx3, posy: posy3, name:namespeed});
			client.json.broadcast.send({bonus: "speed", posx: posx3, posy: posy3, name:namespeed});
		} else if (rndbonus==3){	
			var namegun = "gun" + Math.random();
			var posx4 = Math.floor(Math.random() * (100 - 2300 + 1) + 2200);
			var posy4 = Math.floor(Math.random() * (70 - 2300 + 1) + 2200);
			client.json.send({bonus: "gun", posx: posx4, posy: posy4, name:namegun});
			client.json.broadcast.send({bonus: "gun", posx: posx4, posy: posy4, name:namegun});
		}
		else {
			var namearmo = "armor" + Math.random();
			var posx5 = Math.floor(Math.random() * (100 - 2300 + 1) + 2200);
			var posy5 = Math.floor(Math.random() * (70 - 2300 + 1) + 2200);
			client.json.send({bonus: "armor", posx: posx5, posy: posy5, name:namearmo});
			client.json.broadcast.send({bonus: "armor", posx: posx5, posy: posy5, name:namearmo});
		}
		}
	
	if (res.TYPE == "herohealth"){
		var username3 = res.USERNAME3;
		var userhealth2 = res.USERHEALTH;
		var bonusname= res.BONUSNAME;
	client.json.send({gethealth: username3, value: userhealth2, bonusname: bonusname});
    client.json.broadcast.send({gethealth: username3, value: userhealth2, bonusname: bonusname});
	}
	
	if (res.TYPE == "herogun"){
		var username5 = res.USERNAME3;
		var usergun = res.USERGUN;
		var bonusname= res.BONUSNAME;
	client.json.send({getgun: username5, value: usergun, bonusname: bonusname});
    client.json.broadcast.send({getgun: username5, value: usergun, bonusname: bonusname});
	}
	
	if (res.TYPE == "heroavto"){
		var username6 = res.USERNAME3;
		var useravto = res.USERAVTO;
		var bonusname= res.BONUSNAME;
	client.json.send({getavto: username6, value: useravto, bonusname: bonusname});
    client.json.broadcast.send({getavto: username6, value: useravto, bonusname: bonusname});
	}
	
	if (res.TYPE == "heroarmor"){
		var username7 = res.USERNAME3;
		var userarmor = res.USERARMOR;
		var bonusname= res.BONUSNAME;
	client.json.send({getarmor: username7, value: userarmor, bonusname: bonusname});
    client.json.broadcast.send({getarmor: username7, value: userarmor, bonusname: bonusname});
	}
	
	if (res.TYPE == "herocoins"){
		var username5 = res.USERNAME3;
		var usercoins = res.USERCOINS;
		var bonusname2= res.BONUSNAME;
	client.json.send({getcoins: username5, value: usercoins, bonusname: bonusname2});
    client.json.broadcast.send({getcoins: username5, value: usercoins, bonusname: bonusname2});
	}
	
		
	if (res.TYPE == "herospeed"){
		var username4 = res.USERNAME3;
		var userspeed = res.USERSPEED;
		var bonusname2= res.BONUSNAME;
	client.json.send({getspeed: username4, value: userspeed, bonusname: bonusname2});
    client.json.broadcast.send({getspeed: username4, value: userspeed, bonusname: bonusname2});
	}
  });

  client.on('disconnect', function() {
    if (client.username) {
      client.json.broadcast.send({announcement:(client.username)+' left game', id:(client.id)});
    }
    var pos = clients.indexOf(client);
    if (pos >= 0) {
      clients.splice(pos, 1);
    }
  });});

if (!module.parent) {
  app.listen(8293);
  console.log("Socket-Game listening on port 8293.. ");
}