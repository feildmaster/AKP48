function Op() {
    //the name of the command.
    this.name = "Op";

    //help text to show for this command.
    this.helpText = "Gives Op status to a person or people.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<person> [person2, person3, ...]";

    //ways to call this command.
    this.aliases = ['op'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'chanop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Op.prototype.execute = function(context) {
    for (var i = 0; i < context.arguments.length; i++) {
        //get the user
        var user = context.getChannel().getUser(context.arguments[i]);
        //if we didn't get a user, we make one and add them to the channel.
        if(!user) {
            //this means it's a hostmask
            if(context.arguments[i].indexOf("!") !== -1 && context.arguments[i].indexOf("@") !== -1 && context.arguments[i].indexOf(".") !== -1) {
                user = context.getClient().getClientManager().builder.buildUser(null, null, {hostmask: context.arguments[i]});
            } else {
                //otherwise, we take it as a nick
                user = context.getClient().getClientManager().builder.buildUser(null, null, {nick: context.arguments[i]});
            }

            //add user to channel
            context.getChannel().addUser(user);
        }
        //ban the user.
        context.getChannel().opUser(user);
    };
    context.getClient().getIRCClient().notice(context.getUser().getNick(), "Opped "+context.arguments.join(", "));
    context.getClient().getClientManager().save();
    return true;
};

module.exports = Op;