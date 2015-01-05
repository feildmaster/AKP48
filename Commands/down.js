function Down() {
    //the name of the command.
    this.name = "Down For Everyone?";

    //help text to show for this command.
    this.helpText = "Checks if a website appears to be down. Example: 'down google.com'";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<website> [port]";

    //ways to call this command.
    this.aliases = ['down', 'isup'];

    //dependencies that this module has.
    //this.dependencies = [''];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

Down.prototype.execute = function(context) {
    if(!context.arguments.length){return false;}

    var host = context.arguments[0];
    var port = 80;
    var path = '/';
    var urlRegEx = /^(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6})(.+)*\/?$/gi;
    var result = [];

    if((result = urlRegEx.exec(context.arguments[0])) !== null) {
        host = result[2];
        if(result[1] == "https://") {
            context.client.say(context, "I can't do secure sites (https://), but I'll try to access the site normally for you.");
        }
    }

    if(!result) {return false;}

    if(context.arguments[1]) {
        if(+context.arguments[1] <= 65536){
            port = +context.arguments[1];
        }
    }

    var http = require('http');
    var options = {method: 'HEAD', host: host, port: port, path: path};
    var req = http.request(options, function(res) {
        context.client.say(context, host + " seems up to me.")
      }
    );

    if(port != 80) {host = host+":"+port;}

    req.on('socket', function (socket) {
        myTimeout = 1500; // millis
        socket.setTimeout(myTimeout);
        socket.on('timeout', function() {
            req.abort();
        });
    });

    req.on('error', function(err) {
        console.log(err);
        switch(err.code) {
            case 'ENOTFOUND':
                context.client.say(context, "I couldn't find "+host+".");
                break;
            case 'ECONNREFUSED':
                context.client.say(context, host+" refused my connection.");
                break;
            case 'ETIMEDOUT':
                context.client.say(context, "My connection to "+host+" timed out.");
                break;
            case 'ECONNRESET':
                context.client.say(context, "Either my connection to "+host+" was reset, or that site took too long to respond. I'd say it's probably down.");
                break;
            default:
                context.client.say(context, "I had trouble visiting "+host+", but I'm not sure why.");
                break;
        }
    });
    req.end();
    return true;
};

module.exports = Down;