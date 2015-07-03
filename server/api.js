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
                var params = _.extend(parameters, req.params);
                return callback_fun(params);
            }).catch(function global_error(error) {
                console.log(error);
                return next(error);
            }).done(function global_done(value) {
                res.send(value);
                return next();
            });
        };

        server[http_method](endpoint, wrapped_callback);
    }

    map_route(
        "/rest/db_check",
        "get", {},
        function db_check(params) {
            var response = {
                "check": "db"
            };

            var db_promise = Q.ninvoke(db, "count", {}).then(function(err, count) {
                if (!err && count) {
                    response.db_count = count;
                } else {
                    throw new Error("Error in db.count");
                }
                return response;
            });
            return db_promise;
        });

    map_route(
        "/rest/links",
        "post", {
            table: 'links'
        },
        function post_links(params) {
            console.log(params);

            //var db_promise = Q.ninvoke(db, "all", "SELECT * FROM tEvent ORDER BY id LIMIT $total_events OFFSET $event_offset;", {
            //});

            var response = {};

console.log(response);
/*
 *            return db_promise.then(function(rows) {
 *                if (!rows || rows.length == 0) return;
 *
 *                response = rows;
 *
 *                return Q.all(
 *                    rows.map(function get_transactions(row) {
 *                        return Q.ninvoke(db, "all", "SELECT * from tTransaction WHERE event = $event", {
 *                                $event: row.id
 *                            })
 *                            .then(function(t_rows) {
 *                                row.transactions = sanitize_transactions(t_rows);
 *                            });
 *                    })
 *                );
 *            }).then(function() {
 *                return response;
 *            });
 */
        });

    map_route(
        "/rest/people",
        "get", {},
        function get_people(req, res) {
            //TODO: Offsets?

            var db_promise = Q.ninvoke(db, "all", "SELECT * FROM tPerson ORDER BY id;");

            var response = {};

            return db_promise.then(function(rows) {
                if (!rows || rows.length == 0) return;

                for (var i = 0; i < rows.length; i++) {
                    response[rows[i]["id"]] = rows[i]["name"];
                }

                return response;
            });
        });
};
