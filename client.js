"use strict";

var config = require(process.env.CONFIG || "/etc/wp-sendmail.js"),
    net = require("net"),
    log = require('npmlog'),
    client = net.createConnection(config.port),
    buffer = [],
    bufferlen = 0,
    connected = false,
    done = false;

process.stdin.resume();

process.stdin.on("data", function(chunk) {
    if(connected){
        client.write(chunk);
    }else{
        buffer.push(chunk);
        bufferlen += chunk.length;
    }
});

process.stdin.on("end", function(){
    if(connected){
        client.end();
    }else{
        done = true;
    }
});

client.on("error", function(err){
    log.error("client", err.message);
    process.exit(1);
});

client.on("connect", function(){
    connected = true;
    if(bufferlen){
        client.write(Buffer.concat(buffer, bufferlen));
    }
    if(done){
        client.end();
    }
});

client.on("close", function(had_error){
    process.exit(had_error ? 1 : 0);
});
