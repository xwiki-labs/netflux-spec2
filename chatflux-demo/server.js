/* globals require console */
const Express = require('express');
const Http = require('http');
const Fs = require('fs');
const WebSocketServer = require('ws').Server;
const Config = require('./config.js');
const Server = require('../' + Config.netfluxImpl + '/server');

const app = Express();
app.use(Express.static(__dirname + '/'));
app.get("/", (req, res) => {
    res.redirect(Config.demo);
});
app.get("/api/netflux.js", (req, res) => {
    Fs.readFile(__dirname + '/../' + Config.netfluxImpl + '/client.js', (err, data) => {
        if (err) { throw err; }
        res.send(data.toString('utf8'));
    });
});
app.get("/api/preconfigured-netflux.js", (req, res) => {
    res.send("define(['/api/netflux.js'], " + Config.configureNetflux.toString() + ");");
});

const httpServer = Http.createServer(app);
httpServer.listen(Config.port, Config.bindAddress, () => {
    console.log('listening on [%s]:%s', Config.bindAddress, Config.port);
});

Server.run(
    {
        getMessages: () => {},
        message: () => {}
    },
    new WebSocketServer({ server: httpServer })
);
