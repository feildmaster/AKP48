/**
 * Copyright (C) 2015  Austin Peterson
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

var Google = require('../API/google');
var config = require('../config.json');

function LMGTFY() {
    //the name of the command.
    this.name = "LMGTFY";

    //help text to show for this command.
    this.helpText = "Returns a LMGTFY link.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<query>";

    //ways to call this command.
    this.aliases = ['lmgtfy'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //google API module for using Google APIs.
    this.googleAPI = new Google(config.google.apiKey);
}

LMGTFY.prototype.execute = function(context) {
    var query = context.arguments.join(' ');
    query = encodeURIComponent(query);
    this.googleAPI.shorten_url("http://lmgtfy.com/?q="+query, function(url) {
        context.getClient().say(context, url);
    });
    return true;
};

module.exports = LMGTFY;