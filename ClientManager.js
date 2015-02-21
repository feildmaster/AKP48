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
    name: 'AKP48 ClientManager',
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

var Client = require("./Client/Client");
var Builder = require("./Client/Builder");
var GitListener = require('./GitListener');

/**
 * The ClientManager.
 * @param {JSON} config The IRCBot configuration.
 */
function ClientManager(config) {
    // array of all clients
    this.clients = [];

    // load all of the clients on creation of this object.
    this.loadClients(config);

    //builder
    this.builder = new Builder();

    log.info("Creating Git Listener");
    this.gitListener = new GitListener(this);
}

/**
 * Load all clients from config file.
 * @param {JSON} config The config file.
 */
ClientManager.prototype.loadClients = function(config) {
    log.info("Loading client information...");
    for (i in config.servers) {
        if(config.servers.hasOwnProperty(i)) {
            var server = config.servers[i];
            this.addClient(Client.build(server));
        }
    };
};

/**
 * Add a client to this ClientManager.
 * @param {Client} client The client.
 */
ClientManager.prototype.addClient = function(client) {
    log.info("Initializing client", client.getNick(), "on", client.getServer()+":"+client.getPort()+".");
    client.initialize(this);
    this.clients.push(client);
};

ClientManager.prototype.softReload = function() {
    //remove all sorts of cached objects from the cache
    //starting with all commands
    require('fs').readdirSync(__dirname+"/Commands").forEach(function(file) {
        delete require.cache[require.resolve('./Commands/'+file)];
    });

    //all api objects
    require('fs').readdirSync(__dirname + '/API/').forEach(function(file) {
        delete require.cache[require.resolve('./API/' + file)];
    });

    //all AKP48 client objects
    require('fs').readdirSync(__dirname + '/Client/').forEach(function(file) {
        delete require.cache[require.resolve('./Client/' + file)];
    });

    //all regular expression objects
    require('fs').readdirSync(__dirname + '/Regex/').forEach(function(file) {
        delete require.cache[require.resolve('./Regex/' + file)];
    });

    //all autoresponses
    require('fs').readdirSync(__dirname + '/AutoResponses').forEach(function(file) {
        delete require.cache[require.resolve('./AutoResponses/' + file)];
    });

    //the command processor, autoresponse processor, and configuration file
    delete require.cache[require.resolve('./CommandProcessor')];
    delete require.cache[require.resolve('./AutoResponseProcessor')];
    delete require.cache[require.resolve('./config.json')];

    //and finally, the autoresponse and command loaders.
    delete require.cache[require.resolve('./AutoResponses/')];
    delete require.cache[require.resolve('./Commands/')];

    //now we can reload all the clients.
    this.reloadClients();
};

/**
 * Reload the CommandProcessor in each Client that this ClientManager manages.
 */
ClientManager.prototype.reloadClients = function() {
    log.info("Reloading all clients.");

    var tempIRCClient = null;

    //temporary array for clients
    var tempClients = [];

    //for each client, create a temporary client and delete the running one.
    for (i in this.clients) {
        //keep a reference to the IRC client, so it doesn't disconnect.
        tempIRCClient = this.clients[i].getIRCClient();

        //build a new client using the values from this client.
        tempClient = Client.build({
            nick: this.clients[i].getNick(),
            realname: this.clients[i].getRealName(),
            username: this.clients[i].getUserName(),
            password: this.clients[i].getPassword(),
            server: this.clients[i].getServer(),
            port: this.clients[i].getPort(),
            alert: this.clients[i].alert,
            channels: this.clients[i].getChannels()
        });

        tempClient.ircClient = tempIRCClient;

        //delete the client.
        delete this.clients[i];
    };

    //for each temporary client we created, initialize it.
    for (i in tempClients) {
        tempClients[i].initialize(this, true);
    }

    log.info("Soft reload complete.");
};

/**
 * Save the configuration of this ClientManager.
 */
ClientManager.prototype.save = function() {
    log.info("Saving configuration...");

    //get the current config
    var config = require("./config.json");
    //remove the current server config
    config.servers = [];

    // TODO: fix this
    for (var i = 0; i < this.clients.length; i++) {
        //copy the client, keeping only properties.
        var client = this.clients[i].clone();

        //delete everything we don't need to save.
        delete client.commandProcessor;
        delete client.ircClient;
        delete client.clientManager;
        delete client.isTemporary;

        config.servers.push(client);
    };

    require('fs').writeFile('./config.json', JSON.stringify(config, null, 4), function (err) {
        if (err) return console.log(err);
        log.info('Configuration saved.');
    });
};

ClientManager.prototype.shutdown = function(msg) {
    log.info("Shutting down all clients.");
    for (var i = 0; i < this.clients.length; i++) {
        this.clients[i].shutdown(msg);
    };

    log.info("Killing process.");
    process.exit(0);
};

module.exports = ClientManager;