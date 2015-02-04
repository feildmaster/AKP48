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

var request = require('request-json');
var c = require('irc-colors');
var n = require('numeral');
var m = require('moment');
var google = require('googleapis');

function Google(api_key) {
    this.api_key = api_key;
    this.client = request.newClient('https://www.googleapis.com/');
    this.urlshortener = google.urlshortener({ version: 'v1', auth: this.api_key });
}

/**
 * Shorten a URL using Goo.gl.
 * @param  {String}   url      The URL to shorten.
 * @param  {Function} callback The callback to call after shortening.
 */
Google.prototype.shorten_url = function(url, callback) {
    this.urlshortener.url.insert({ resource: { longUrl: url } }, function (err, response) {
      callback(response.id);
    });
};

Google.prototype.youtube_video_info = function(video_ids, maxLines, callback) {
    var self = {};
    self.client = this.client;
    self.api_key = this.api_key;

    for (var i = 0; i < Math.min(video_ids.length, maxLines); i++) {
        this.client.get('/youtube/v3/videos?id='+video_ids[i]+'&key='+this.api_key+'&fields=items(snippet(title,channelId,publishedAt),contentDetails(duration,dimension,definition),statistics(viewCount,likeCount,dislikeCount))&part=snippet,statistics,contentDetails',
            function(err, res, body){
                var video = body;
                if(video.items[0]) {
                    self.client.get('/youtube/v3/channels?part=snippet&key='+self.api_key+'&id='+video.items[0].snippet.channelId+'&fields=items(snippet(title))',
                        function(err, res, body) {
                            var d = m.duration(video.items[0].contentDetails.duration);
                            var definition = video.items[0].contentDetails.definition;
                            var dimension = video.items[0].contentDetails.dimension;
                            var publishedAt = m(video.items[0].snippet.publishedAt).format("MMMM Do, YYYY");
                            var timeString = n((d.hours()*60*60)+(d.minutes()*60)+d.seconds()).format("00:00:00");
                            var outputString = c.black("[") + c.bold("You") + c.red("Tube") + c.black("] ");
                            outputString += video.items[0].snippet.title + " by " + body.items[0].snippet.title;
                            if(timeString !== "0:00:00" || definition === 'hd' || dimension === '3d') {
                                outputString += " (";

                                if(timeString !== "0:00:00") {
                                    outputString += c.bold(timeString);
                                }

                                if(dimension === '3d') {
                                    outputString += c.bold(" 3D");
                                }

                                if(definition === 'hd') {
                                    outputString += c.bold(" HD");
                                }

                                outputString += ")";
                            }
                            outputString += " | ";
                            outputString += "Views: " + n(video.items[0].statistics.viewCount).format("0,0");
                            outputString += " | ";
                            outputString += c.green("Likes: " + n(video.items[0].statistics.likeCount).format("0,0"));
                            outputString += " | ";
                            outputString += c.red("Dislikes: " + n(video.items[0].statistics.dislikeCount).format("0,0"));
                            outputString += " | ";
                            outputString += "Published on " + publishedAt;
                            callback(outputString);
                    });
                }
            });
    };
};

Google.prototype.geocode = function(location, region, callback) {
    var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+location;

    if(region) {
        url += "&region="+region;
    }

    url += "&key="+this.api_key;

    this.client.get(url, function(err, res, body){
        if(body.results[0]) {
            var outputString = body.results[0].formatted_address;
            outputString += " | Lat: " + n(body.results[0].geometry.location.lat).format("0.000");
            outputString += " | Long: " + n(body.results[0].geometry.location.lng).format("0.000");
        } else {
            outputString = c.red("No results found!");
        }

        callback(outputString);
    });
};

//I think request-json is still needed here.
Google.prototype.search = function(query, type, callback) {
    var url = 'http://ajax.googleapis.com/ajax/services/search/'+type+'?v=1.0&safe=high&q='+encodeURIComponent(query);
    var self = this;
    this.client.get(url, function(err, res, body){
        if(body.responseData) {
            if(body.responseData.results[0]) {
                var outputString = "Title: \"" + body.responseData.results[0].titleNoFormatting;
                self.shorten_url(body.responseData.results[0].url, function(smallUrl) {
                    outputString += "\" | URL: " + smallUrl;
                    callback(outputString);
                });
            }
        }
    });
}

module.exports = Google;