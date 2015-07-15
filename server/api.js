var Q = require("q"),
    fs = require("fs"),
    _ = require('underscore'),
    restify = require("restify");


module.exports = function(options) {
    "use strict";

    var db = options.db;
    var server = options.server;


    function mapRoute(endpoint, http_method, parameters, callbackFun) {
        var wrappedCallback = function wrappedCallback(req, res, next) {
                var params;
                if (req.params[parameters.table] && Array.isArray(req.params[parameters.table]) ||
                    (typeof req.params[parameters.table] === "string" && Array.isArray(JSON.parse(req.params[parameters.table])))) {

                    params = req.params[parameters.table];
                    if (!Array.isArray(params)) {
                    params = JSON.parse(params);
                    }
                    params.forEach(function(val, idx, ctx) {
                        ctx[idx] = _.extend(val, parameters);
                    });
                } else {
                    params = _.extend(req.params, parameters);
                }

                return callbackFun(params, res, next);
        };

        server[http_method](endpoint, wrappedCallback);
    }

    // POSTS
    mapRoute(
        "/rest/posts",
        "post", {
            table: 'posts',
            created: Date.now()
        },
        function postPosts(params, res, next) {

            db.insert(params, function(err, count) {
                if (!err) {
                    res.send(params);
                } else {
                    console.log('Error Insert', err);
                    return next(err);
                }
            });
        });

    mapRoute(
        "/rest/posts",
        "get", {
            table: 'posts'
        },
        function getPosts(params, res, next) {
            var map = function(doc) {
                if (doc.table === params.table) {
                    return doc;
                }
            };
            var cb = function(err, selected) {
                if (!err) {
                    res.send(selected);
                } else {
                    return next(err);
                }
            };
            db.all(map, cb);
        });

    mapRoute(
        "/rest/sites",
        "post", {
            table: 'sites',
            created: Date.now()
        },
        function postSites(params, res, next) {
            db.insert(params, function(err, count) {
                if (!err) {
                    res.send(params);
                } else {
                    console.log('Error Insert', err);
                    return next(err);
                }
            });
        });

    mapRoute(
        "/rest/sites",
        "get", {
            table: 'sites'
        },
        function getSites(params, res, next) {
            var map = function(doc) {
                if (doc.table === params.table) {
                    return doc;
                }
            };
            var cb = function(err, selected) {
                if (!err) {
                    res.send(selected);
                } else {
                    return next(err);
                }
            };
            db.all(map, cb);
        });


    mapRoute(
        "/rest/db_check",
        "get", {},
        function dbCheck(params, res, next) {
            var response = {
                "check": "db"
            };
            db.count(function(doc) {
                return doc;
            }, function(err, count) {
                if (!err) {
                    response.count = count;
                    res.send(response);
                } else {
                    return next(err);
                }
            });
        });

};
