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

var config = require("../config.json");

function Git() {

    this.port = 4269;

    this.repository = "AKPWebDesign/AKP48";

    this.branch = "master";

    if(config.git) {
        if(config.git.listenPort) {
            this.port = config.git.listenPort;
        }

        if(config.git.repository) {
            this.repository = config.git.repository;
        }

        if(config.git.branch) {
            this.branch = config.git.branch;
        }
    }

    //if listening for changes is allowed, set up listener.
    if(config.git.listenForChanges) {

        log.info({repo: this.repository, port: this.port, branch: this.branch}, "Initializing GitHub event listener");

        // create a gith server
        this.gith = require('gith').create( this.port );

        //set up listeners
        this.gith({
            repo: this.repository,
            branch: this.branch
        }).on('all', function(payload) {
            log.info({payload: payload}, "Received GH event!");
        });
    }
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