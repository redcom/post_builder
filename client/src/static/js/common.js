
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
                case 'mouseover': updateMenuStatus(evt);
                    break;
                case 'touchstart': updateMenuStatus(evt);
                    break;
            }
        }
    }
    topNavBar.addEventListener('click', handler, false);
    topNavBar.addEventListener('touchstart', handler, false);
    topNavBar.addEventListener('mouseover', handler, false);
};

var initLazyLoadImages = function initLazyLoadImages() {
    var img = document.querySelectorAll('.resort_trail img')[0];

    if (img && img.src) {
        var newImg = new Image();
        newImg.onload = function() {
            img.src = newImg.src;
        }
        newImg.src = img.src.replace(/\/mid\./, '/xlarge.').replace(/\/mi\./, '/xl.');
    }
};
