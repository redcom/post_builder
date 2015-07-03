function test_db() {
	var completed = true;

	function error_func(event) {
		completed = JSON.stringify(event);

		if ((typeof self !== 'undefined' && self.indexedDB) ||
			(typeof window !== 'undefined' && window.indexedDB)) indexedDB.deleteDatabase("TestDB");
	}

	try {

		var request = indexedDB.open("TestDB", 1);

		request.onerror = error_func;

		request.onupgradeneeded = function(event) {
			var db = event.target.result;

			db.createObjectStore("test", {keyPath: "id", autoIncrement: true});
		};

		request.onsuccess = function(event) {
			var db = event.target.result;

			db.onerror = error_func;

			var store = db.transaction(["test"], "readwrite").objectStore("test");

			store.put({value: "testVal"}).onsuccess = function(event) {
				var id = event.target.result;

				store.get(id).onsuccess = function(event) {
					console.log(event.target.result);
					db.close();
					indexedDB.deleteDatabase("TestDB");
				};
			};
		};
	} catch (err) {
		error_func(err);
	}

	return completed;
}
