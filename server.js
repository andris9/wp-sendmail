"use strict";

var config = require(process.env.CONFIG || "./config/example.js"),
    net = require('net'),
    createMailer = require("./lib/mailer").createMailer,
    server;

server = net.createServer(function(socket){
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
        mailer.send();
    });
});

server.on("error", function(err){
    console.log('Server error');
    console.log(err);
});

server.listen(config.port, function() { //'listening' listener
    console.log('Server bound to %s', config.port);
    if(config.gid){
        try{
            process.setgid(config.gid);
            console.log("Changed GID to %s", config.gid);
        }catch(E){
            console.log("Error: Failed changing GID to %s", config.gid);
            console.log(E);
        }
    }
    if(config.uid){
        try{
            process.setuid(config.uid);
            console.log("Changed UID to %s", config.uid);
        }catch(E){
            console.log("Error: Failed changing UID to %s", config.uid);
            console.log(E);
        }
    }
});
