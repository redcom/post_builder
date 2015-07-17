var setTableVisible = function() {
    var table = document.querySelector('#templatePageTable').parentNode;
    document.querySelector('#templatePageShow').className += ' hidden';
    table.className = table.className.replace(/(\shidden)+/, '');
};
var setPostVisible = function() {
    document.querySelector('#templatePageTable').parentNode.className += " hidden";
    var page_show = document.querySelector('#templatePageShow');
    page_show.className = page_show.className.replace(/(\shidden)+/, '');
};

var removeVisitedPostsCass = function removeVisitedPostsCass(nodes) {
    Array.prototype.map.call(nodes, function(val, idx) {
        if (val.className === " visited") {
            val.className = val.className.replace(/(\svisited)+/, '');
        }
    });
};

var addEvents = function addEvents() {
    var actions = document.querySelectorAll('[data-action]');

    Array.prototype.map.call(actions, function(elem, idx) {
        var action = elem.dataset.action;
        elem.removeEventListener('click');
        elem.addEventListener('click', APP[action], false);
    });
};

var showAlertInfo = function(elem) {
    if (elem.target.dataset.info) {
        var target = document.querySelectorAll('.alert-info pre')[0];
        target.parentNode.className += 'fade in';
        target.innerText = elem.target.dataset.info;
    }
};

