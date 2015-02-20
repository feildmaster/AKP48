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
    name: 'AKP48 Git Webhook Listener',
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

var config = require("./config.json");
var GitHooks = require("githubhook");

function GitListener(clientmanager) {
    this.manager = clientmanager;

    //port to listen on
    this.port = 4269;

    //path to listen at
    this.path = "/github/callback";

    //secret to use
    this.secret = "";

    //repo to listen for
    this.repository = "AKP48";

    //branch to listen for
    this.branch = "master";

    //listener
    this.githubListener = null;

    //if there is a git configuration, set all options
    if(config.git) {
        if(config.git.port) {
            this.port = config.git.port;
        }

        if(config.git.path) {
            this.path = config.git.path;
        }

        if(config.git.secret) {
            this.secret = config.git.secret;
        }

        if(config.git.repository) {
            this.repository = config.git.repository;
        }

        if(config.git.branch) {
            this.branch = config.git.branch;
        }

        if (config.git.autoUpdate) {
            this.autoUpdate = config.git.autoUpdate;
        }
    }

    //if listening for changes is allowed, set up listener.
    if(config.git.listenForChanges) {
        this.startListening();
    }
}

Git.prototype.startListening = function() {
    if (this.githubListener) {
        log.error("Attempted to listen while already listening.");
        return;
    }

    log.info({repo: this.repository, port: this.port, branch: this.branch}, "Initializing GitHub Webhook listener");

    this.githubListener = GitHooks({
        path: this.path,
        port: this.port,
        secret: this.secret
    });

    this.githubListener.listen();

    if(this.branch !== "*") {
        this.githubListener.on("push:"+this.repository+":"+this.branch, pushBranch);
    } else {
        this.githubListener.on("push:"+this.repository, pushRepo);
    }
}

function pushBranch(data) {
    log.info({head_commit_message: data.head_commit.message, compare_link: data.compare}, "GitHub Webhook received.");
    handle(this.branch, data);
}

function pushRepo(ref, data) {
    log.info({head_commit_message: data.head_commit.message, compare_link: data.compare, ref: ref}, "GitHub Webhook received.");
    handle(ref.substring(ref.lastIndexOf('/') + 1), data);
}

function handle(branch, data) {
    var update = this.autoUpdate;
    if (update) {
        log.info("Updating to branch: " + branch);
        // Fetch, reset
        // npm install if needed
    }
    // irc notice
    if (update) {
        // reload
        // stop if needed
    }
}

module.exports = GitListener;
