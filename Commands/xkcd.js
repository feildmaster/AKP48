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

function XKCD(logger) {
    //the name of the command.
    this.name = "XKCD";

    //help text to show for this command.
    this.helpText = "Get an XKCD comic.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[comic]";

    //ways to call this command.
    this.aliases = ['xkcd'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

XKCD.prototype.execute = function(context) {
    //if we got no arguments, get the latest XKCD.
    if(!context.arguments.length) {getClientManager().getAPI("XKCD").getLatestComic(this.sendResponse, context);return true;}

    var cachedResponse = getClientManager().getCache().getCached(("XKCD"+context.arguments.join(" ")).sha1());
    if(cachedResponse) {
        context.getClient().getIRCClient().say(context.getChannel().getName(), cachedResponse);
        return true;
    }

    getClientManager().getAPI("XKCD").getComic(context.arguments[0], this.sendResponse, context);
    return true;
};

XKCD.prototype.sendResponse = function(response, context, latest) {
    if(!latest) {
        response += " · http://xkcd.com/"+context.arguments[0];
        var cacheExpire = (Date.now() / 1000 | 0) + 1576800000; //make cache expire in 50 years
        getClientManager().getCache().addToCache(("XKCD"+context.arguments.join(" ")).sha1(), response, cacheExpire);
    }
    context.getClient().getIRCClient().say(context.getChannel().getName(), response);
};

module.exports = XKCD;