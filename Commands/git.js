/**
 * Copyright (C) 2015  Austin Peterson, Alan Hamid (feildmaster)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

 var _git = new (require("../API/git"))();

// TODO: only enable if we're in a git repo
function Git() {
    //the name of the command.
    this.name = "Git";

    //help text to show for this command.
    this.helpText = "Allows controlling of the repository this bot is running off.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "checkout <branch>";

    //ways to call this command.
    this.aliases = ['git'];

    //dependencies that this module has.
    this.dependencies = [];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'netop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Git.prototype.execute = function(context) {
    if (context.getArguments() !== 2) {
        return false;
    }
    
    var command = context.getArguments().splice(0, 1)[0].toLowerCase();
    switch (command) {
        case "checkout":
            var branch = context.getArguments().splice(0,1)[0];
            if (_git.fetch() && _git.checkout(branch)) {
                context.getClient().getIRCClient().notice(context.nick, "Checked out ".append(branch));
            } else {
                context.getClient().getIRCClient().notice(context.nick, "Encountered an error while checking out ".append(branch));
            }
            break;
        default: return false;
    }

    return true;
};

module.exports = Git;
