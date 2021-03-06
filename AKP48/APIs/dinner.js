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
 var request = require('request');
 var cheerio = require('cheerio');
 var options = {
     headers: {
         'User-Agent': 'AKP48 IRC Bot (http://github.com/AKPWebDesign/AKP48)'
     }
 };
var c = require('irc-colors');

function Dinner(logger, config, AKP48) {
    // Logger.
    this.log = logger.child({module: "Dinner API"});

    // The running instance of AKP48.
    this.AKP48 = AKP48;
}

Dinner.prototype.getDinner = function(vegetarian, callback) {
    this.log.debug({vegetarian: vegetarian}, "Getting dinner.");

    options.url = "http://www.whatthefuckshouldimakefordinner.com/" + (vegetarian ? "veg.php" : "");

    var self = this;
    request(options, function(error, response, body) {
        if (!error && response && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var startText = $("dt > dl").text().replace(/\r?\n/gm, "").trim().replace(/\s{2,}/g, ' ').toUpperCase();
            var itemText = $("dl > dt > a").text().replace(/\r?\n/gm, "").trim().replace(/\s{2,}/g, ' ').toUpperCase();
            var link = $("dl > dt > a").attr('href');

            self.outputString(startText + ' ' + itemText, link, vegetarian, callback);
        } else {
            if(response){
                self.log.error({err: error, res: response}, "[".append(response.statusCode).append("] Error: %s"), error);
            } else {
                self.log.error({err: error}, "Error: %s", error);
            }
        }
    });
};

Dinner.prototype.outputString = function(string, link, veg, callback) {
    var oS = string;

    this.AKP48.getAPI("Google").shorten_url(link, function(shortURL){
        if(!shortURL) {shortURL = link;}
        oS += " (" + shortURL + ")";
        callback(oS);
    });
};

module.exports = Dinner;
// Name of this API. Will be used to reference the API from other modules.
module.exports.apiName = "Dinner";
