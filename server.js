"use strict";

var config = require("./config/" + (process.env.NODE_ENV || "development") + ".js"),
    net = require('net'),
    createMailer = require("./lib/mailer").createMailer,
    server;

server = net.createServer(function(socket){
    console.log('Client connected from %s', socket.remoteAddress);

    var mailer = createMailer();

    socket.on('error', function(err) {
        console.log("Socket error");
        console.log(err);
    });

    socket.setTimeout(30 * 1000, function(){
        console.log("Socket timeout");
        socket.end();
    });

    socket.write('START\r\n');

    socket.on("data", function(chunk){
        mailer.write(chunk);
    });

    socket.on('end', function() {
        console.log('Client closed connection');
        mailer.send();
    });
});

server.on("error", function(err){
    console.log('Server error');
    console.log(err);
});

server.listen(config.port, function() { //'listening' listener
    console.log('Server bound to port %s', config.port);
});
