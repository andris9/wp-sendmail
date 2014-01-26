
var smtp = require("url").parse(process.env.SMTP || "");

module.exports = {
    
    port: 3412,
    
    keepBCC: false,

    smtp:{
        host: smtp.hostname || "localhost",
        port: smtp.port || (smtp.protocol == "smtps:" ? 465 : 25),
        options: {
            auth: smtp.auth ? {
                user: smtp.auth.split(":").shift() || "",
                pass: smtp.auth.split(":").slice(1).join(":") || ""
            } : false,
            secureConnection: smtp.protocol == "smtps:",

            debug: true
        }
    },

    mysql: {
        url: process.env.MYSQL || "mysql://user:pass@localhost/wordpress",
        prefix: process.env.PREFIX || "wp_"
    }
};
