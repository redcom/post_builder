API_URL = window.location.href.replace(/#.*/, '') + 'rest/';
var addEvents;
var temporaryData;

var APP = {
    exploreSites: function(elem) {
        LIB.ajax('GET', API_URL + 'sites').then(APP.showTemplateTable, APP.snowError);
    },
    explorePosts: function(elem) {
        if (Array.isArray(temporaryData) && temporaryData[0].table === "posts") {
            APP.showTemplateTable(temporaryData);
        } else {
            LIB.ajax('GET', API_URL + 'posts').then(APP.showTemplateTable, APP.snowError);
        }
    },
    exploreCategories: function(elem) {
        LIB.ajax('GET', API_URL + 'categories').then(APP.showTemplateTable, APP.snowError);
    },
    showAlertInfo: function(elem) {
        showAlertInfo(elem);
    },
    showPostsContent: function(evt) {
        evt.stopPropagation();
        var id = evt.currentTarget.dataset.id;
        showPostsContent(temporaryData[id]);
    },
    showTemplateTable: function(data) {
        if (data.length < 1) return;
        setTableVisible();
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
    var tr = td = isPost = '',
        objKeys = Object.keys(arr[0]);

    arr.map(function(row, idx) {
        td = isPost = '';

        objKeys.map(function(key) {
            if (key === 'javascript') {
                td += '<td data-action="showAlertInfo" data-info="' + row[key] + '"> View</td>';
            } else if (key === 'table' && row[key] === 'posts') {
                isPost = ' data-action="showPostsContent" data-id="' + idx + '" title="Show post #' + idx + '" ';
                td += '<td>Post #' + idx + '</td>';
            } else {
                td += '<td>' + (row[key]).toString().substr(0, 100) + '</td>';
            }
        });

        tr += '<tr ' + isPost + '>' + td + '</tr>';

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
var setTableVisible = function() {
    var table = document.querySelector('#templatePageTable').parentNode;
    document.querySelector('#templatePageShow').className += ' hidden';
    table.className = table.className.replace(/(\shidden)+/, '');
}

var showPostsContent = function(data) {
    document.querySelector('#templatePageTable').parentNode.className += " hidden";
    var page_show = document.querySelector('#templatePageShow');
    page_show.className = page_show.className.replace(/(\shidden)+/, '');

    var objKeys = Object.keys(data);

    page_show.querySelectorAll('h1')[0].innerHTML = data.header;
    page_show.querySelectorAll('article')[0].innerHTML = data.content;

    objKeys = objKeys.filter(function(key) {
        return ['header', 'content', 'created', 'link', 'table'].indexOf(key) < 0;
    });

    var boxes = "";
    if (objKeys.length > 0) {
        objKeys.map(function(key, idx) {
            boxes += "<div>" + data[key] + "</div>";
        });

        boxes = document.createRange().createContextualFragment(boxes);

        page_show.querySelectorAll('article')[0].parentNode.appendChild(boxes);
    }

};
