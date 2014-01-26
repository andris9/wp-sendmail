
var smtp = require("url").parse(process.env.SMTP || "");

module.exports = {
    
    port: 7914, // do not change - wp-sendmail can not read the config file
    
    keepBCC: false,

    uid: "nobody",
    gid: "nogroup",

    smtp:{
        host: smtp.hostname || "localhost",
        port: smtp.port || (smtp.protocol == "smtps:" ? 465 : 25),
        options: {
            auth: smtp.auth ? {
                user: smtp.auth.split(":").shift() || "",
                pass: smtp.auth.split(":").slice(1).join(":") || ""
            } : false,
            secureConnection: smtp.protocol == "smtps:",

            debug: !!process.env.DEBUG && ["0", "false"].indexOf(process.env.DEBUG.toLowerCase().trim()) < 0
        }
    },

    mysql: {
        url: process.env.MYSQL || "mysql://user:pass@localhost/wordpress",
        prefix: process.env.PREFIX || "wp_"
    }
};
