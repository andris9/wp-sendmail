"use strict";

var config = require(process.env.CONFIG || "./config/example.js"),
    log = require('npmlog'),
    net = require('net'),
    createMailer = require("./lib/mailer").createMailer,
    server;

server = net.createServer(function(socket){
    var mailer = createMailer();

    log.info("socket", "Connection from %s", socket.remoteAddress);

    socket.on("error", function(err) {
        log.error("socket", "Socket error: %s", err.message);
    });

    socket.setTimeout(30 * 1000, function(){
        log.error("socket", "Socket timeout, closing connection");
        socket.end();
    });

    socket.write('START\r\n');

    socket.on("data", function(chunk){
        mailer.write(chunk);
    });

    socket.on("end", function() {
        log.info("socket", "Connection to client closed");
        mailer.send();
    });
});

server.on("error", function(err){
    log.error("server", err.message);
});

server.listen(config.port, "127.0.0.1", function() { //'listening' listener
    log.info("server", "Server bound to %s", config.port);
    if(config.gid){
        try{
            process.setgid(config.gid);
            log.info("server", "Changed GID to %s", config.gid);
        }catch(E){
            log.warn("server", "Changing GID failed: %s", E.message);
        }
    }
    if(config.uid){
        try{
            process.setuid(config.uid);
            log.info("server", "Changed UID to %s", config.uid);
        }catch(E){
            log.warn("server", "Changing UID failed: %s", E.message);
        }
    }
});
