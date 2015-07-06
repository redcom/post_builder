var Q = require("q"),
    fs = require("fs"),
    _ = require('underscore'),
    restify = require("restify");

module.exports = function rest_api(options) {
    "use strict";

    var db = options.db;
    var server = options.server;

    function map_route(endpoint, http_method, parameters, callback_fun) {
        var wrapped_callback = function wrapped_callback(req, res, next) {
            Q.try(function() {
                var params;
                if (_.isArray(req.params)) {
                    params = [];
                    _.each(req.params, function(elem) {
                        params.push(_.extend(elem, parameters));
                    });
                } else {
                    params = _.extend(parameters, req.params);
                }
                return callback_fun(params);
            }).catch(function global_error(error) {
                return next(error);
            }).done(function global_done(value) {
                res.send(value);
                return next();
            });
        };

        server[http_method](endpoint, wrapped_callback);
    }

    // POST CONTENT


    map_route(
        "/rest/posts",
        "post", {
            table: 'posts',
            created: Date.now()
        },
        function post_posts(params) {



            var db_promise = Q.ninvoke(db, "insert", params);
            var response = {};
            return db_promise.then(function(rows) {
                    if (!rows || rows.length == 0) return;
                    response = rows;
                })
                .then(function() {
                    return response;
                })
        });

    map_route(
        "/rest/posts",
        "get", {
            table: 'posts'
        },
        function get_posts(params) {
            var db_promise = Q.ninvoke(db, "find", params);
            var response = {};
            return db_promise.then(function(rows) {
                    if (!rows || rows.length == 0) return;
                    response = rows;
                })
                .then(function() {
                    return response;
                })
        });
    // POST categories

    map_route(
        "/rest/categories",
        "post", {
            table: 'categories',
            created: Date.now()
        },
        function post_categories(params) {
            var db_promise = Q.ninvoke(db, "insert", params);
            var response = {};
            return db_promise.then(function(rows) {
                    if (!rows || rows.length == 0) return;
                    response = rows;
                })
                .then(function() {
                    return response;
                })
        });

    map_route(
        "/rest/categories",
        "get", {
            table: 'categories'
        },
        function get_categories(params) {
            var db_promise = Q.ninvoke(db, "find", params);
            var response = {};
            return db_promise.then(function(rows) {
                    if (!rows || rows.length == 0) return;
                    response = rows;
                })
                .then(function() {
                    return response;
                })
        });

    map_route(
        "/rest/links",
        "post", {
            table: 'links',
            created: Date.now()
        },
        function post_links(params) {
            var db_promise = Q.ninvoke(db, "insert", params);
            var response = {};
            return db_promise.then(function(rows) {
                    if (!rows || rows.length == 0) return;
                    response = rows;
                })
                .then(function() {
                    return response;
                })
        });

    map_route(
        "/rest/links",
        "get", {
            table: 'links'
        },
        function get_links(params) {
            var db_promise = Q.ninvoke(db, "find", params);
            var response = {};
            return db_promise.then(function(rows) {
                    if (!rows || rows.length == 0) return;
                    response = rows;
                })
                .then(function() {
                    return response;
                })
        });

    map_route(
        "/rest/db_check",
        "get", {},
        function db_check(params) {
            var response = {
                "check": "db"
            };
            var db_promise = Q.ninvoke(db, "count", {}).then(function(count) {
                if (count >= 0) {
                    response.db_count_records = count;
                } else {
                    throw new Error("Error in db.count");
                }
                return response;
            });
            return db_promise;
        });

};
