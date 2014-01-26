"use strict";

var createMailer = require("../lib/mailer").createMailer;

module.exports["Remove BCC"] = function(test){
    var mailer = createMailer(),

        input = "test: tere\r\n"+
                "bcC: abc@tr.ee,\r\n"+
                " cde@rrr.ee,\r\n"+
                " sss@sss.ee\r\n"+
                "subject:test\r\n"+
                "\r\n"+
                "hello!",

        expected = "test: tere\r\n"+
                   "subject:test\r\n"+
                   "\r\n"+
                   "hello!";

    test.equal(mailer.removeBCC(input), expected);

    test.done();
}

module.exports["Get envelope"] = function(test){
    var mailer = createMailer(),

        input = {
            from: "andris@tr.ee",
            to: "kusti <kusti@ee.ee>, andris@tr.ee",
            bcc: ["juha@tr.ee, composer: andris@kreata.ee, juss: andris <andris@tr.ee>", "mesta@kesta.ee"]
        },

        expected = {
            from: "andris@tr.ee",
            to: ["kusti@ee.ee", "andris@tr.ee", "juha@tr.ee", "andris@kreata.ee", "mesta@kesta.ee"]
        }

    test.deepEqual(mailer.getEnvelope(input), expected);
    test.done();
}