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

function Bible(logger) {
    //the name of the command.
    this.name = "Bible";

    //help text to show for this command.
    this.helpText = "Get verse(s) from the Bible.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[verse(s)]";

    //ways to call this command.
    this.aliases = ['bible'];

    //dependencies that this module has.
    this.dependencies = ['googl'];
}

Bible.prototype.execute = function(context) {
    //if we got no arguments, pick a random verse.
    if(!context.arguments.length) {context.AKP48.getAPI("Bible").getBibleVerses("random", context, this.sendResponse);return true;}

    var cachedResponse = context.AKP48.cache.getCached(("Bible"+context.arguments.join(" ")).sha1());
    if(cachedResponse) {
        if(cachedResponse.gist) {
            context.commands['googl'].shortenURL(context, cachedResponse.content);
        } else {
            context.AKP48.client.say(context.channel, cachedResponse.content);
        }
        return true;
    }

    context.AKP48.getAPI("Bible").getBibleVerses(context.arguments.join(" "), context, this.sendResponse);
    return true;
};

Bible.prototype.sendResponse = function(verse, context) {
    if(verse.length) {
        var oS = "";
        for (var i = 0; i < verse.length; i++) {
            oS += verse[i].bookname + " " + verse[i].chapter + ":" + verse[i].verse + " - ";
            oS += verse[i].text + " · ";
        };
        oS = oS.decodeHTML();

        oS += "Obtained from NET (http://netbible.org/)"

        //if outputString is too long
        if(oS.length > 350) {

            oS = "";

            for (var i = 0; i < verse.length; i++) {
                oS += verse[i].bookname + " " + verse[i].chapter + ":" + verse[i].verse + " - ";
                oS += verse[i].text + "\r\n";
            };

            oS += "------------------------------------------------------------\r\n";
            oS += "Obtained from NET (http://netbible.org/)"

            //upload Gist instead.
            context.AKP48.getAPI("Gist").create({
                description: "Bible verses for "+context.nick,
                files: {
                    "verses.txt": {
                        "content": oS.decodeHTML()
                    }
                }
            }, function(url) {
                if(!url){return;}
                var cacheExpire = (Date.now() / 1000 | 0) + 1576800000; //make cache expire in 50 years
                context.AKP48.cache.addToCache(("Bible"+context.arguments.join(" ")).sha1(), {content: url, gist: true}, cacheExpire);
                context.commands['googl'].shortenURL(context, url);
            });
            return true;
        }


        var cacheExpire = (Date.now() / 1000 | 0) + 1576800000; //make cache expire in 50 years
        context.AKP48.cache.addToCache(("Bible"+context.arguments.join(" ")).sha1(), {content: oS, gist: false}, cacheExpire);
        context.AKP48.client.say(context.channel, oS);
    } else {
        context.AKP48.client.say(context.channel, "Sorry, I couldn't find that verse.");
    }
};

module.exports = Bible;
