API_URL = window.location.href.replace('#','') + 'rest/';
var APP = {
    exploreLinks: function(elem) {
        console.log('ExploreLinks');
        LIB.ajax('GET', API_URL + 'sites').then(function(r) {
            console.log('Results', r);
        }, function(err) {
            console.log('Err', err);
        });
    },
    explorePosts: function(elem) {
        console.log('ExplorePOSts');
        LIB.ajax('GET', API_URL + 'posts').then(function(r) {
            console.log('Results', r);
        }, function(err) {
            console.log('Err', err);
        });
    },
    exploreCategories: function(elem) {
        console.log('Explore Categories');
        LIB.ajax('GET', API_URL + 'categories').then(function(r) {
            console.log('Results', r);
        }, function(err) {
            console.log('Err', err);
        });
    },
};


var actions = document.querySelectorAll('[data-action]');

Array.prototype.map.call(actions, function(elem, idx) {
    var action = elem.dataset.action;
    elem.addEventListener('click', APP[action], false);
});
