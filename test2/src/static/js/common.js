
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
        if(~evt.target.className.indexOf("navbar-header")) {
            evt.preventDefault();
            sidebarNav.className += " active";
        }
    }
    topNavBar.addEventListener('click', updateMenuStatus);
};
