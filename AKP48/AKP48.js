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

var irc = require('irc');
var Context = require('./Context');

function AKP48(options, logger) {
    this.log = logger.child({module: "AKP48"});
    this.instanceManager = options.instanceManager;
    this.uuid = options.uuid;
    this.configManager = options.configManager;
    this.ircClient = options.ircClient;

    if(this.ircClient) {
        this.syncToConfig();
    } else {
        this.initialize();
    }
}

AKP48.prototype.syncToConfig = function () {
    var config = this.configManager.getServerConfig();

    this.ircClient.removeAllListeners();
    this.ircClient.on('registered', this.handleRegister);
    this.ircClient.on('kick', this.handleKick);
    this.ircClient.on('message', this.handleMessage);
    this.ircClient.on('action', this.handleAction);

    //TODO: compare channels in ircClient to channels in config, make the two match.
};

AKP48.prototype.initialize = function () {
    var config = this.configManager.getServerConfig();
    var channels = this.configManager.getChannels();
    //TODO: initialize the ircClient here, using the config as a base.
    this.ircClient = new irc.Client(config.address, config.nick,
        {userName: config.username, realName: config.realname, port: config.port,
         channels: channels, password: (config.password.length ? config.password : null),
         floodProtection: (config.floodProtection || true), floodProtectionDelay: (config.floodProtectionDelay || 250),
         autoRejoin: (config.autoRejoin || true), encoding: (config.encoding || "utf-8")});

    var self = this;

    this.ircClient.on('registered', function (message) {
        self.handleRegister(message);
    });

    this.ircClient.on('kick', function (channel, nick, by, reason) {
        self.handleKick(channel, nick, by, reason);
    });

    this.ircClient.on('message', function (nick, to, text, message) {
        self.handleMessage(nick, to, text, message);
    });

    this.ircClient.on('action', function (nick, to, text) {
        self.handleAction(nick, to, text);
    });
};

AKP48.prototype.handleRegister = function (message) {
    var config = this.configManager.getServerConfig();
    this.log.info("Connected to " + config.address + ":" + config.port + " with nick '" + this.ircClient.nick + "'");
};

AKP48.prototype.handleKick = function (channel, nick, by, reason) {
    console.log(channel, nick, by, reason);
};

AKP48.prototype.handleMessage = function (nick, to, text, message) {
    var context = new Context(nick, to, text, message, this, this.log);
    console.log(context);
};

AKP48.prototype.handleAction = function (nick, to, text) {
    console.log(nick, to, text);
};

module.exports = AKP48;
