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

function LoLServerStatus(logger) {
    //the name of the command.
    this.name = "LoL Server Status";

    //help text to show for this command.
    this.helpText = "Gets the current server status for League of Legends servers.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[region]";

    //ways to call this command.
    this.aliases = ['lolserverstatus', 'lolstatus', 'lolsvrstatus'];
}

LoLServerStatus.prototype.execute = function(context) {
    var region = "na";
    if(context.arguments[0]) {region = context.arguments[0];}
    context.AKP48.getAPI("Riot").getServerStatus(region, function(msg) {
        context.AKP48.client.say(context.channel, msg);
    });
    return true;
};

module.exports = LoLServerStatus;
