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

var path = require('path');
var bunyan = require('bunyan');
var log = bunyan.createLogger({
    name: 'AKP48 Git API Module',
    streams: [{
        type: 'rotating-file',
        path: path.resolve("./log/AKP48.log"),
        period: '1d',
        count: 7
    },
    {
        stream: process.stdout
    }]
});

function Git() {
    //TODO: things.
}

/**
 * Fetch code from all remotes.
 */
Git.prototype.fetch = function() {

};

/**
 * Get latest commit hash.
 * @param  {String} branch Optional. The branch to get commit for. Defaults to master.
 * @return {String}        The commit SHA.
 */
Git.prototype.getLatestCommit = function(branch) {
    if(!branch) {
        branch = "master";
    }

    var sha = "";

    return sha;
};

module.exports = Git;