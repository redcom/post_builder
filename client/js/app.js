API_URL = window.location.href.replace(/#.*/, '') + 'rest/';
var addEvents;
var temporaryData;

var APP = {
    exploreLinks: function(elem) {
        LIB.ajax('GET', API_URL + 'sites').then(APP.showTemplateTable, APP.snowError);
    },
    explorePosts: function(elem) {
        LIB.ajax('GET', API_URL + 'posts').then(APP.showTemplateTable, APP.snowError);
    },
    exploreCategories: function(elem) {
        LIB.ajax('GET', API_URL + 'categories').then(APP.showTemplateTable, APP.snowError);
    },
    showAlertInfo: function(elem) {
        showAlertInfo(elem);
    },
    showPostsContent: function(elem) {
       var id = elem.target.dataset.id;
        showPostsContent(temporaryData[id].posts);
    },
    showTemplateTable: function(data) {
        if (data.length < 1) return;
        temporaryData = data;
        showPageHeader(data[0].table);
        showPageTable(data);
        addEvents();
    },
    showError: function(error) {
        throw new Error(err);
    }
};
(addEvents = function addEvents() {
    var actions = document.querySelectorAll('[data-action]');

    Array.prototype.map.call(actions, function(elem, idx) {
        var action = elem.dataset.action;
        elem.addEventListener('click', APP[action], false);
    });
})();

var showPageHeader = function(str) {
    document.querySelector('#templatePageHead > h1').innerText = str;
};
var showPageTable = function(arr) {
    showPageTableHead(Object.keys(arr[0]));
    showPageTableBody(arr);

};
var showPageTableHead = function(headers) {
    var ths = '';
    headers.map(function(head, idx) {
        ths += '<th>' + head.replace('_', '') + '</td>';
    });
    document.querySelector('#templatePageTable table thead tr').innerHTML = ths;
};

var showPageTableBody = function(arr) {
    var tr = td = "",
        objKeys = Object.keys(arr[0]);

    arr.map(function(row, idx) {
        td = '';

        objKeys.map(function(key) {
            if (key === 'javascript') {
                td += '<td data-action="showAlertInfo" data-info="' + row[key] + '"> View</td>';
            } else if (key === 'posts') {
                td += '<td data-action="showPostsContent" data-id="' + idx + '" >' + Object.keys(row[key]).length + ' posts</td>';
            } else {
                td += '<td>' + row[key] + '</td>';
            }
        });

        tr += '<tr>' + td + '</tr>';

    });
    document.querySelector('#templatePageTable tbody').innerHTML = tr;
};

var showAlertInfo = function(elem) {
    if (elem.target.dataset.info) {
        var target = document.querySelectorAll('.alert-info pre')[0];
        target.parentNode.className += 'fade in';
        target.innerText = elem.target.dataset.info;

    }
};
showPostsContent = function(data) {
        console.table(data);
};
