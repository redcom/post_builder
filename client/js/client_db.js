//TODO - Replace this with a proper module loader - Bower too?

var ClientDB = function() {
	"use strict";

	// TODO: Move this to a more common location?
	function ajax(url) {
		var req = new XMLHttpRequest(), deferred = Q.defer();

		req.onabort = req.onerror = req.ontimeout = function ajax_error(event) {
			deferred.reject(event);
		};

		req.onload = function ajax_handler(event) {
			deferred.resolve(JSON.parse(req.responseText));
		};

		req.open("GET", url, true);
		req.send();

		return deferred.promise;
	}


	// TODO: So this model won't work - needs rewriting
	// Probably best to move to a model where indexeddb stores 'tables' from the DB and 'views'
	// collate these into objects that get returned to the actual JS.
	// - Want to keep the promises idea most likely.
	// - Also idb transactions to support multiple stores of the JS objects (not quite necessary now)
	// TODO: separate out transactions table?
	var stores = ["events", "people"];

	// TODO: this wrapper is pointless - replace with simple object
	function db_wrapper(idb) {
		Object.defineProperty(this, "_db", {
			configurable: false,
			enumerable: false,
			writable: false,
			value: idb,
		});

		stores.forEach(function (store) {
			Object.defineProperty(this, store, {
				configurable: false,
				enumerable: true,
				writable: false,
				value: new store_wrapper(store, idb),
			});
		}, this);
	}

	db_wrapper.prototype = {
		//TODO: Not loading all at once etc.
		sync: function sync_db(server_url) {
			var db = this;

			//TODO: Failure handlers...
			return Q.all([ajax(server_url + "rest/events").then(function save_events(events) {
				var promises = [];
				
				events.forEach(function(event) {
					promises.push(db.events.put(event));
				});

				return Q.all(promises);
			}), ajax(server_url + "rest/people").then(function save_people(people) {
				return db.people.put(people);
			})]);
		},

		//TODO: Remove this and replace with something more relevant
		countall: function() {
			var trans = this._db.transaction(stores, "readonly"),
			events = trans.objectStore("events"),
			people = trans.objectStore("people"),
			deferred = Q.defer();

			// Unbounded key ranges? & cursors perhaps.
			var ev_req = events.count(IDBKeyRange.lowerBound(0, true));
			var pl_req = people.get(IDBKeyRange.lowerBound(0, true));

			trans.onerror = trans.onabort = function (error) {
				deferred.reject(error);
			};

			trans.oncomplete = function () {
				deferred.resolve(["Events:  " + ev_req.result, "People: " + JSON.stringify(pl_req.result)]);
			};

			return deferred.promise;
		},

		close: function() {
			this._db.close();
		},
	};

	function store_wrapper(store_name, db) {
		Object.defineProperty(this, "_store", {
			configurable: false,
			enumerable: false,
			writable: false,
			value: store_name,
		});

		Object.defineProperty(this, "_db", {
			configurable: false,
			enumerable: false,
			writable: false,
			value: db,
		});
	}

	store_wrapper.prototype = {
		//TODO: Allow multiple transactions over puts/gets
		put: function store_put(value) {
			var trans = this._db.transaction([this._store], "readwrite"),
			store = trans.objectStore(this._store),
			deferred = Q.defer();

			//TODO: Something something existing data.
			//TODO: Handle error cases from direct error here
			var req = store.add(value);

			//TODO: Listen to the actual requests error/sucess messages - promise progress?
			trans.onerror = trans.onabort = function abort_put(error) {
				deferred.reject(error);
			};

			trans.oncomplete = function complete_put() {
				deferred.resolve(value);
			};

			return deferred.promise;
		},
	};

	function db(db_name) {
		db_name = (typeof db_name === 'undefined') ? "VacTrack" : db_name;

		var deferred = Q.defer();

		var open_req = indexedDB.open(db_name, 1);

		open_req.onerror = function(event) {
			deferred.reject(event);
		};

		open_req.onsuccess = function(event) {
			deferred.resolve(new db_wrapper(open_req.result));
		};

		open_req.onupgradeneeded = function(event) {
			//TODO: What to do when schema changes
			var db = event.target.result;

			// Out of line keys that don't match server keys
			// TODO: Autogen some of this from server SQL?
			var events = db.createObjectStore("events", {autoIncrement: true});
			var people = db.createObjectStore("people", {autoIncrement: true});

			events.createIndex("id", "id", { unique: true });
		};

		return deferred.promise;
	}

	return {
		db: db,
	};
}();
