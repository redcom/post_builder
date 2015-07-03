"use strict";

var restify = require("restify"),
    fs = require("fs"),
    // Type 3: Persistent datastore with automatic loading
    Datastore = require('nedb'),
    db;

var db_file = "./database/database.db"
var webroot = "client",
    port = 8000;


db = new Datastore({
    filename: db_file,
    autoload: true
});


function start_server() {
    restify.CORS.ALLOW_HEADERS.push('authorization');
    restify.CORS.ALLOW_HEADERS.push('Access-Control-Allow-Origin');
    var server = restify.createServer();
    server.pre(restify.CORS({
        credentials: true,
    }));

    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.queryParser({
        mapParams: true
    }));
    server.use(restify.bodyParser({
        mapParams: true
    }));

    server.get(/^(?!\/rest\/).*/, restify.serveStatic({
        directory: webroot,
        default: "index.html",
        maxAge: 0
    }));

    require("./api")({
        db: db,
        server: server
    });

    server.listen(port, function() {
        console.log('Server listen on ', port);
    });
}
start_server();
