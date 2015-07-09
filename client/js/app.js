API_URL = window.location.href + 'rest/';

function ajax(method, url, async) {
    var timeout;
    return promise = new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, async || true);

        xhr.onload = function(e) {
            if (this.status === 200) {
                clearTimeout(timeout);
                results = JSON.parse(this.responseText);
                resolve(results);
            }
        };

        xhr.onerror = function(e) {
            console.log('Rejected');
            clearTimeout(timeout);
            reject(e);
        };

        xhr.send();

        timeout = setTimeout(function() {
            xhr.abort();
            reject('Error API');
        }, 2000);

    });
}

ajax('GET', API_URL + 'sites').then(function(r) {
    console.log('Results', r);
}, function(err) {
    console.log('Err', err);
});
