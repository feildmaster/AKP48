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

    //listener
    this.githubListener = null;

    var git = config.git;

    //port to listen on
    this.port = (git && git.port) ? git.port : 4269;

    //path to listen at
    this.path = (git && git.path) ? git.path : "/github/callback";

    //secret to use
    this.secret = (git && git.secret) ? git.secret : "";

    //repo to listen for
    this.repository = (git && git.repository) ? git.repository : "AKP48";

    //branch to listen for
    this.branch = (git && git.branch) ? git.branch : "master";

    this.autoUpdate = (git && git.autoUpdate);

    if(git && git.listenForChanges) {
        this.startListening();
    }
}

GitListener.prototype.startListening = function() {
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

    this.githubListener.on("push:"+this.repository, this.pushRepo);
}

GitListener.prototype.pushRepo = function (ref, data) {
    log.info({head_commit_message: data.head_commit.message, compare_link: data.compare, ref: ref}, "GitHub Webhook received.");
    var branch = ref.substring(ref.lastIndexOf('/') + 1);
    if (this.branch === "*" || this.branch === branch) {
        this.handle(branch, data);
    }
};

GitListener.prototype.handle = function (branch, data) {
    var manager = this.manager;
    // Alert channels of update
    var message = "["+branch+"] Something was pushed. Perhaps later, I'll actually tell you what it was.";
    manager.clients.forEach(function (client) {
        client.alert.forEach(function (channel) {
            client.getIRCClient().say(channel, message);
        });
    });
    
    if (!this.autoUpdate) {
        return;
    }
    
    log.info("Updating to branch: " + branch);
    // Fetch, reset
    if(exec('git fetch && git reset origin/' + branch + ' --hard').code !== 0) {
        log.error("Attempted git fetch & reset failed!");
    }
    // TODO: npm install if *needed*
    exec('npm install');

    // TODO: stop only if needed!!
    var shutdown = true;
    if (shutdown) {
        manager.shutdown("Restarting due to update.");
    } else {
        manager.softReload();
    }
};

module.exports = GitListener;
