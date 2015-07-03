var expect = chai.expect,
db_name = "TestTrack";

// Don't look too closesly. State right now is to test the async handling. needs major cleanup.
//TODO: Replace with proper test suite for client side db
describe("Client DB", function() {
	var server = sinon.fakeServer.create();
	server.autoRespond = true;

	// TODO: Replace implementation of this fake server
	server.respondWith("GET", "/rest/events",
					   [200, { "Content-Type": "application/json" },
						'[{"id":1,"name":"Dinner @ Dennys","time_stamp":"2013-07-31 13:00:00","latitude":51.48482,"longitude":-0.013905,"position_range":0.0001,"extra_details":null,"transactions":[{"id":1,"amount":60,"person":1},{"id":2,"amount":-20,"person":1},{"id":3,"amount":-20,"person":3},{"id":4,"amount":-20,"person":2}]}]']);
	server.respondWith("GET", "/rest/people",
					   [200, { "Content-Type": "application/json" },
						'{"1":"firesock","2":"blu","3":"schuki","4":"weiho"}']);

	var db;

	describe("Setup", function(){
		it("should create a db wrapper", function() {
			indexedDB.deleteDatabase(db_name);

			var promise = ClientDB.db(db_name).then(function(db_obj) {
				db = db_obj;
				return db;
			});

			return expect(promise).to.eventually.be.ok;
		});
	});

	describe("Sync", function() {
		beforeEach(function(done) {
			indexedDB.deleteDatabase(db_name);

			ClientDB.db(db_name).done(
				function(db_obj) {
					db = db_obj;
					done();
				}, done);
		});

		it("should get data from the server", function() {
			return expect(db.sync("/")).to.eventually.eql( [[{"id":1,"name":"Dinner @ Dennys","time_stamp":"2013-07-31 13:00:00","latitude":51.48482,"longitude":-0.013905,"position_range":0.0001,"extra_details":null,"transactions":[{"id":1,"amount":60,"person":1},{"id":2,"amount":-20,"person":1},{"id":3,"amount":-20,"person":3},{"id":4,"amount":-20,"person":2}]}],{"1":"firesock","2":"blu","3":"schuki","4":"weiho"}]);
		});
	});


	describe("Retrieve", function() {
		beforeEach(function(done) {
			indexedDB.deleteDatabase(db_name);

			ClientDB.db(db_name).then(
				function(db_obj) {
					db = db_obj;
					return db.sync("/");
				}, done).done(function() {
					done();
				}, done);
		});

		it("should retrieve matching data after sync", function() {
			return expect(db.countall()).to.eventually.eql(["Events:  1","People: " + JSON.stringify({"1":"firesock","2":"blu","3":"schuki","4":"weiho"})]);
		});
	});

	afterEach(function() {
		db.close();
	});

	after(function() {
		server.restore();
	});
});
