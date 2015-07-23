function a() {
    API_URL = window.location.href.replace(/#.*/, '') + 'rest/';
    var temporaryData;
    initNavigation();

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
            removeVisitedPostsCass(evt.currentTarget.parentNode.childNodes);
            evt.currentTarget.className += " visited";
            showPostsContent(temporaryData[id]);
        },
        showTemplateTable: function(data) {
            if (data.length < 1) return;

            if (document.querySelectorAll('#templatePageTable table tbody tr').length > 1) {
                setTableVisible();
                return;
            }
            temporaryData = data;
            showPageHeader(data[0].table);
            showPageTable(data);
            addEvents();
        },
        showError: function(error) {
            throw new Error(err);
        }
    };
    // bind events to data-actions DOM atttributes
    addEvents();

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

    var showPostsContent = function(data) {
        setPostVisible();
        var page_show = document.querySelector('#templatePageShow');
        var objKeys = Object.keys(data);

        page_show.querySelectorAll('h1')[0].innerHTML = data.header;
        page_show.querySelectorAll('article')[0].innerHTML = data.content;

        objKeys = objKeys.filter(function(key) {
            return ['header', 'content', 'created', 'link', 'table'].indexOf(key) < 0;
        });

        var boxes = "";
        if (objKeys.length > 0) {
            objKeys.map(function(key, idx) {
                switch (key) {
                    case 'map_url':
                        boxes += "<div id='map_url'><img src='" + data[key] + "' alt='" + data.header + " on the ski map' title='" + data.header + " resort map position' /></div>";
                        break;
                    default:
                        boxes += "<div>" + data[key] + "</div>";
                        break;
                }
            });

            boxes = document.createRange().createContextualFragment(boxes);

            page_show.querySelectorAll('article')[0].parentNode.appendChild(boxes);
        }

    };
}
