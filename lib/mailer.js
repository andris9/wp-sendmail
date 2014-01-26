"use strict";

var config = require("../config/" + (process.env.NODE_ENV || "development") + ".js"),
    mimelib = require("mimelib"),
    simplesmtp = require("simplesmtp"),
    mysql = require('mysql'),
    pool = mysql.createPool(config.mysql.url);

module.exports.createMailer = function(){
    return new Mailer();
};

function Mailer(){
    this.headersReceived = false;
    this.headers = false;

    this.headersProcessed = false;
    this.sendReady = true;

    this.reject = false;
    this.body = "";
}

Mailer.prototype.write = function(chunk){
    var match;

    console.log("INCOMING")
    console.log("<<<<" + chunk.toString().trim() + ">>>>");

    if(this.reject){
        return;
    }

    this.body += chunk.toString("binary");

    if(!this.headersReceived){
        if((match = this.body.match(/\r?\n\r?\n/))){
            this.headers = mimelib.parseHeaders(this.body.substr(0, match.index));
            if(!config.keepBCC){
                this.body = this.removeBCC(this.body, match.index);    
            }
            this.headersReceived = true;
            this.processHeaders();
        }
    }
};

Mailer.prototype.send = function(){
    if(this.reject){
        return;
    }

    this.sendReady = true;
    if(this.headersProcessed){
        this.process();
    }
};

Mailer.prototype.processHeaders = function(){
    this.envelope = this.getEnvelope(this.headers);

    this.validateAddresses(this.envelope.to, (function(err){
        if(err){
            console.log("Address validation failed");
            console.log(err);
            this.reject = true;
            return;
        }
        this.headersProcessed = true;
        if(this.sendReady){
            this.process();
        }
    }).bind(this));
};

Mailer.prototype.getEnvelope = function(headers){
    headers = headers || {};

    var from = this.processAddressField(headers.from),
        sender = this.processAddressField(headers.sender),
        to = this.processAddressField(headers.to),
        cc = this.processAddressField(headers.cc),
        bcc = this.processAddressField(headers.bcc),
        envelope = {
            from: (from && from[0]) || (sender && sender[0]) || "admin@localhost",
            to: []
        };

    [].concat(to).concat(cc).concat(bcc).forEach(function(address){
        if(envelope.to.indexOf(address) < 0){
            envelope.to.push(address);
        }
    });

    return envelope;
};

Mailer.prototype.processAddressField = function(value){
    var list = [],
        walkAddressList = function(addresses){
            [].concat(addresses || []).forEach(function(elm){
                if(elm.group){
                    walkAddressList(elm.group);
                }else{
                    if(elm.address && list.indexOf(elm.address) < 0){
                        list.push(elm.address);
                    }
                }
            });
        };

    [].concat(value || []).forEach(function(addressItem){
        walkAddressList(mimelib.parseAddresses(addressItem));
    });

    return list;
};

Mailer.prototype.removeBCC = function(body, limit){
    if(!limit){
        limit = (body.match(/\r?\n\r?\n/) || {}).index || 0;
    }
    var headers = body.substr(0, limit).split(/\r?\n/),
        joined = 0;

    for(var i = headers.length - 1; i>=0; i--){
        if(headers[i].match(/^\s/)){
            joined++;
        }else{
            if(headers[i].match(/^bcc\s*:/i)){
                headers.splice(i, 1 + joined);
            }
            joined = 0;
        }
    }

    return headers.join("\r\n") + body.substr(limit);
};

Mailer.prototype.process = function(){
    var body = new Buffer(this.body.replace(/\r?\n/g, "\r\n"), "binary");

    console.log("OUTGOING")
    console.log("<<<<" + this.body.toString().trim() + ">>>>");

    var client = simplesmtp.connect(config.smtp.port, config.smtp.host, config.smtp.options);

    // run only once as 'idle' is emitted again after message delivery
    client.once("idle", (function(){
        client.useEnvelope(this.envelope);
    }).bind(this));

    client.once("message", function(){
        client.write(body);
        client.end();
    });

    client.once("ready", function(success, response){
        console.log("Server response: %s", response);
        client.quit();
    });

    client.once("error", function(err){
        console.log("Error sending mail");
        console.log(err);
        client.quit();
    });
};

Mailer.prototype.validateAddresses = function(addresses, callback){
    pool.getConnection(function(err, connection) {
        if(err){
            return callback(err);
        }

        var i = 0,
            validateAddress = function(){
                if(i >= addresses.length){
                    connection.release();
                    return callback(null, true);
                }
                var address = addresses[i++];

                connection.query('SELECT id, user_login FROM `' + connection.escape(config.mysql.prefix + 'users').replace(/'/g, "") + '` WHERE `user_email`=? LIMIT 1',[address], function(err, rows) {
                    if(err){
                        connection.release();
                        return callback(err);
                    }

                    if(!rows || !rows.length){
                        return callback(new Error("Could not validate " + address));
                    }

                    validateAddress();
                });
            };

        validateAddress();
    });
}

