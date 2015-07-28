
var showAlertInfo = function(elem) {
    if (elem.target.dataset.info) {
        var target = document.querySelectorAll('.alert-info pre')[0];
        target.parentNode.className += 'fade in';
        target.innerText = elem.target.dataset.info;
    }
};

var initNavigation = function() {
    var topNavBar = document.querySelectorAll("[role='navigation']")[0];
    var sidebarNav = document.querySelectorAll('.sidebar-nav')[0];
    sidebarNav.style.height = document.body.clientHeight;
    function updateMenuStatus(evt) {
        var acceptedElems = ["navbar-header", "navbar-brand"];
        if(~acceptedElems.indexOf(evt.target.className)) {
            evt.preventDefault();
            sidebarNav.classList.toggle('active');
        }
    }

    var handler = {
        handleEvent: function(evt) {
            switch(evt.type) {
                case 'click': updateMenuStatus(evt);
                    break;
                case 'touchstart': updateMenuStatus(evt);
                    break;
            }
        }
    }
    topNavBar.addEventListener('click', handler, false);
    topNavBar.addEventListener('touchstart', handler, false);
};
