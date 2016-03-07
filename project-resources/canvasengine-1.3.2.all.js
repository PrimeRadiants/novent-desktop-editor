var fs;
if (typeof(require) !== "undefined") {
    fs = require("fs")
}

function Kernel(b, a) {
    this.class_method = b;
    this.class_name = a
}
Kernel._extend = function(a, b, g) {
    var f;
    if (!(b instanceof Array)) {
        b = [b]
    }
    for (var e = 0; e < b.length; e++) {
        g = g === undefined ? true : g;
        f = b[e];
        if (typeof f == "string") {
            if (Class.__class_config[f]) {
                f = Class.__class_config[f].methods
            } else {
                return a
            }
        }
        if (g) {
            f = CanvasEngine.clone(f)
        }
        for (var d in f) {
            a[d] = f[d]
        }
    }
    return a
};
Kernel.prototype = {
    New: function() {
        return this["new"].apply(this, arguments)
    },
    "new": function() {
        this._class = new Class();
        Class.__class[this.class_name] = this._class;
        this._construct();
        return this._class
    },
    _construct: function() {
        this._class.extend(this.class_method)
    },
    _attr_accessor: function(d, a, f) {
        var b = this;
        for (var e = 0; e < d.length; e++) {
            this.class_method["_" + d[e]] = null;
            this.class_method[d[e]] = {};
            if (a) {
                this.class_method[d[e]].set = function(g) {
                    b.class_method["_" + d[e]] = g
                }
            }
            if (f) {
                this.class_method[d[e]].get = function() {
                    return b.class_method["_" + d[e]]
                }
            }
        }
        return this
    },
    attr_accessor: function(a) {
        return this._attr_accessor(a, true, true)
    },
    attr_reader: function(a) {
        return this._attr_accessor(a, true, false)
    },
    attr_writer: function(a) {
        return this._attr_accessor(a, false, true)
    },
    extend: function(a, b) {
        Kernel._extend(this.class_method, a, b);
        return this
    },
    addIn: function(a) {
        if (!Class.__class[a]) {
            return this
        }
        Class.__class[a][this.name] = this;
        return this
    }
};

function Class() {
    this.name = null
}
Class.__class = {};
Class.__class_config = {};
Class.get = function(a) {
    return Class.__class[a]
};
Class.create = function(e, d, h) {
    var g, b, a;
    Class.__class_config[e] = {};
    Class.__class[e] = {};
    if (h) {
        g = window[e];
        tmp_class = new Class();
        for (var f in tmp_class) {
            g[f] = tmp_class[f]
        }
        for (var f in d) {
            g[f] = d[f]
        }
        b = g
    } else {
        Class.__class_config[e].methods = d;
        var i = Class.__class_config[e].kernel = new Kernel(Class.__class_config[e].methods, e)
    }
    return i
};
Class.New = function() {
    return Class["new"].apply(this, arguments)
};
Class["new"] = function(d, e, a) {
    var b;
    if (typeof e == "boolean") {
        a = e;
        e = []
    }
    if (a == undefined) {
        a = true
    }
    e = e || [];
    if (!Class.__class_config[d]) {
        throw d + ' class does not exist. Use method "create" for build the structure of this class'
    }
    b = Class.__class_config[d].kernel["new"]();
    if (a && b.initialize) {
        b.initialize.apply(b, e)
    }
    b.__name__ = d;
    return b
};
Class.prototype = {
    extend: function(a, b) {
        return Kernel._extend(this, a, b)
    }
};
var CanvasEngine = {};
CanvasEngine.uniqid = function() {
    return Math.random()
};
CanvasEngine.arraySplice = function(b, d) {
    var a;
    for (a = 0; a < d.length; ++a) {
        if (b == d[a]) {
            d.splice(a, 1);
            return
        }
    }
};
CanvasEngine.ajax = function(a) {
    a = CanvasEngine.extend({
        url: "./",
        type: "GET",
        statusCode: {}
    }, a);
    a.data = a.data ? JSON.stringify(a.data) : null;
    if (fs) {
        fs.readFile("./" + a.url, "ascii", function(i, e) {
            if (i) {
                throw i
            }
            e = e.toString("ascii");
            if (a.dataType == "json") {
                e = CanvasEngine.parseJSON(e)
            }
            a.success(e)
        });
        return
    }
    var h;
    try {
        h = new ActiveXObject("Msxml2.XMLHTTP")
    } catch (f) {
        try {
            h = new ActiveXObject("Microsoft.XMLHTTP")
        } catch (d) {
            try {
                h = new XMLHttpRequest()
            } catch (b) {
                h = false
            }
        }
    }

    function g() {
        var e;
        if (a.success) {
            e = h.responseText;
            if (a.dataType == "json") {
                e = CanvasEngine.parseJSON(e)
            } else {
                if (a.dataType == "xml") {
                    e = h.responseXML
                }
            }
            a.success(e)
        }
    }
    h.onreadystatechange = function() {
        if (h.readyState == 4) {
            if (a.statusCode && a.statusCode[h.status]) {
                a.statusCode[h.status]()
            }
            if (h.status == 200) {
                g()
            } else {
                if (a.error) {
                    a.error(h)
                }
            }
        }
    };
    h.open(a.type, a.url, true);
    if (a.mimeType) {
        h.overrideMimeType(a.mimeType)
    }
    h.send(a.data)
};
CanvasEngine.getJSON = function(a, b, d) {
    if (typeof b == "function") {
        d = b;
        b = null
    }
    CanvasEngine.ajax({
        url: a,
        dataType: "json",
        data: b,
        success: d
    })
};
CanvasEngine.parseJSON = function(a) {
    return JSON.parse(a)
};
CanvasEngine.each = function(e, d) {
    var b, a;
    if (!(e instanceof Array) && !(typeof e == "number")) {
        for (b in e) {
            d.call(e, b, e[b])
        }
        return
    }
    if (e instanceof Array) {
        a = e.length
    } else {
        if (typeof e == "number") {
            a = e;
            e = []
        }
    }
    for (b = 0; b < a; ++b) {
        d.call(e, b, e[b])
    }
};
CanvasEngine.inArray = function(b, d) {
    var a;
    for (a = 0; a < d.length; ++a) {
        if (b == d[a]) {
            return a
        }
    }
    return -1
};
CanvasEngine.clone = function(a) {
    var d;
    if (typeof(a) != "object" || a == null) {
        return a
    }
    var b = a.constructor();
    if (b === undefined) {
        return a
    }
    for (d in a) {
        b[d] = CanvasEngine.clone(a[d])
    }
    return b
};
CanvasEngine.hexaToRGB = function(h) {
    var f, e, a;

    function d(b) {
        return (b.charAt(0) == "#") ? b.substring(1, 7) : b
    }
    f = parseInt((d(h)).substring(0, 2), 16);
    e = parseInt((d(h)).substring(2, 4), 16);
    a = parseInt((d(h)).substring(4, 6), 16);
    return [f, e, a]
};
CanvasEngine.rgbToHex = function(e, d, a) {
    return ((1 << 24) + (e << 16) + (d << 8) + a).toString(16).slice(1)
};
CanvasEngine._getRandomColorKey = function() {
    var e = Math.round(Math.random() * 255),
        d = Math.round(Math.random() * 255),
        a = Math.round(Math.random() * 255);
    return CanvasEngine.rgbToHex(e, d, a)
};
CanvasEngine.random = function(b, a) {
    return Math.floor((Math.random() * a) + b)
};
CanvasEngine.mobileUserAgent = function() {
    var a = navigator.userAgent;
    if (a.match(/(iPhone)/)) {
        return "iphone"
    } else {
        if (a.match(/(iPod)/)) {
            return "ipod"
        } else {
            if (a.match(/(iPad)/)) {
                return "ipad"
            } else {
                if (a.match(/(BlackBerry)/)) {
                    return "blackberry"
                } else {
                    if (a.match(/(Android)/)) {
                        return "android"
                    } else {
                        if (a.match(/(Windows Phone)/)) {
                            return "windows phone"
                        } else {
                            return false
                        }
                    }
                }
            }
        }
    }
};
CanvasEngine._benchmark = {};
CanvasEngine._interval_benchmark = 60;
CanvasEngine._freq_benchmark = {};
CanvasEngine.microtime = function() {
    var a = new Date().getTime() / 1000;
    var b = parseInt(a, 10);
    return a * 1000
};
CanvasEngine.benchmark = function(b) {
    var a = this.microtime();
    if (this._benchmark[b]) {
        console.log("Performance " + b + " : " + (a - this._benchmark[b]) + "ms")
    }
    this._benchmark[b] = a
};
CanvasEngine.objectSize = function(d) {
    var b = 0,
        a;
    for (a in d) {
        if (d.hasOwnProperty(a)) {
            b++
        }
    }
    return b
};
CanvasEngine.extend = function(b, a, d) {
    if (!b) {
        b = {}
    }
    if (!a) {
        a = {}
    }
    return Kernel._extend(b, a, d)
};
if (typeof exports == "undefined") {
    var _ua = navigator.userAgent.toLowerCase(),
        _version = /(chrome|firefox|msie|version)(\/| )([0-9.]+)/.exec(_ua);
    CanvasEngine.browser = {
        mozilla: /mozilla/.test(_ua) && !/webkit/.test(_ua),
        webkit: /webkit/.test(_ua),
        opera: /opera/.test(_ua),
        msie: /msie/.test(_ua),
        version: _version ? _version[3] : null,
        which: function() {
            var a;
            CanvasEngine.each(["mozilla", "webkit", "opera", "msie"], function(d, b) {
                if (CanvasEngine.browser[b]) {
                    a = b
                }
            });
            return {
                ua: a,
                version: CanvasEngine.browser.version
            }
        }
    }
}
CanvasEngine.moveArray = function(f, e, d) {
    var b, a;
    e = parseInt(e, 10);
    d = parseInt(d, 10);
    if (e !== d && 0 <= e && e <= f.length && 0 <= d && d <= f.length) {
        a = f[e];
        if (e < d) {
            for (b = e; b < d; b++) {
                f[b] = f[b + 1]
            }
        } else {
            for (b = e; b > d; b--) {
                f[b] = f[b - 1]
            }
        }
        f[d] = a
    }
    return f
};
CanvasEngine.toTimer = function(e) {
    var a = "" + Math.floor(e / 60 / 60),
        b = "" + Math.floor(e / 60 % 60),
        d = "" + Math.floor(e % 60);
    if (a.length == 1) {
        a = "0" + a
    }
    if (b.length == 1) {
        b = "0" + b
    }
    if (d.length == 1) {
        d = "0" + d
    }
    return {
        hour: a,
        min: b,
        sec: d
    }
};
CanvasEngine.algo = {
    pascalTriangle: function(a) {
        a = a || 10;
        var f = [
                [1, 1],
                [1, 2, 1]
            ],
            b = a - f.length;
        for (var e = f.length; e <= b; e++) {
            f[e] = [1];
            for (var d = 1; d <= e; d++) {
                f[e][d] = f[e - 1][d] + f[e - 1][d - 1]
            }
            f[e][e + 1] = 1
        }
        return f
    },
};
CanvasEngine.toMatrix = function(h, g, a) {
    var d = [],
        b = 0;
    for (var e = 0; e < a; e++) {
        for (var f = 0; f < g; f++) {
            if (!d[f]) {
                d[f] = []
            }
            d[f][e] = h[b];
            b++
        }
    }
    return d
};
CanvasEngine.rotateMatrix = function(g, e) {
    var a = [],
        f = [];
    e = e || "90";
    if (e == "90" || e == "-90") {
        for (var b = 0; b < g[0].length; b++) {
            a[b] = [];
            for (var d = 0; d < g.length; d++) {
                a[b][d] = g[d][b]
            }
        }
    }
    if (e == "-90") {
        var b = 0;
        for (var d = a.length - 1; d >= 0; d--) {
            f[b] = a[d];
            b++
        }
        return f
    }
    if (e == "180") {
        for (var d = 0; d < g.length; d++) {
            a[d] = g[d].reverse()
        }
    }
    return a
};
var _CanvasEngine = CanvasEngine;
if (typeof(exports) !== "undefined") {
    exports.Class = Class;
    exports.CanvasEngine = CanvasEngine
}(function() {
    var b = 0;
    var d = ["ms", "moz", "webkit", "o"];
    for (var a = 0; a < d.length && !window.requestAnimationFrame; ++a) {
        window.requestAnimationFrame = window[d[a] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[d[a] + "CancelAnimationFrame"] || window[d[a] + "CancelRequestAnimationFrame"]
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(i, f) {
            var e = new Date().getTime();
            var g = Math.max(0, 16 - (e - b));
            var h = window.setTimeout(function() {
                i(e + g)
            }, g);
            b = e + g;
            return h
        }
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(e) {
            clearTimeout(e)
        }
    }
}());
if (typeof Element != "undefined") {
    var prop, vendors = ["ms", "moz", "webkit", "o", "khtml"];
    for (var x = 0; x < vendors.length && !Element.prototype.requestFullScreen; ++x) {
        Element.prototype.requestFullScreen = Element.prototype[vendors[x] + "RequestFullScreen"];
        document.cancelFullScreen = document[vendors[x] + "CancelFullScreen"]
    }
}
Class.create("ModelClientClass", {
    create: function(b, d, a) {
        if (!(d instanceof Array)) {
            a = d;
            d = false
        }
        a.events = d;
        Class.create(b, a)
    },
    "new": function(b) {
        var a = Class["new"](b).extend({
            _methods: {},
            emit: function(f, i, k) {
                if (!i) {
                    i = []
                }
                if (typeof i == "function") {
                    k = i
                }
                if (k) {
                    this.on(f, k)
                }
                if (this[f]) {
                    if (!(i instanceof Array)) {
                        var h = [];
                        for (var g in i) {
                            h.push(i[g])
                        }
                        i = h
                    }
                    var e = this[f].apply(this, i);
                    this.call(f, e)
                }
            },
            on: function(e, f) {
                if (!this._methods[e]) {
                    this._methods[e] = {}
                }
                this._methods[e].callback = f
            },
            call: function(e, f) {
                if (this._methods[e]) {
                    this._methods[e].callback(f)
                }
            }
        });
        if (this.events) {
            for (var d in this.events) {
                obj = a[events[d]];
                if (obj) {
                    obj.on(this.events[d], function(e) {
                        if (!e) {
                            e = {}
                        }
                        obj.call(a, e)
                    })
                }
            }
        }
        return a
    }
});
var Model = Class["new"]("ModelClientClass"),
    Global_CE;
CanvasEngine.io = null;
CanvasEngine.socketIO = function() {
    if (typeof(io) == "undefined") {
        throw "Please add socket.io - http://socket.io"
    }
    return io
};
CanvasEngine.User = {
    autoAuthentication: function(g, h) {
        CanvasEngine.socketIO();
        if (typeof g != "string") {
            h = g;
            g = "canvasengine"
        }
        var d = new RegExp(g + "=({.*?})", "i"),
            a = document.cookie.match(d),
            b;
        if (a && a[1]) {
            try {
                b = JSON.parse(a[1]);
                CanvasEngine.io.emit("_autoAuthentication", {
                    session: b.session_id
                });
                CanvasEngine.io.on("_autoAuthentication", function(e) {
                    if (e.ret == "success" && h.success) {
                        h.success()
                    } else {
                        if (e.ret == "failed" && h.failed) {
                            h.failed(e.err)
                        }
                    }
                })
            } catch (f) {
                console.warn("Error session format in cookie ; ", f.stack)
            }
        }
    },
    _setCookie: function(e, f) {
        var b = f == undefined;
        e = e || "canvasengine";
        var d = new Date();
        d.setTime(d.getTime() + ((b ? -1 : 2) * 24 * 60 * 60 * 1000));
        var a = "; expires=" + d.toGMTString();
        document.cookie = e + "=" + (b ? "" : JSON.stringify(f)) + a + "; path=/"
    },
    authentication: function(e, b, d) {
        var a = this;
        CanvasEngine.socketIO();
        CanvasEngine.io.emit("_authentication", {
            username: e,
            password: b
        });
        CanvasEngine.io.on("_authentication", function(f) {
            if (f.ret == "success" && d.success) {
                a._setCookie(d.cookie_name, {
                    session_id: f.session_id
                });
                d.success()
            } else {
                if (f.ret == "failed" && d.failed) {
                    d.failed(f.err)
                }
            }
        })
    },
    register: function(d, a, b) {
        CanvasEngine.socketIO();
        CanvasEngine.io.emit("_register", {
            username: d,
            password: a,
            data: b.data
        });
        CanvasEngine.io.on("_register", function(e) {
            if (e.ret == "success" && b.success) {
                b.success()
            } else {
                if (e.ret == "failed" && b.failed) {
                    b.failed(e.err)
                }
            }
        })
    },
    logout: function(b) {
        b = b || {};
        var a = this;
        CanvasEngine.socketIO();
        CanvasEngine.io.emit("_logout");
        this._setCookie(b.cookie_name)
    },
    isLogged: function() {}
};
CanvasEngine.connectServer = function(b, a) {
    CanvasEngine.socketIO();
    CanvasEngine.io = io.connect(b + ":" + a)
};
CanvasEngine.defines = function(a, d) {
    d = d || {};
    if (d.render === undefined) {
        d.render = true
    }
    if (typeof a == "string") {
        a = [a]
    }
    var b;
    Class.create("CanvasEngineClass", {
        _noConflict: false,
        initialize: function(e) {
            this.canvas = a;
            this.el_canvas = []
        },
        ready: function(g) {
            var e = this;
            b.Sound._manager = typeof(soundManager) !== "undefined";
            if (b.Sound._manager) {
                soundManager.setup(_CanvasEngine.extend({
                    url: d.swf_sound ? d.swf_sound : "swf/",
                    onready: f
                }, d.soundmanager))
            } else {
                if (!g) {
                    f()
                } else {
                    window.onload = f
                }
            }

            function f() {
                for (var h = 0; h < e.canvas.length; h++) {
                    e.el_canvas.push(e.Canvas["new"](e.canvas[h]))
                }
                if (d.render) {
                    b.Scene._loop(e.el_canvas)
                }
                if (g) {
                    g()
                }
            }
            return this
        },
        plugins: function() {},
        mouseover: false,
        noConflict: function() {
            this._noConflict = true
        },
        Materials: {
            images: {},
            _buffer: {},
            _cache_canvas: {},
            sounds: {},
            videos: {},
            fonts: {},
            data: {},
            get: function(f, e) {
                if (e) {
                    return this[e + "s"][f]
                }
                if (_m = this.images[f] || this.sounds[f] || this.videos[f] || this.data[f]) {
                    return _m
                } else {
                    if (f instanceof Image || f instanceof HTMLCanvasElement || f instanceof HTMLVideoElement || f instanceof HTMLAudioElement) {
                        return f
                    }
                }
                if (d.ignoreLoadError) {
                    return false
                }
                throw 'Cannot to get the data "' + f + '" because it does not exist'
            },
            imageToCanvas: function(m, l) {
                l = l || {};
                if (this._cache_canvas[m] && l.cache) {
                    return this._cache_canvas[m]
                }
                var g = this.get(m),
                    i, f;
                if (!g) {
                    return
                }
                var e = l.width || g.width,
                    k = l.height || g.height,
                    i = document.createElement("canvas");
                i.width = e;
                i.height = k;
                f = i.getContext("2d");
                f.drawImage(g, 0, 0, g.width, g.height, 0, 0, e, k);
                this._cache_canvas[m] = {
                    canvas: i,
                    ctx: f
                };
                return this._cache_canvas[m]
            },
            createBuffer: function(e) {
                var g = "_opaque_" + e;
                var f = this.get(e, "video") || e instanceof HTMLVideoElement;
                if (f) {
                    return f
                }
                if (!this._buffer[g]) {
                    this._buffer[g] = this.opaqueImage(e)
                }
                return this._buffer[g]
            },
            transparentColor: function(g, o, f) {
                var e, q, t, r = this.imageToCanvas(g, {
                        cache: f
                    }),
                    h = r.canvas,
                    v = r.ctx;
                e = v.getImageData(0, 0, h.width, h.height);
                q = e.data;
                t = _CanvasEngine.hexaToRGB(o);
                for (var p = 0, k = q.length; p < k; p += 4) {
                    var l = q[p];
                    var m = q[p + 1];
                    var u = q[p + 2];
                    if (l == t[0] && m == t[1] && u == t[2]) {
                        q[p + 3] = 0
                    }
                }
                v.putImageData(e, 0, 0);
                return h
            },
            invertColor: function(n, f) {
                var m, l, k = this.imageToCanvas(n),
                    g = k.canvas,
                    e = k.ctx;
                m = e.getImageData(0, 0, g.width, g.height);
                l = m.data;
                for (var h = 0; h < l.length; h += 4) {
                    l[h] = 255 - l[h];
                    l[h + 1] = 255 - l[h + 1];
                    l[h + 2] = 255 - l[h + 2]
                }
                e.putImageData(m, 0, 0);
                return g
            },
            cropImage: function(f, o, n, p, k) {
                var e, i, m, l = this.imageToCanvas(f);
                if (!l) {
                    return
                }
                var g = l.canvas,
                    q = l.ctx;
                e = q.getImageData(o, n, p, k);
                g.width = p;
                g.height = k;
                q.putImageData(e, 0, 0);
                return g
            },
            opaqueImage: function(k) {
                var h = this.imageToCanvas(k),
                    f = h.canvas,
                    e = h.ctx;
                imageData = e.getImageData(0, 0, f.width, f.height);
                data = imageData.data;
                for (var g = 0; g < data.length; g += 4) {
                    if (data[g + 3] > 0) {
                        data[g + 3] = 255
                    }
                }
                e.putImageData(imageData, 0, 0);
                return f
            },
            getExtension: function(e) {
                return (/[.]/.exec(e)) ? /[^.]+$/.exec(e)[0] : undefined
            },
            getBasePath: function(g, e) {
                var f = g.substring(0, g.lastIndexOf("/"));
                return f != "" && e ? f + "/" : f
            },
            getFilename: function(g, e) {
                var f = g.replace(/^.*[\\\/]/, "");
                if (!e) {
                    f = f.split(".")
                } else {
                    return f
                }
                return f.slice(0, f.length - 1).join(".")
            },
            Transition: {
                _data: {},
                set: function(n, l) {
                    var m, h, e = [];
                    if (this._data[n]) {
                        return this._data[n]
                    }
                    if (!(n instanceof Array)) {
                        var k = b.Materials.imageToCanvas(n, {
                            width: 1024,
                            height: 768
                        });
                        if (typeof Uint8ClampedArray != "undefined") {
                            e = new Uint8ClampedArray(k.canvas.width * k.canvas.height)
                        }
                        m = k.ctx.getImageData(0, 0, k.canvas.width, k.canvas.height);
                        h = m.data;
                        var f = 0;
                        for (var g = 0; g < h.length; g += 4) {
                            e[f] = h[g];
                            f++
                        }
                    } else {
                        e = l
                    }
                    this._data[n] = e;
                    return e
                },
                get: function(e) {
                    return this._data[e]
                }
            },
            load: function(o, y, q, n) {
                var h = 0,
                    e, v = this,
                    u = [],
                    w;
                if (!(y instanceof Array)) {
                    y = [y]
                }
                for (var g = 0; g < y.length; g++) {
                    e = y[g];
                    if (e.id) {
                        u.push(e)
                    } else {
                        for (var t in e) {
                            w = {};
                            w = _CanvasEngine.extend({}, e[t]);
                            if (typeof e[t] == "string") {
                                w.path = e[t]
                            }
                            if (w.id) {
                                w._id = w.id
                            }
                            w.id = t;
                            u.push(w);
                            if (w.index != undefined) {
                                _CanvasEngine.moveArray(u, u.length - 1, w.index)
                            }
                        }
                    }
                }
                switch (o) {
                    case "images":
                        r();
                        break;
                    case "sounds":
                        k();
                        break;
                    case "fonts":
                        f();
                        break;
                    case "videos":
                        m();
                        break;
                    case "data":
                        l();
                        break
                }

                function r() {
                    var i;
                    if (u[h]) {
                        i = new Image();
                        i.onload = function() {
                            var p;
                            if (u[h].transparentcolor) {
                                p = v.transparentColor(i, u[h].transparentcolor)
                            }
                            if (u[h].invertcolor) {
                                p = v.invertColor(i)
                            } else {
                                p = i
                            }
                            v.images[u[h].id] = p;
                            if (u[h].transition) {
                                v.Transition.set(u[h].id)
                            }
                            if (q) {
                                q.call(v, p, u[h])
                            }
                            h++;
                            r()
                        };
                        i.onerror = function(p) {
                            if (d.ignoreLoadError) {
                                if (q) {
                                    q.call(v, p)
                                }
                                h++;
                                r()
                            }
                        };
                        i.src = u[h].path
                    } else {
                        if (n) {
                            n.call(v)
                        }
                    }
                }

                function k() {
                    var C;

                    function D() {
                        if (q) {
                            q.call(v, this, u[h])
                        }
                        h++;
                        k()
                    }
                    if (u[h]) {
                        if (v.sounds[u[h].id]) {
                            D()
                        } else {
                            if (b.Sound._manager) {
                                v.sounds[u[h].id] = soundManager.createSound({
                                    id: u[h].id,
                                    url: u[h].path,
                                    autoLoad: true,
                                    autoPlay: false,
                                    onload: D,
                                    onfinish: function() {
                                        if (this._loop) {
                                            this.play()
                                        }
                                    }
                                })
                            } else {
                                var B = new Audio(),
                                    p = u[h].path,
                                    z = v.getBasePath(p),
                                    i = v.getFilename(p),
                                    A = v.getExtension(p);
                                var F = {
                                    mp3: B.canPlayType("audio/mpeg"),
                                    ogg: B.canPlayType('audio/ogg; codecs="vorbis"'),
                                    m4a: B.canPlayType('audio/mp4; codecs="mp4a.40.2"')
                                };
                                if (!F[A]) {
                                    for (var E in F) {
                                        if (A == E) {
                                            continue
                                        }
                                        if (F[E]) {
                                            p = z + "/" + i + "." + E;
                                            break
                                        }
                                    }
                                }
                                B.setAttribute("src", p);
                                B.addEventListener("canplaythrough", function() {
                                    v.sounds[u[h].id] = this;
                                    D()
                                }, false);
                                B.addEventListener("ended", function() {
                                    if (!this._loop) {
                                        return
                                    }
                                    this.currentTime = 0;
                                    this.play()
                                }, false);
                                B.addEventListener("error", function(G) {
                                    if (d.ignoreLoadError) {
                                        D()
                                    }
                                }, false);
                                B.load();
                                B.pause();
                                document.body.appendChild(B);
                                if (/^i/.test(_CanvasEngine.mobileUserAgent())) {
                                    v.sounds[u[h].id] = B;
                                    D()
                                }
                            }
                        }
                    } else {
                        if (n) {
                            n.call(v)
                        }
                    }
                }

                function f() {
                    var i = u[h];
                    if (i) {
                        if (i.id == "google" || i.id == "ascender" || i.id == "typekit" || i.id == "monotype" || i.id == "fontdeck") {
                            var B = {};
                            B[i.id] = i;
                            if (i._id) {
                                B[i.id].id = i._id
                            }
                            if (typeof WebFontConfig == "undefined") {
                                WebFontConfig = {}
                            }
                            WebFontConfig = _CanvasEngine.extend(WebFontConfig, B)
                        } else {
                            var z = document.createElement("style");
                            var A = v.getBasePath(i.path, true) + v.getFilename(i.path) + "." + (_CanvasEngine.browser.msie ? "eot" : "ttf");
                            z.innerHTML = "@font-face { font-family: '" + i.id + "'; src: url('" + A + "'); font-weight: normal; font-style: normal;}";
                            document.getElementsByTagName("head")[0].appendChild(z)
                        }
                        h++;
                        if (q) {
                            q.call(v, this, u[h])
                        }
                        f()
                    } else {
                        if (!document.getElementById("google-webfont")) {
                            var p = document.createElement("script");
                            p.src = ("https:" == document.location.protocol ? "https" : "http") + "://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";
                            p.type = "text/javascript";
                            p.async = "true";
                            p.id = "google-webfont";
                            var z = document.getElementsByTagName("script")[0];
                            z.parentNode.insertBefore(p, z)
                        }
                        if (n) {
                            n.call(v)
                        }
                    }
                }

                function m() {
                    function A() {
                        if (q) {
                            q.call(v, this, u[h])
                        }
                        h++;
                        m()
                    }
                    if (u[h]) {
                        var z = document.createElement("video");
                        if (u[h].webcam) {
                            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                            function i(B) {
                                window.stream = B;
                                if (window.URL) {
                                    z.src = window.URL.createObjectURL(B)
                                } else {
                                    z.src = B
                                }
                                v.videos[u[h].id] = z;
                                A()
                            }

                            function p(B) {
                                throw "navigator.getUserMedia error: " + B
                            }
                            navigator.getUserMedia(u[h].webcam, i, p)
                        } else {
                            z.src = u[h].path;
                            z.addEventListener("loadeddata", function(B) {
                                z.width = (B.srcElement || B.target).videoWidth;
                                z.height = (B.srcElement || B.target).videoHeight;
                                v.videos[u[h].id] = z;
                                A()
                            }, false);
                            z.onerror = function(B) {
                                if (d.ignoreLoadError) {
                                    A()
                                } else {
                                    throw "Video error #" + B.target.error.code + ": See http://dev.w3.org/html5/spec-author-view/video.html#dom-mediaerror-media_err_aborted"
                                }
                            };
                            z.load()
                        }
                        document.body.appendChild(z);
                        z.setAttribute("style", "display:none;")
                    } else {
                        if (n) {
                            n.call(v)
                        }
                    }
                }

                function l() {
                    function i() {
                        if (q) {
                            q.call(v, this, u[h])
                        }
                        h++;
                        l()
                    }
                    if (u[h]) {
                        _CanvasEngine.ajax({
                            url: u[h].path,
                            dataType: "json",
                            success: function(p) {
                                v.data[u[h].id] = p;
                                i()
                            },
                            error: function() {
                                if (d.ignoreLoadError) {
                                    i()
                                }
                            }
                        })
                    } else {
                        if (n) {
                            n.call(v)
                        }
                    }
                }
            }
        },
        Sound: {
            _fade: {},
            _manager: false,
            get: function(f) {
                var e = b.Materials.get(f, "sound");
                return e
            },
            allStop: function(g) {
                g = g || "";
                var e = b.Materials.sounds;
                for (var f in e) {
                    if (f != g) {
                        this.stop(f)
                    }
                }
                return this
            },
            stop: function(f) {
                var e = this.get(f);
                if (d.soundmanager) {
                    e.stop()
                } else {
                    e.currentTime = 0;
                    e.pause()
                }
                e._loop = false;
                return this
            },
            play: function(e) {
                this.get(e).play();
                return this
            },
            playOnly: function(e) {
                this.allStop(e);
                this.get(e).play();
                return this
            },
            playLoop: function(f) {
                var e = this.get(f);
                e._loop = true;
                e.play();
                return this
            },
            fadeIn: function(g, e, f) {
                this.fadeTo(g, e, 1, f)
            },
            fadeOut: function(g, e, f) {
                this.fadeTo(g, e, 0, f)
            },
            fadeTo: function(k, g, i, h) {
                var f = this.get(k),
                    e = this._manager ? f.volume / 100 : f.volume;
                this._fade[k] = {
                    sound: f,
                    init: e,
                    c_volume: e,
                    f_time: g,
                    to: i,
                    callback: h
                }
            },
            _loop: function() {
                var g, f;
                for (var e in this._fade) {
                    g = this._fade[e];
                    f = false;
                    if (g) {
                        if (g.init < g.to) {
                            if (g.c_volume >= g.to) {
                                g.c_volume = g.to;
                                f = true
                            } else {
                                g.c_volume += (Math.abs(g.to - g.init) / g.f_time)
                            }
                            if (g.c_volume > 0.999) {
                                g.c_volume = 1
                            }
                        } else {
                            if (g.c_volume <= g.to) {
                                g.c_volume = g.to;
                                f = true
                            } else {
                                g.c_volume -= (Math.abs(g.to - g.init) / g.f_time)
                            }
                            if (g.c_volume < 0.001) {
                                g.c_volume = 0
                            }
                        }
                        if (this._manager) {
                            g.sound.setVolume(g.c_volume * 100)
                        } else {
                            g.sound.volume = g.c_volume
                        }
                        if (f) {
                            if (g.callback) {
                                g.callback.call(g.sound)
                            }
                            delete this._fade[e];
                            break
                        }
                    }
                }
            }
        },
        Canvas: {
            "new": function(e) {
                return Class["new"]("Canvas", [e])
            }
        },
        Element: {
            "new": function(h, f, g, e) {
                return Class["new"]("Element", [h, f, g, e])
            }
        },
        Context: {
            "new": function(e) {
                return Class["new"]("Context", [e])
            }
        },
        Scene: {
            _scenes: {},
            _cacheScene: {},
            _scenesEnabled: {},
            _scenesIndex: [],
            _scenesNbCall: {},
            _current: null,
            New: function() {
                return this["new"].apply(this, arguments)
            },
            "new": function(f) {
                var e;
                if (typeof f == "string") {
                    if (!this._cacheScene[f]) {
                        throw "Please initialize '" + f + "' scene with an object before"
                    }
                    f = this._cacheScene[f]
                } else {
                    this._cacheScene[f.name] = f
                }
                e = Class["new"]("Scene", [f]).extend(f, false);
                this._scenesNbCall[f.name] = 0;
                this._scenes[f.name] = e;
                return e
            },
            call: function(g, h) {
                if (this._scenesNbCall[g] > 0) {
                    this.New(g)
                }
                var e = this._scenes[g],
                    f = [g];
                h = h || {};
                if (e) {
                    this._scenesEnabled[g] = e;
                    if (this._scenesIndex.indexOf(g) == -1) {
                        if (h.transition) {
                            this._scenesIndex = f.concat(this._scenesIndex)
                        } else {
                            this._scenesIndex.push(g)
                        }
                    }
                    if (h.exitScenes) {
                        h.exitScenes.allExcept = h.exitScenes.allExcept || [];
                        h.exitScenes.allExcept = f.concat(h.exitScenes.allExcept);
                        e._load.call(e, h.exitScenes, h.params)
                    } else {
                        if (!h.overlay && !h.transition) {
                            this.exitAll(f)
                        }
                        e._load.call(e, h, h.params)
                    }
                    this._scenesNbCall[g]++
                } else {
                    throw 'Scene "' + g + "\" doesn't exist"
                }
                return e
            },
            exit: function(f) {
                var e = this._scenesEnabled[f],
                    h = e.getCanvas();
                if (e) {
                    if (h._layerDOM) {
                        h._layerDOM.innerHTML = ""
                    }
                    e._exit.call(e);
                    for (var g = 0; g < this._scenesIndex.length; g++) {
                        if (this._scenesIndex[g] == f) {
                            this._scenesIndex.splice(g, 1);
                            break
                        }
                    }
                    delete this._scenesEnabled[f]
                }
            },
            isEnabled: function(e) {
                return this._scenesEnabled[e] ? true : false
            },
            exitAll: function(f) {
                var e;
                if (!(f instanceof Array)) {
                    f = [f]
                }
                for (e in this._scenesEnabled) {
                    if (_CanvasEngine.inArray(e, f)) {
                        this.exit(e)
                    }
                }
            },
            exist: function(e) {
                return this._scenes[e] ? true : false
            },
            get: function(e) {
                return this._scenes[e]
            },
            getEnabled: function() {
                return this._scenesEnabled
            },
            _loop: function(h) {
                var f = this,
                    g, i;
                this.fps = 0;
                var l = new Date().getTime(),
                    k;

                function e() {
                    var n, m = 0;
                    k = (new Date().getTime() - l) / 1000;
                    l = new Date().getTime();
                    f.fps = 1 / k;
                    b.Sound._loop();
                    h[m].clear();
                    h[m]._ctxMouseEvent.clearRect(0, 0, h[m].width, h[m].height);
                    for (g = 0; g < f._scenesIndex.length; g++) {
                        i = f._scenesEnabled[f._scenesIndex[g]];
                        if (i) {
                            i._loop()
                        }
                    }
                    requestAnimationFrame(e)
                }
                requestAnimationFrame(e)
            },
            getFPS: function() {
                return ~~this.fps
            },
            getPerformance: function() {
                return ~~(this.getFPS() / 60 * 100)
            }
        }
    });
    Class.create("Canvas", {
        id: null,
        element: null,
        stage: null,
        ctx: null,
        _globalElements: {},
        _ctxTmp: null,
        _layerDOM: null,
        _layerParent: null,
        _ctxMouseEvent: null,
        _canvasMouseEvent: null,
        width: 0,
        height: 0,
        mouseEvent: true,
        initialize: function(f) {
            var v = this,
                r, m;
            this.id = f;
            var g = this._getElementById(f);
            if (g.tagName != "CANVAS" && g.tagName != "canvas") {
                this.element = document.createElement("canvas");
                this._layerDOM = document.createElement("div");
                r = this.element.width = g.getAttribute("width");
                m = this.element.height = g.getAttribute("height");
                this.element.style.position = "absolute";
                g.style.position = this._layerDOM.style.position = "relative";
                g.style.width = r + "px";
                g.style.height = m + "px";
                g.style.overflow = this._layerDOM.style.overflow = "hidden";
                this._layerDOM.style.width = this._layerDOM.style.height = "100%";
                g.appendChild(this.element);
                g.appendChild(this._layerDOM);
                this._layerParent = g
            } else {
                this.element = g
            }
            this.width = this.element.width;
            this.height = this.element.height;
            this.ctx = this.element.getContext("2d");
            this.hammerExist = typeof(Hammer) !== "undefined";
            this._mouseEvent();
            var u = ["click", "dbclick", "mousemove", "mousedown", "mouseup"],
                q = ["dragstart", "drag", "dragend", "dragup", "dragdown", "dragleft", "dragright", "swipe", "swipeup", "swipedown", "swipeleft", "swiperight", "rotate", "pinch", "pinchin", "pinchout", "tap", "doubletap", "hold", "transformstart", "transform", "transformend", "release", "touch", "release"];
            var p = this._layerParent || this.element;
            var n = null,
                k;
            if (this.hammerExist) {
                n = new Hammer(p)
            }

            function o(h) {
                p.addEventListener(h, function(i) {
                    t(i, h)
                }, false)
            }

            function e(h) {
                n.on(h, function(i) {
                    t(i, h)
                })
            }

            function t(C, A) {
                var B, y, h = b.Scene.getEnabled(),
                    w;
                if (C.gesture) {
                    B = C.gesture.touches
                } else {
                    B = [v.getMousePosition(C)]
                }
                for (var i in h) {
                    w = h[i].getStage();
                    for (var z = 0; z < B.length; z++) {
                        k = B[z];
                        if (k.pageX !== undefined) {
                            k = v.getMousePosition(k)
                        }
                        if (A == "mousemove") {
                            if (v.mouseEvent) {
                                w._mousemove(C, k)
                            } else {
                                continue
                            }
                        }
                        w.trigger(A, [C, k]);
                        w._select(k, function(D) {
                            D.trigger(A, [C, k])
                        })
                    }
                }
            }
            if (n) {
                for (var l = 0; l < q.length; l++) {
                    e.call(this, q[l])
                }
            }
            for (var l = 0; l < u.length; l++) {
                o.call(this, u[l])
            }
            if (!d.contextmenu) {
                p.addEventListener("contextmenu", function(h) {
                    h.preventDefault()
                })
            }
        },
        _elementsByScene: function(e, f, g) {
            if (!this._globalElements[e]) {
                this._globalElements[e] = {}
            }
            if (!g) {
                if (f) {
                    return this._globalElements[e][f]
                }
                return this._globalElements[e]
            }
            this._globalElements[e][f] = g
        },
        _getElementById: function(f) {
            var e;
            if (d.cocoonjs) {
                e = document.createElement("canvas");
                e.width = d.cocoonjs.width;
                e.height = d.cocoonjs.height;
                e.id = f;
                document.body.appendChild(e)
            } else {
                e = document.getElementById(f)
            }
            return e
        },
        _mouseEvent: function() {
            this._canvasMouseEvent = document.createElement("canvas");
            this._canvasMouseEvent.width = this.width;
            this._canvasMouseEvent.height = this.height;
            this._ctxMouseEvent = this._canvasMouseEvent.getContext("2d")
        },
        canvasReady: function() {},
        getMousePosition: function(l) {
            var k = this.element;
            var i = 0;
            var h = 0;
            while (k && k.tagName != "BODY") {
                i += k.offsetTop;
                h += k.offsetLeft;
                k = k.offsetParent
            }
            if (l.clientX == undefined) {
                l.clientX = l.pageX
            }
            if (l.clientY == undefined) {
                l.clientY = l.pageY
            }
            if (!window.pageXOffset) {
                window.pageXOffset = 0
            }
            if (!window.pageYOffset) {
                window.pageYOffset = 0
            }
            var g = l.clientX - h + window.pageXOffset;
            var f = l.clientY - i + window.pageYOffset;
            return {
                x: g,
                y: f
            }
        },
        measureText: function(f, e, g) {
            var i;
            if (/[ ]+/.test(e)) {
                var h = e.split(" ");
                e = h[0];
                g = h[1]
            }
            g = g || "Arial";
            e = e || "12px";
            this.ctx.font = "normal " + e + " " + g;
            i = this.ctx.measureText(f);
            this.ctx.font = null;
            return {
                width: i.width,
                height: this._measureTextHeight(f, e, g)
            }
        },
        _measureTextHeight: function(h, f, k) {
            var n = this.ctx;
            n.save();
            n.translate(0, Math.round(this.height * 0.8));
            n.font = "normal " + f + " " + k;
            n.fillText(h, 0, 0);
            n.restore();
            var g = n.getImageData(0, 0, this.width, this.height).data,
                i = false,
                m = false,
                e = this.height,
                l = 0;
            while (!m && e) {
                e--;
                for (l = 0; l < this.width; l++) {
                    if (g[e * this.width * 4 + l * 4 + 3]) {
                        m = e;
                        break
                    }
                }
            }
            while (e) {
                e--;
                for (l = 0; l < this.width; l++) {
                    if (g[e * this.width * 4 + l * 4 + 3]) {
                        i = e;
                        break
                    }
                }
                if (i != e) {
                    return m - i
                }
            }
            return 0
        },
        createPattern: function(f, e) {
            e = e || "repeat";
            var g = b.Materials.get(f);
            if (!g) {
                return
            }
            return this.ctx.createPattern(g, e)
        },
        createLinearGradient: function(f, h, e, g) {
            return this.ctx.createLinearGradient(f, h, e, g)
        },
        createRadialGradient: function(h, k, g, f, i, e) {
            return this.ctx.createRadialGradient(h, k, g, f, i, e)
        },
        addColorStop: function(f, e) {
            return this.ctx.addColorStop(f, e)
        },
        getImageData: function(e, i, f, g) {
            if (!e) {
                e = 0;
                i = 0
            }
            if (!f) {
                f = this.width;
                g = this.height
            }
            return this.ctx.getImageData(e, i, f, g)
        },
        putImageData: function(h, g, l, f, k, e, i) {
            if (!g) {
                g = 0;
                l = 0
            }
            return this.ctx.putImageData(h, g, l, f, k, e, i)
        },
        createImageData: function() {
            return this.ctx.createImageData.apply(this.ctx, arguments)
        },
        toDataURL: function() {
            return this.ctx.toDataURL()
        },
        clear: function() {
            return this.ctx.clearRect(0, 0, this.width, this.height)
        },
        cursor: function(e) {
            this.element.style.cursor = e
        },
        isFullscreen: function() {
            return document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen
        },
        setSize: function(e, m, g) {
            var i, n = this,
                l = this.element.width,
                h = this.element.height,
                k = e;
            if (e == "reset") {
                e = this.width = this._oldSize.width;
                m = this.height = this._oldSize.height;
                this._canvasMouseEvent.style.width = this._canvasMouseEvent.style.height = this.element.style.width = this.element.style.height = null;
                if (this._oldSize.type == "browser") {
                    this.element.style.position = this.element.style.top = this.element.style.left = null
                } else {
                    if (this._oldSize.type == "fullscreen") {
                        document.cancelFullScreen()
                    }
                }
            } else {
                if (e == "fullscreen") {
                    g = m;
                    e = screen.width;
                    m = screen.height;
                    if (this.element.requestFullScreen) {
                        this.element.requestFullScreen()
                    } else {
                        e = k = "browser"
                    }
                }
            }
            if (e == "browser") {
                g = m;
                e = window.innerWidth;
                m = window.innerHeight;
                var f = this.element;
                if (this._layerParent) {
                    f = this._layerParent
                }
                f.style.position = "fixed";
                f.style.top = f.style.left = "50%";
                window.onresize = function(o) {
                    if (k == "browser") {
                        n.setSize("browser", g)
                    }
                }
            }
            if (g == "fit") {
				var screenRatio = m/e;
				var canvasRatio = h/l;
                
				
				if(screenRatio <= canvasRatio) {
					e = m / canvasRatio;
				} else {
					m = e * canvasRatio;
				}
				
				this._canvasMouseEvent.style.width = this.element.style.width = e + "px";
				this._canvasMouseEvent.style.height = this.element.style.height = m + "px";
            } else {
                if (g == "stretch") {
                    this._canvasMouseEvent.style.width = this.element.style.width = e + "px";
                    this._canvasMouseEvent.style.height = this.element.style.height = m + "px"
                } else {
                    this._canvasMouseEvent.width = this.width = this.element.width = e;
                    this._canvasMouseEvent.height = this.height = this.element.height = m
                }
            }
            if (k == "browser") {
                f.style.margin = (-m / 2) + "px 0 0 " + (-e / 2) + "px"
            }
            if (this._layerParent) {
                this._layerParent.style.width = e + "px";
                this._layerParent.style.height = m + "px"
            }
            this._oldSize = {
                width: l,
                height: h,
                type: k
            };
            return this
        }
    });
    Class.create("Scene", {
        id: 0,
        _stage: {},
        _events: [],
        _pause: false,
        _isReady: false,
        _index: 0,
        model: null,
        initialize: function(g) {
            var f, e = this;
            this.id = _CanvasEngine.uniqid();
            this._events = g.events
        },
        _loop: function() {
            if (this._pause) {
                this._stage.refresh()
            } else {
                if (this._isReady && this.render) {
                    this.render.call(this, this._stage)
                } else {
                    this._stage.refresh()
                }
            }
        },
        emit: function(e, f) {
            this.model.call(e, f)
        },
        getElement: function(e) {
            if (this._global_elements[e]) {
                return this._global_elements[e]
            }
            return this.createElement(e)
        },
        pause: function(e) {
            if (e === undefined) {
                return this._pause
            }
            this._pause = e;
            return this
        },
        togglePause: function() {
            return this.pause(!this._pause)
        },
        getStage: function() {
            return this._stage
        },
        getCanvas: function(e) {
            if (!e) {
                e = 0
            }
            return b.el_canvas[e]
        },
        zIndex: function(f) {
            var e;
            if (f === undefined) {
                return this._index
            }
            if (f instanceof Class) {
                f = f.zIndex()
            }
            e = b.Scene._scenesIndex.length;
            if (Math.abs(f) >= e) {
                f = -1
            }
            if (f < 0) {
                f = e + f
            }
            _CanvasEngine.moveArray(b.Scene._scenesIndex, this._index, f);
            this._index = f;
            return this
        },
        createElement: function(f, k, e) {
            if (f instanceof Array) {
                var l = {};
                for (var g = 0; g < f.length; g++) {
                    l[f[g]] = this.createElement(f[g])
                }
                return l
            }
            if (typeof f != "string") {
                e = k;
                k = f
            }
            var h = b.Element["new"](this, null, k, e);
            h.name = f;
            return h
        },
        _exit: function() {
            this.getCanvas()._elementsByScene[this.name] = {};
            if (this.exit) {
                this.exit.call(this)
            }
        },
        loadEvents: function() {
            var e = this;
            if (_CanvasEngine.io && this._events) {
                _CanvasEngine.each(this._events, function(f, g) {
                    _CanvasEngine.io.on(e.name + "." + g, function(h) {
                        if (e[g] && b.Scene.isEnabled(e.name)) {
                            e[g].call(e, h)
                        }
                    })
                })
            }
        },
        _load: function(h, v) {
            var u = this;
            h = h || {};
            v = v || {};
            this._stage = b.Element["new"](this);
            this._stage._dom = this.getCanvas()._layerDOM;
            this._stage._name = "__stage__";
            this._index = b.Scene._scenesIndex.length - 1;
            for (var k = 0; k < b.el_canvas.length; k++) {
                b.el_canvas[k].stage = this._stage
            }
            if (this.model) {
                if (this._events) {
                    CE.each(this._events, function(w, y) {
                        u.model.on(y, function(i) {
                            u[y].call(u, i)
                        })
                    })
                }
            }
            this.loadEvents();
            if (this.called) {
                this.called(this._stage)
            }
            var n = o("images"),
                e = o("sounds"),
                g = o("fonts"),
                l = o("videos"),
                f = o("data"),
                r = n + e + g + l + f,
                m = 0;
            if (n > 0) {
                p("images")
            }
            if (e > 0) {
                p("sounds")
            }
            if (g > 0) {
                p("fonts")
            }
            if (l > 0) {
                p("videos")
            }
            if (f > 0) {
                p("data")
            }
            if (n == 0 && e == 0 && g == 0 && l == 0 && f == 0) {
                t()
            }

            function p(i) {
                b.Materials.load(i, u.materials[i], function(y, w) {
                    q(y, w, i)
                })
            }

            function q(y, w, i) {
                m++;
                if (u.preload) {
                    u.preload(u._stage, m / r * 100, {
                        material: y,
                        type: i,
                        index: m,
                        data: w
                    })
                }
                if (r == m) {
                    t()
                }
            }

            function o(z) {
                var y = 0;
                if (!u.materials) {
                    return 0
                }
                if (u.materials[z]) {
                    for (var w in u.materials[z]) {
                        y++
                    }
                }
                return y
            }

            function t() {
                if (h.when == "afterPreload") {
                    b.Scene.exitAll(h.allExcept)
                }
                if (u.ready) {
                    u.ready(u._stage, v)
                }
                u._stage.trigger("canvas:readyEnd");
                if (u.model && u.model.ready) {
                    u.model.ready.call(u.model)
                }
                u._isReady = true;
                if (h.transition) {
                    if (h.transition === true) {
                        h.transition = {
                            type: "fade"
                        }
                    }
                    u.execTransition(h.transition.type, h.transition, h.overlay)
                }
            }
        },
        execTransition: function(p, l, h) {
            var r = this,
                o;
            l = l || {};
            l = _CanvasEngine.extend({
                frames: 30
            }, l);
            var f = b.Scene.getEnabled(),
                m = 0,
                n;
            for (var t in f) {
                if (f[t].id == this.id) {
                    continue
                }
                n = f[t].getStage();
                o = f[t].getCanvas();
                switch (p) {
                    case "fade":
                        if (!b.Timeline) {
                            throw "Add the Timeline class for transitions"
                        }
                        b.Timeline.New(n).to({
                            opacity: 0
                        }, l.frames).call(function() {
                            if (!h) {
                                b.Scene.exitAll(r.name)
                            }
                            if (l.finish) {
                                l.finish.call(r)
                            }
                            f[t].zIndex(0)
                        });
                        break;
                    case "image":
                        var o = n.buffer(o.width, o.height),
                            q = o.getContext("2d");
                        var i = 0;
                        var g = new Worker("workers/transition.js");
                        g.addEventListener("message", function(k) {
                            if (i == 0) {
                                n.empty()
                            }
                            q.putImageData(k.data.imageData, 0, 0);
                            n.drawImage(o);
                            i++;
                            if (k.data.finish) {
                                g.terminate();
                                if (l.finish) {
                                    l.finish.call(r)
                                }
                                if (!h) {
                                    b.Scene.exitAll(r.name)
                                }
                            }
                        });
                        var e = q.getImageData(0, 0, o.width, o.height);
                        g.postMessage({
                            imgData: e,
                            pattern: b.Materials.Transition.get(l.id)
                        });
                        n.on("canvas:refresh", function(k) {
                            g.postMessage("")
                        });
                        m++;
                        break
                }
            }
        }
    });
    Class.create("Context", {
        _cmd: {},
        _graphicCmd: [],
        _graphicPointer: 0,
        img: {},
        _useClip: false,
        globalAlpha: 1,
        _PROPS: ["shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY", "globalAlpha", "globalCompositeOperation", "lineJoin", "lineCap", "lineWidth", "miterLimit", "fillStyle", "font", "textBaseline", "textAlign", "strokeStyle"],
        multiple: false,
        alpha: function(e) {},
        _setMethod: function(f, g) {
            var e = this;
            this[f] = function() {
                var h = g == "cmd" ? "_addCmd" : "draw";
                e[h](f, arguments)
            }
        },
        _defaultRectParams: function(e, m, f, i, l, k) {
            var g = arguments[arguments.length - 1];
            arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
            if (typeof arguments[0] == "string") {
                this[g] = e;
                e = m;
                m = f;
                f = i;
                i = l;
                l = k
            }
            if (arguments[0] == undefined) {
                e = 0;
                m = 0
            }
            if (arguments[3] == undefined) {
                f = this.width;
                i = this.height
            }
            return [e, m, f, i, l]
        },
        fillRect: function(e, l, f, i, k) {
            var g = Array.prototype.slice.call(arguments, 0);
            g = this._defaultRectParams.apply(this, g.concat("fillStyle"));
            if (typeof e != "string" && k !== undefined) {
                this._roundRect.apply(this, g.concat("fill"));
                return
            }
            this._addCmd("fillRect", g, ["fillStyle"]);
            return this
        },
        strokeRect: function(e, l, f, i, k) {
            var g = Array.prototype.slice.call(arguments, 0);
            g = this._defaultRectParams.apply(this, g.concat("strokeStyle"));
            if (typeof e != "string" && k !== undefined) {
                this._roundRect.apply(this, g.concat("stroke"));
                return this
            }
            this._addCmd("strokeRect", g, ["strokeStyle"]);
            return this
        },
        fillCircle: function(e, g, f) {
            this._circle(e, g, f, "fill");
            return this
        },
        strokeCircle: function(e, g, f) {
            this._circle(e, g, f, "stroke");
            return this
        },
        _circle: function(e, h, g, f) {
            if (h === undefined) {
                g = e
            }
            e = e || 0;
            h = h || 0;
            g = g || this.width / 2;
            if (isNaN(g)) {
                console.warn(f + "Circle() : Impossible to define the radius of the circle. Give a width to the element")
            }
            if (!this.strokeStyle) {
                this.strokeStyle = "black"
            }
            this.beginPath();
            this.arc(e, h, g, 0, 2 * Math.PI, false);
            this[f]()
        },
        _roundRect: function(e, l, f, i, k, g) {
            if (f < 2 * k) {
                k = f / 2
            }
            if (i < 2 * k) {
                k = i / 2
            }
            this.beginPath();
            this.moveTo(e + k, l);
            this.arcTo(e + f, l, e + f, l + i, k);
            this.arcTo(e + f, l + i, e, l + i, k);
            this.arcTo(e, l + i, e, l, k);
            this.arcTo(e, l, e + f, l, k);
            this.closePath();
            this[g]()
        },
        fill: function() {
            this._addCmd("fill", [], ["fillStyle"]);
            return this
        },
        fillText: function(g, e, h) {
            if (e == "middle" && this.width && this.height) {
                var f = this.scene.getCanvas().measureText(g, this.font).width;
                this.textBaseline = "middle";
                e = this.width / 2 - f / 2;
                h = this.height / 2
            }
            if (!e) {
                e = 0
            }
            if (!h) {
                h = 0
            }
            this._addCmd("fillText", [g, e, h], ["fillStyle", "font", "textBaseline", "textAlign"]);
            return this
        },
        strokeText: function(f, e, g) {
            this._addCmd("strokeText", [f, e, g], ["strokeStyle", "font", "textBaseline", "textAlign"]);
            return this
        },
        stroke: function() {
            this._addCmd("stroke", [], ["strokeStyle"]);
            return this
        },
        drawImage: function(i, p, o, q, k, t, r, e, n) {
            var l, f, h, m = i;
            if (!p) {
                p = 0
            }
            if (!o) {
                o = 0
            }
            if (typeof i === "string") {
                m = b.Materials.get(i);
                if (!m) {
                    return
                }
                this.img.width = m.width;
                this.img.height = m.height
            }
            if (/%$/.test(q)) {
                t = p;
                r = o;
                p = 0;
                o = 0;
                q = m.width * parseInt(q) / 100;
                k = m.height;
                e = q;
                n = k
            }
            var g = new RegExp("^" + window.location.origin, "g");
            if (!g.test(m.src)) {
                h = m
            } else {
                h = b.Materials.createBuffer(i)
            }
            if (q !== undefined) {
                if (t === undefined) {
                    l = [m, p, o, q, k];
                    f = [h, p, o, q, k]
                } else {
                    l = [m, p, o, q, k, t, r, e, n];
                    f = [h, p, o, q, k, t, r, e, n]
                }
                this._buffer_img = {
                    params: f,
                    x: t,
                    y: r,
                    width: e,
                    height: n
                }
            } else {
                l = [m, p, o];
                f = [h, p, o];
                this._buffer_img = {
                    params: f,
                    x: p,
                    y: o,
                    width: m.width,
                    height: m.height
                }
            }
            this._addCmd("drawImage", l);
            return this
        },
        moveTo: function() {
            this._addCmd.call(this, "moveTo", arguments, true);
            return this
        },
        lineTo: function() {
            this._addCmd.call(this, "lineTo", arguments, true);
            return this
        },
        quadraticCurveTo: function() {
            this._addCmd.call(this, "quadraticCurveTo", arguments, true);
            return this
        },
        bezierCurveTo: function() {
            this._addCmd.call(this, "bezierCurveTo", arguments, true);
            return this
        },
        beginPath: function() {
            this.multiple = true;
            this._graphicCmd.push([]);
            this._addCmd.call(this, "beginPath", arguments);
            return this
        },
        closePath: function() {
            this._addCmd.call(this, "closePath", arguments, true);
            return this
        },
        clip: function() {
            this._useClip = true;
            this._addCmd.call(this, "clip", arguments);
            return this
        },
        rect: function() {
            var e = Array.prototype.slice.call(arguments, 0);
            e = this._defaultRectParams.apply(this, e.concat("fillStyle"));
            this._addCmd("rect", e);
            return this
        },
        arc: function() {
            this._addCmd.call(this, "arc", arguments, true);
            return this
        },
        arcTo: function() {
            this._addCmd.call(this, "arcTo", arguments, true);
            return this
        },
        addColorStop: function() {
            this._addCmd.call(this, "addColorStop", arguments, true);
            return this
        },
        isPointInPath: function() {
            this._addCmd.call(this, "isPointInPath", arguments, true);
            return this
        },
        rotate: function() {
            this.draw.call(this, "rotate", arguments);
            return this
        },
        translate: function() {
            this.draw.call(this, "translate", arguments);
            return this
        },
        transform: function() {
            this.draw.call(this, "transform", arguments);
            return this
        },
        setTransform: function() {
            this.draw.call(this, "setTransform", arguments);
            return this
        },
        resetTransform: function() {
            this.draw.call(this, "resetTransform", arguments);
            return this
        },
        clearRect: function() {
            this.draw.call(this, "clearRect", arguments);
            return this
        },
        scale: function() {
            this.draw.call(this, "scale", arguments);
            return this
        },
        rotateDeg: function(e) {
            this.rotate(e * Math.PI / 180)
        },
        save: function(e) {
            if (e) {
                this._addCmd("save")
            } else {
                this.draw("save")
            }
        },
        restore: function(e) {
            if (e) {
                this._addCmd("restore")
            } else {
                this.draw("restore")
            }
        },
        clearPropreties: function() {
            var f = this._PROPS;
            for (var e = 0; e < f.length; e++) {
                if (this[f[e]]) {
                    this[f[e]] = undefined
                }
            }
        },
        _bufferEvent: function(f, e) {
            var g = this._canvas[0]["_ctxMouseEvent"];
            if (this.hasEvent() || this._useClip) {
                if (f == "drawImage" && !this._forceEvent) {
                    g[f].apply(this._canvas[0]["_ctxMouseEvent"], this._buffer_img.params);
                    g.globalCompositeOperation = "source-atop";
                    g.fillStyle = "#" + this.color_key;
                    g.fillRect(this._buffer_img.x, this._buffer_img.y, this._buffer_img.width, this._buffer_img.height)
                } else {
                    g[f].apply(this._canvas[0]["_ctxMouseEvent"], e)
                }
            }
        },
        draw: function(z, u, w) {
            this._graphicPointer = 0;
            var y = "ctx",
                m;
            if (!u) {
                u = []
            }
            if (!w) {
                w = {}
            }
            var m = this.getScene().getCanvas()._ctxTmp;
            var p, i = {};
            var e = {};
            var v = true,
                k = 1,
                n = false;
            var r = function(B, g, A) {
                if (B[g] || this._forceEvent) {
                    this._canvas[0]["_ctxMouseEvent"][g] = A;
                    return 0
                }
                return 1
            };
            if (z && typeof z != "string") {
                m = z;
                z = null
            }
            if (z) {
                i[z] = [{
                    params: u,
                    propreties: w
                }];
                v = false
            } else {
                i = this._cmd
            }

            function f(C, g) {
                for (var A = 0; A < this._canvas.length; A++) {
                    e = C.propreties;
                    if (v && g == "restore") {
                        this.clearPropreties()
                    }
                    if (e) {
                        for (var B in e) {
                            k = 1;
                            if (B == "globalAlpha") {
                                e[B] = this.real_opacity
                            }
                            if (m) {
                                m[B] = e[B]
                            } else {
                                this._canvas[A][y][B] = e[B]
                            }
                            k &= r.call(this, e, "globalAlpha", 1);
                            k &= r.call(this, e, "strokeStyle", "#" + this.color_key);
                            k &= r.call(this, e, "fillStyle", "#" + this.color_key);
                            if (k) {
                                r.call(this, e, B, e[B])
                            }
                        }
                    }
                    if (m) {
                        m[g].apply(m, C.params)
                    } else {
                        this._canvas[A][y][g].apply(this._canvas[A][y], C.params);
                        if (this._forceEvent) {
                            if (g == "rect") {
                                this._bufferEvent("fillRect", C.params)
                            }
                        }
                        this._bufferEvent(g, C.params)
                    }
                }
            }
            var t, q;
            for (var l in i) {
                for (var h in i[l]) {
                    p = i[l][h];
                    f.call(this, p, l);
                    if (l == "beginPath") {
                        t = this._graphicCmd[this._graphicPointer];
                        for (var o = 0; o < t.length; o++) {
                            q = t[o];
                            f.call(this, q, q.name)
                        }
                        this._graphicPointer++
                    }
                }
            }
        },
        _addCmd: function(g, l, e, n) {
            if (typeof e == "boolean") {
                n = e;
                e = false
            }
            l = l || [];
            e = e || [];
            var m = this._PROPS;
            e = e.concat(m);
            var i = {};
            for (var f = 0; f < e.length; f++) {
                if (this[e[f]]) {
                    i[e[f]] = this[e[f]]
                }
            }
            i.globalAlpha = 1;
            if (n) {
                var h = this._graphicCmd[this._graphicCmd.length - 1];
                if (!h) {
                    throw "error"
                } else {
                    h.push({
                        name: g,
                        params: l,
                        propreties: i
                    })
                }
            } else {
                if (this.multiple && typeof this._cmd[g] !== "undefined" && this._cmd[g] !== null) {
                    this._cmd[g].push({
                        params: l,
                        propreties: i
                    })
                } else {
                    this._cmd[g] = [{
                        params: l,
                        propreties: i
                    }]
                }
            }
        },
        hasCmd: function(e) {
            return this._cmd[e] !== undefined
        },
        removeCmd: function(e) {
            if (e == "clip") {
                this._useClip = false
            }
            delete this._cmd[e]
        }
    });
    Class.create("Element", {
        _children: [],
        _attr: {},
        x: 0,
        y: 0,
        real_x: 0,
        real_y: 0,
        real_scale_x: 1,
        real_scale_y: 1,
        real_rotate: 0,
        real_skew_x: 0,
        real_skew_y: 0,
        real_opacity: 1,
        real_propagation: true,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
        opacity: 1,
        rotation: 0,
        width: null,
        height: null,
        regX: 0,
        regY: 0,
        parent: null,
        pause: false,
        _index: 0,
        _id: null,
        _visible: true,
        _listener: {},
        _buffer_img: null,
        _out: 1,
        _over: 0,
        _nbEvent: 0,
        _onRender: [],
        _pack: null,
        _useDOM: false,
        _forceEvent: false,
        propagationOpacity: null,
        initialize: function(l, h, i, e) {
            var f = l.getCanvas();
            this._id = _CanvasEngine.uniqid();
            this._dom = document.createElement("div");
            this.width = i;
            this.height = e;
            this.scene = l;
            this.stage = l._stage;
            this.layer = h;
            var g, k = f._elementsByScene(this.scene.name);
            do {
                g = _CanvasEngine._getRandomColorKey()
            } while (g in k);
            this.color_key = g;
            this.scene.getCanvas()._elementsByScene(this.scene.name, g, this);
            this._canvas = b.el_canvas
        },
        _initParams: function(e) {
            if (e || !this.parent) {
                this.parent = {
                    scaleX: 1,
                    scaleY: 1,
                    real_x: 0,
                    real_y: 0,
                    real_scale_x: 1,
                    real_scale_y: 1,
                    real_rotate: 0,
                    real_skew_x: 0,
                    real_skew_y: 0,
                    real_opacity: 1,
                    real_propagation: true
                }
            }
        },
        refresh: function() {
            this._refresh(true, true);
            this._canvas._event_mouse = null
        },
        _refreshDOM: function() {
            var f = {
                position: "absolute",
                opacity: this.opacity,
                width: this.width + "px",
                height: this.height + "px",
                display: this._visible ? "block" : "none"
            };
            var e = {
                transform: "rotate(" + this.rotation + "deg) scale(" + this.scaleX + ", " + this.scaleY + ") skew(" + this.skewX + "deg, " + this.skewY + "deg) translate(" + this.x + "px, " + this.y + "px)",
                "transform-origin": this.regX + " " + this.regY
            };
            _CanvasEngine.each(["", "-webkit-", "-moz-", "-o-"], function(g, h) {
                for (s in e) {
                    f[h + s] = e[s]
                }
            });
            _CanvasEngine.extend(this._dom.style, f)
        },
        _refresh: function(l, g, e) {
            if (this.stage._onRefresh) {
                this.stage._onRefresh(this)
            }
            if (!this._visible) {
                this._loop();
                return
            }
            if (!this.real_pause) {
                this._initParams(l);
                this.real_propagation = this.parent.propagationOpacity == null ? true : this.parent.propagationOpacity;
                this.save();
                this.real_scale_x = this.parent.real_scale_x * this.scaleX;
                this.real_scale_y = this.parent.real_scale_y * this.scaleY;
                this.real_y = (this.parent.real_y + this.y);
                this.real_x = (this.parent.real_x + this.x);
                this.real_skew_x = this.parent.real_skew_x + this.skewX;
                this.real_skew_y = this.parent.real_skew_y + this.skewY;
                this.real_rotate = this.parent.real_rotate + this.rotation;
                if (this.real_propagation) {
                    this.real_opacity = this.parent.real_opacity * this.opacity
                } else {
                    this.real_opacity = this.opacity
                }
                this.real_pause = l ? this.pause : this.parent.real_pause;
                this.globalAlpha = this.real_opacity;
                if (this.parent) {
                    if (this.parent.regX) {
                        this.regX = this.parent.regX
                    }
                    if (this.parent.regY) {
                        this.regY = this.parent.regY
                    }
                }
                var k = this.real_x + this.regX;
                var h = this.real_y + this.regY;
                if (this.regX != 0 || this.regY != 0) {
                    this.translate(k, h)
                }
                if (this.real_rotate != 0) {
                    this.rotateDeg(this.real_rotate)
                }
                if (this.real_scale_x != 1 || this.real_scale_y != 1 || this.real_skew_x != 0 || this.real_skew_y != 0) {
                    this.transform(this.real_scale_x, this.real_skew_x, this.real_skew_y, this.real_scale_y, 0, 0)
                }
                if (this.regX != 0 || this.regY != 0) {
                    this.translate(-k, -h)
                }
                this.translate(this.real_x, this.real_y)
            }
            this.draw(e);
            if (!this._useClip) {
                this.restore()
            }
            if (this._useDOM) {
                this._refreshDOM()
            }
            if (g) {
                if (!this.getScene()._pause) {
                    this._loop()
                }
                for (var f = 0; f < this._children.length; f++) {
                    this._children[f]._refresh(false, true, e)
                }
            }
            if (this._useClip) {
                this.restore()
            }
        },
        setX: function(e) {
            this.x = e
        },
        setY: function(e) {
            this.y = e
        },
        buffer: function(f, m) {
            var l = this.children(),
                g = document.createElement("canvas"),
                e = g.getContext("2d"),
                o = this.getScene(),
                n = this.scene.getCanvas();
            g.width = f || n.width;
            g.height = m || n.height;
            this.scene.getCanvas()._ctxTmp = e;
            for (var k = 0; k < l.length; k++) {
                this._children[k]._refresh(true, true)
            }
            this.scene.getCanvas()._ctxTmp = null;
            return g
        },
        rotateTo: function(f, e) {
            var g = parseInt(f);
            if (/rad$/.test(f)) {
                g = g * 180 / Math.PI
            }
            this.rotation = e ? 360 - g : g;
            this._stageRefresh();
            return this
        },
        setOriginPoint: function(e, f) {
            if (e == "middle") {
                if (this.width && this.height) {
                    e = Math.round(this.width / 2);
                    f = Math.round(this.height / 2)
                } else {
                    throw "Width and Height proprieties are not defined"
                }
            }
            if (e !== undefined) {
                this.regX = +e
            }
            if (f !== undefined) {
                this.regY = +f
            }
            return this
        },
        getScene: function() {
            return this.scene
        },
        _stageRefresh: function() {
            this.stage.refresh()
        },
        isStage: function() {
            return this._name == "__stage__"
        },
        _mousemove: function(l, g) {
            var f, k;
            for (var h = 0; h < this._children.length; h++) {
                f = this._children[h];
                k = g.x > f.real_x && g.x < f.real_x + f.width && g.y > f.real_y && g.y < f.real_y + f.height;
                if (k) {
                    if (f._out == 1) {
                        f._out++;
                        f._out++;
                        f._over = 1;
                        _trigger = f.trigger("mouseover", l)
                    }
                    if (_trigger) {
                        return
                    }
                } else {
                    if (f._over == 1) {
                        f._out = 1;
                        f._over++;
                        _trigger = f.trigger("mouseout", l)
                    }
                }
            }
        },
        _select: function(i, o) {
            var h, e;
            var f = this.scene.getCanvas();
            var l = this._canvas[0],
                n = l.element.style.width,
                g = l.element.style.height,
                m = n != "" ? ~~(i.x * l.width / parseInt(n)) : i.x,
                k = g != "" ? ~~(i.y * l.height / parseInt(g)) : i.y;
            e = l._ctxMouseEvent.getImageData(m, k, 1, 1).data;
            if (e[3] > 0) {
                h = f._elementsByScene(this.scene.name, _CanvasEngine.rgbToHex(e[0], e[1], e[2]));
                if (h) {
                    o(h)
                }
            }
        },
        _click: function(h, f, g) {
            this._select(f, function(e) {
                e.trigger("click", h, f)
            })
        },
        _cloneRecursive: function(g) {
            var k, h;
            if (g._children.length > 0) {
                for (var f = 0; f < g._children.length; f++) {
                    k = g._children[f];
                    h = this.scene.createElement();
                    for (var e in k) {
                        if (typeof e != "function") {
                            h[e] = k[e]
                        }
                    }
                    h.parent = g;
                    this._cloneRecursive(k);
                    g._children[f] = h
                }
            }
        },
        clone: function() {
            var f = this.scene.createElement();
            for (var e in this) {
                if (typeof e != "function") {
                    f[e] = this[e]
                }
            }
            this._cloneRecursive(f);
            return f
        },
        append: function(m) {
            var l, f = this;
            var g = this.scene.getCanvas();

            function k(i) {
                if (i._useDOM && i.parent) {
                    i.parent._dom.appendChild(i._dom);
                    if (!f.isStage()) {
                        i.parent._useDOM = true;
                        k(i.parent)
                    }
                }
            }

            function e(i) {
                i._useDOM = true;
                k(i);
                i._refreshDOM()
            }
            if (m instanceof Element) {
                this._dom.appendChild(m);
                e(this);
                return this
            } else {
                if (typeof jQuery != "undefined" && m instanceof jQuery) {
                    jQuery(this._dom).append(m);
                    e(this);
                    return this
                }
            }
            for (var h = 0; h < arguments.length; h++) {
                l = arguments[h];
                this._children.push(l);
                l.parent = this;
                l._refresh(false, true);
                k(l)
            }
            return arguments
        },
        prepend: function(e) {
            this._children.push(e);
            e.parent = this;
            e.zIndex(0);
            return e
        },
        insertAfter: function(f) {
            var e = f.parent.children();
            e.push(this);
            return this
        },
        children: function(g) {
            var h = [],
                e = [];
            if (g) {
                if (g instanceof Array) {
                    h = g
                }
                if (g instanceof Class) {
                    h = g.children()
                }
                for (var f = 0; f < h.length; f++) {
                    e[f] = h[f].clone();
                    e[f].parent = this
                }
                this._children = e
            }
            return this._children
        },
        detach: function() {
            this.remove();
            return this
        },
        pack: function(o, m, n) {
            var f = this.children(),
                g = document.createElement("canvas"),
                p = g.getContext("2d"),
                l = this.getScene(),
                e;
            g.width = o;
            g.height = m;
            this.scene.getCanvas()._ctxTmp = p;
            for (var k = 0; k < f.length; k++) {
                this._children[k]._refresh(true, true)
            }
            this.scene.getCanvas()._ctxTmp = null;
            if (!n) {
                this._pack = f
            }
            this.empty();
            e = l.createElement();
            e.drawImage(g);
            this.append(e);
            return this
        },
        cache: function(f, i, l) {
            var g = document.createElement("canvas"),
                e = g.getContext("2d"),
                k = this.scene.getCanvas();
            if (typeof f == "boolean") {
                l = f;
                f = null
            }
            g.width = f || this.width;
            g.height = i || this.height;
            k._ctxTmp = e;
            this._refresh(true, true);
            k._ctxTmp = null;
            if (!l) {
                this._cache = this._cmd
            }
            this._cmd = [];
            this.drawImage(g);
            return this
        },
        uncache: function() {
            if (!this._cache) {
                throw "Use the method `cache` before or impossible because you release the memory with method `cache`"
            }
            this._cmd = [];
            this._refresh(true, true);
            this._cmd = this._cache;
            this._cache = null;
            return this
        },
        unpack: function() {
            if (!this._pack) {
                throw "Use the method pack before or impossible because you release the memory with method pack"
            }
            this._children = this._pack;
            this._pack = null;
            return this
        },
        forceEvent: function(f) {
            if (f == undefined) {
                f = true
            }
            this._forceEvent = f;
            if (!f) {
                this.removeCmd("rect");
                return this
            }
            var e = this.width,
                g = this.height;
            if (!e) {
                e = this.img.width
            }
            if (!g) {
                g = this.img.height
            }
            if (!e || !g) {
                throw "forceEvent() : Before, indicate the size of element !"
            }
            this.beginPath();
            this.rect(0, 0, e, g);
            this.closePath();
            return this
        },
        isAppend: function() {
            return this in this.parent.children()
        },
        first: function() {
            return this.eq(0)
        },
        last: function() {
            return this.eq(-1)
        },
        eq: function(f) {
            var g = this.children(),
                e = g.length;
            if (Math.abs(f) >= e) {
                f = -1
            }
            if (f < 0) {
                f = e + f
            }
            return g[f]
        },
        next: function(e, l) {
            var g = this.zIndex();
            if (e) {
                var k = this.parent.children(),
                    f, m;
                for (var h = g + 1; h < k.length; h++) {
                    m = k[h];
                    f = this._findAttr(e, l, m);
                    if (f) {
                        return m
                    }
                }
                return false
            }
            return this.parent.eq(g + 1)
        },
        prev: function(e, l) {
            var g = this.zIndex();
            if (e) {
                var k = this.parent.children(),
                    f, m;
                for (var h = g - 1; h >= 0; h--) {
                    m = k[h];
                    f = this._findAttr(e, l, m);
                    if (f) {
                        return m
                    }
                }
                return false
            }
            return this.parent.eq(g - 1)
        },
        find: function(e) {
            var g = this.children(),
                h = [];
            for (var f = 0; f < g.length; f++) {
                c = g[f];
                if (e == c.name) {
                    h.push(c)
                }
            }
            return h
        },
        _findAttr: function(e, g, h) {
            var f = h.attr(e);
            if (f) {
                if (g != undefined) {
                    if (f == g) {
                        return h
                    }
                } else {
                    return h
                }
            }
            return false
        },
        findAttr: function(e, l) {
            var h = this.children(),
                f, k = [];
            for (var g = 0; g < h.length; g++) {
                f = this._findAttr(e, l, h[g]);
                if (f) {
                    k.push(f)
                }
            }
            return k
        },
        zIndex: function(f) {
            var e;
            if (!this.parent) {
                throw "zIndex: No parent known for this element. Assign a parent of this element with append()"
            }
            if (f === undefined) {
                return this.parent._children.indexOf(this)
            }
            if (f instanceof Class) {
                f = f.zIndex()
            }
            e = this.parent._children.length;
            if (Math.abs(f) >= e) {
                f = -1
            }
            if (f < 0) {
                f = e + f
            }
            _CanvasEngine.moveArray(this.parent._children, this.zIndex(), f);
            this._stageRefresh();
            return this
        },
        zIndexBefore: function(e) {
            this.zIndex(e.zIndex() - 1);
            return this
        },
        remove: function() {
            var g;
            var e = this.scene.getCanvas();
            for (var f = 0; f < this.parent._children.length; f++) {
                g = this.parent._children[f];
                if (this._id == g._id) {
                    if (e._layerDOM && g._useDOM) {
                        e._layerDOM.removeChild(g._dom)
                    }
                    this.parent._children.splice(f, 1);
                    this._stageRefresh();
                    return true
                }
            }
            return false
        },
        empty: function() {
            this._children = [];
            return this
        },
        attr: function(e, g, f) {
            f = f == undefined ? true : f;
            if (g === undefined) {
                return this._attr[e]
            }
            if (this._attr[e] != g && f) {
                this.trigger("element:attrChange", [e, g])
            }
            this._attr[e] = g;
            return this
        },
        removeAttr: function(e) {
            if (this._attr[e]) {
                delete this._attr[e]
            }
            return this
        },
        offset: function(f) {
            if (f) {
                var e = this.parent;
                if (f.left) {
                    this.x = f.left
                }
                if (f.right && e) {
                    this.x = e.width - this.width
                }
                if (f.top) {
                    this.y = f.top
                }
                if (f.bottom && e) {
                    this.y = e.height - this.height
                }
                return this
            }
            return {
                left: this.x,
                top: this.y
            }
        },
        position: function() {
            return {
                left: this.real_x,
                top: this.real_y
            }
        },
        scaleTo: function(e) {
            this.scaleX = e;
            this.scaleY = e;
            return this
        },
        hide: function() {
            this._visible = false
        },
        show: function() {
            this._visible = true
        },
        toggle: function() {
            if (this._visible) {
                this.hide()
            } else {
                this.show()
            }
        },
        bind: function(e, f) {
            this.on(e, f)
        },
        on: function(f, h) {
            var g;
            f = f.split(" ");
            for (var e = 0; e < f.length; e++) {
                g = f[e];
                if (g == "canvas:refresh") {
                    this.stage._onRefresh = h
                } else {
                    if (g == "canvas:render") {
                        this._onRender.push(h)
                    } else {
                        if (b.mobileUserAgent && g == "click") {
                            g = "touch"
                        }
                    }
                }
                if (!this._listener[g]) {
                    this._listener[g] = [];
                    this._nbEvent++
                }
                this._listener[g].push(h)
            }
        },
        unbind: function(e, f) {
            this.off(e, f)
        },
        off: function(f, h) {
            var g;
            f = f.split(" ");
            for (var e = 0; e < f.length; e++) {
                g = f[e];
                if (h) {
                    if (g == "canvas:render") {
                        for (var e = 0; e < this._onRender.length; e++) {
                            if (this._onRender[e] == h) {
                                this._onRender.splice(e, 1);
                                break
                            }
                        }
                    }
                    for (var e = 0; e < this._listener[g].length; e++) {
                        if (this._listener[g][e] == h) {
                            this._listener[g].splice(e, 1);
                            break
                        }
                    }
                } else {
                    if (g == "canvas:render") {
                        this._onRender = []
                    }
                    if (this._listener[g]) {
                        delete this._listener[g];
                        this._nbEvent--
                    }
                }
                if (this._listener[g] && this._listener[g].length == 0) {
                    delete this._listener[g];
                    this._nbEvent--
                }
            }
        },
        eventExist: function(e) {
            return this._listener[e] && this._listener[e].length > 0
        },
        hasEvent: function() {
            return this._nbEvent > 0
        },
        trigger: function(k, m) {
            var l, f = false;
            k = k.split(" ");
            if (!(m instanceof Array)) {
                m = [m]
            }
            for (var g = 0; g < k.length; g++) {
                l = k[g];
                if (this._listener[l]) {
                    for (var h = 0; h < this._listener[l].length; h++) {
                        f = true;
                        if (this._listener[l][h]) {
                            this._listener[l][h].apply(this, m)
                        }
                    }
                }
            }
            return f
        },
        click: function(e) {
            this.on("click", e)
        },
        dblclick: function(e) {
            this.on("dblclick", e)
        },
        mouseover: function(e) {
            this.on("mouseover", e)
        },
        mouseout: function(e) {
            this.on("mouseout", e)
        },
        _loop: function() {
            for (var e = 0; e < this._onRender.length; e++) {
                if (this._onRender[e]) {
                    this._onRender[e].call(this)
                }
            }
        },
        addLoopListener: function(e) {
            this.on("canvas:render", e)
        },
        html: function(e) {
            this._useDOM = true;
            this._dom.innerHTML = e;
            return this
        },
        css: function(e) {
            this._useDOM = true;
            _CanvasEngine.extend(this._dom.style, e);
            return this
        }
    }).extend("Context");
    Global_CE = b = Class["new"]("CanvasEngineClass");
    return b
};
CanvasEngine.Core = CanvasEngine;
CanvasEngine.Class = Class;
var CE = CanvasEngine;
(function(F) {
    var z = function(Q, P) {
        return new z.Instance(Q, P || {})
    };
    z.defaults = {
        stop_browser_behavior: {
            userSelect: "none",
            touchCallout: "none",
            touchAction: "none",
            contentZooming: "none",
            userDrag: "none",
            tapHighlightColor: "rgba(0,0,0,0)"
        }
    };
    z.HAS_POINTEREVENTS = navigator.pointerEnabled || navigator.msPointerEnabled;
    z.HAS_TOUCHEVENTS = ("ontouchstart" in F);
    z.EVENT_TYPES = {};
    z.DIRECTION_DOWN = "down";
    z.DIRECTION_LEFT = "left";
    z.DIRECTION_UP = "up";
    z.DIRECTION_RIGHT = "right";
    z.POINTER_MOUSE = "mouse";
    z.POINTER_TOUCH = "touch";
    z.POINTER_PEN = "pen";
    z.EVENT_START = "start";
    z.EVENT_MOVE = "move";
    z.EVENT_END = "end";
    z.plugins = {};
    z.READY = false;

    function e() {
        if (z.READY) {
            return
        }
        z.event.determineEventTypes();
        for (var P in z.gestures) {
            if (z.gestures.hasOwnProperty(P)) {
                z.detection.register(z.gestures[P])
            }
        }
        z.event.onTouch(document, z.EVENT_MOVE, z.detection.detect);
        z.event.onTouch(document, z.EVENT_END, z.detection.endDetect);
        z.READY = true
    }
    z.Instance = function(R, Q) {
        var P = this;
        e();
        this.element = R;
        this.enabled = true;
        this.options = z.utils.extend(z.utils.extend({}, z.defaults), Q || {});
        if (this.options.stop_browser_behavior) {
            z.utils.stopDefaultBrowserBehavior(this.element, this.options.stop_browser_behavior)
        }
        z.event.onTouch(R, z.EVENT_START, function(S) {
            if (P.enabled) {
                z.detection.startDetect(P, S)
            }
        });
        return this
    };
    z.Instance.prototype = {
        on: function G(Q, R) {
            var S = Q.split(" ");
            for (var P = 0; P < S.length; P++) {
                this.element.addEventListener(S[P], R, false)
            }
            return this
        },
        off: function o(Q, R) {
            var S = Q.split(" ");
            for (var P = 0; P < S.length; P++) {
                this.element.removeEventListener(S[P], R, false)
            }
            return this
        },
        trigger: function K(P, R) {
            var Q = document.createEvent("Event");
            Q.initEvent(P, true, true);
            Q.gesture = R;
            this.element.dispatchEvent(Q);
            return this
        },
        enable: function d(P) {
            this.enabled = P;
            return this
        }
    };
    var J = null;
    var l = false;
    var h = false;
    z.event = {
        bindDom: function(R, T, S) {
            var Q = T.split(" ");
            for (var P = 0; P < Q.length; P++) {
                R.addEventListener(Q[P], S, false)
            }
        },
        onTouch: function C(R, Q, S) {
            var P = this;
            this.bindDom(R, z.EVENT_TYPES[Q], function(T) {
                var U = T.type.toLowerCase();
                if (U.match(/mouseup/) && h) {
                    h = false;
                    return
                }
                if (U.match(/touch/) || (U.match(/mouse/) && T.which === 1) || (z.HAS_POINTEREVENTS && U.match(/down/))) {
                    l = true
                }
                if (U.match(/touch|pointer/)) {
                    h = true
                }
                if (l && !(h && U.match(/mouse/))) {
                    if (z.HAS_POINTEREVENTS && Q != z.EVENT_END) {
                        z.PointerEvent.updatePointer(Q, T)
                    }
                    if (Q === z.EVENT_END && J !== null) {
                        T = J
                    } else {
                        J = T
                    }
                    S.call(z.detection, P.collectEventData(R, Q, T));
                    if (z.HAS_POINTEREVENTS && Q == z.EVENT_END) {
                        z.PointerEvent.updatePointer(Q, T)
                    }
                }
                if (U.match(/up|cancel|end/)) {
                    l = false;
                    J = null;
                    z.PointerEvent.reset()
                }
            })
        },
        determineEventTypes: function I() {
            var P;
            if (z.HAS_POINTEREVENTS) {
                P = z.PointerEvent.getEvents()
            } else {
                P = ["touchstart mousedown", "touchmove mousemove", "touchend touchcancel mouseup"]
            }
            z.EVENT_TYPES[z.EVENT_START] = P[0];
            z.EVENT_TYPES[z.EVENT_MOVE] = P[1];
            z.EVENT_TYPES[z.EVENT_END] = P[2]
        },
        getTouchList: function u(P) {
            if (z.HAS_POINTEREVENTS) {
                return z.PointerEvent.getTouchList()
            } else {
                if (P.touches) {
                    return P.touches
                } else {
                    return [{
                        identifier: 1,
                        pageX: P.pageX,
                        pageY: P.pageY,
                        target: P.target
                    }]
                }
            }
        },
        collectEventData: function N(R, Q, S) {
            var T = this.getTouchList(S, Q);
            var P = z.POINTER_TOUCH;
            if (S.type.match(/mouse/) || z.PointerEvent.matchType(z.POINTER_MOUSE, S)) {
                P = z.POINTER_MOUSE
            }
            return {
                center: z.utils.getCenter(T),
                timestamp: S.timestamp || new Date().getTime(),
                target: S.target,
                touches: T,
                eventType: Q,
                pointerType: P,
                srcEvent: S,
                preventDefault: function() {
                    if (this.srcEvent.preventManipulation) {
                        this.srcEvent.preventManipulation()
                    }
                    if (this.srcEvent.preventDefault) {
                        this.srcEvent.preventDefault()
                    }
                },
                stopPropagation: function() {
                    this.srcEvent.stopPropagation()
                },
                stopDetect: function() {
                    return z.detection.stopDetect()
                }
            }
        }
    };
    z.PointerEvent = {
        pointers: {},
        getTouchList: function() {
            var P = this.pointers;
            var Q = [];
            Object.keys(P).sort().forEach(function(R) {
                Q.push(P[R])
            });
            return Q
        },
        updatePointer: function(Q, P) {
            if (Q == z.EVENT_END) {
                delete this.pointers[P.pointerId]
            } else {
                P.identifier = P.pointerId;
                this.pointers[P.pointerId] = P
            }
        },
        matchType: function(P, R) {
            if (!R.pointerType) {
                return false
            }
            var Q = {};
            Q[z.POINTER_MOUSE] = (R.pointerType == R.MSPOINTER_TYPE_MOUSE || R.pointerType == z.POINTER_MOUSE);
            Q[z.POINTER_TOUCH] = (R.pointerType == R.MSPOINTER_TYPE_TOUCH || R.pointerType == z.POINTER_TOUCH);
            Q[z.POINTER_PEN] = (R.pointerType == R.MSPOINTER_TYPE_PEN || R.pointerType == z.POINTER_PEN);
            return Q[P]
        },
        getEvents: function() {
            return ["pointerdown MSPointerDown", "pointermove MSPointerMove", "pointerup pointercancel MSPointerUp MSPointerCancel"]
        },
        reset: function() {
            this.pointers = {}
        }
    };
    z.utils = {
        extend: function i(P, R) {
            for (var Q in R) {
                P[Q] = R[Q]
            }
            return P
        },
        getCenter: function A(S) {
            var T = [],
                R = [];
            for (var Q = 0, P = S.length; Q < P; Q++) {
                T.push(S[Q].pageX);
                R.push(S[Q].pageY)
            }
            return {
                pageX: ((Math.min.apply(Math, T) + Math.max.apply(Math, T)) / 2),
                pageY: ((Math.min.apply(Math, R) + Math.max.apply(Math, R)) / 2)
            }
        },
        getVelocity: function p(P, R, Q) {
            return {
                x: Math.abs(R / P) || 0,
                y: Math.abs(Q / P) || 0
            }
        },
        getAngle: function n(R, Q) {
            var S = Q.pageY - R.pageY,
                P = Q.pageX - R.pageX;
            return Math.atan2(S, P) * 180 / Math.PI
        },
        getDirection: function k(R, Q) {
            var P = Math.abs(R.pageX - Q.pageX),
                S = Math.abs(R.pageY - Q.pageY);
            if (P >= S) {
                return R.pageX - Q.pageX > 0 ? z.DIRECTION_LEFT : z.DIRECTION_RIGHT
            } else {
                return R.pageY - Q.pageY > 0 ? z.DIRECTION_UP : z.DIRECTION_DOWN
            }
        },
        getDistance: function m(R, Q) {
            var P = Q.pageX - R.pageX,
                S = Q.pageY - R.pageY;
            return Math.sqrt((P * P) + (S * S))
        },
        getScale: function y(Q, P) {
            if (Q.length >= 2 && P.length >= 2) {
                return this.getDistance(P[0], P[1]) / this.getDistance(Q[0], Q[1])
            }
            return 1
        },
        getRotation: function v(Q, P) {
            if (Q.length >= 2 && P.length >= 2) {
                return this.getAngle(P[1], P[0]) - this.getAngle(Q[1], Q[0])
            }
            return 0
        },
        isVertical: function D(P) {
            return (P == z.DIRECTION_UP || P == z.DIRECTION_DOWN)
        },
        stopDefaultBrowserBehavior: function b(R, Q) {
            var U, T = ["webkit", "khtml", "moz", "ms", "o", ""];
            if (!Q || !R.style) {
                return
            }
            for (var P = 0; P < T.length; P++) {
                for (var S in Q) {
                    if (Q.hasOwnProperty(S)) {
                        U = S;
                        if (T[P]) {
                            U = T[P] + U.substring(0, 1).toUpperCase() + U.substring(1)
                        }
                        R.style[U] = Q[S]
                    }
                }
            }
            if (Q.userSelect == "none") {
                R.onselectstart = function() {
                    return false
                }
            }
        }
    };
    z.detection = {
        gestures: [],
        current: null,
        previous: null,
        stopped: false,
        startDetect: function B(Q, P) {
            if (this.current) {
                return
            }
            this.stopped = false;
            this.current = {
                inst: Q,
                startEvent: z.utils.extend({}, P),
                lastEvent: false,
                name: ""
            };
            this.detect(P)
        },
        detect: function r(S) {
            if (!this.current || this.stopped) {
                return
            }
            S = this.extendEventData(S);
            var T = this.current.inst.options;
            for (var R = 0, P = this.gestures.length; R < P; R++) {
                var Q = this.gestures[R];
                if (!this.stopped && T[Q.name] !== false) {
                    if (Q.handler.call(Q, S, this.current.inst) === false) {
                        this.stopDetect();
                        break
                    }
                }
            }
            if (this.current) {
                this.current.lastEvent = S
            }
        },
        endDetect: function E(P) {
            this.detect(P);
            this.stopDetect()
        },
        stopDetect: function a() {
            this.previous = z.utils.extend({}, this.current);
            this.current = null;
            this.stopped = true
        },
        extendEventData: function w(T) {
            var U = this.current.startEvent;
            if (U && (T.touches.length != U.touches.length || T.touches === U.touches)) {
                U.touches = [];
                for (var R = 0, P = T.touches.length; R < P; R++) {
                    U.touches.push(z.utils.extend({}, T.touches[R]))
                }
            }
            var Q = T.timestamp - U.timestamp,
                W = T.center.pageX - U.center.pageX,
                V = T.center.pageY - U.center.pageY,
                S = z.utils.getVelocity(Q, W, V);
            z.utils.extend(T, {
                deltaTime: Q,
                deltaX: W,
                deltaY: V,
                velocityX: S.x,
                velocityY: S.y,
                distance: z.utils.getDistance(U.center, T.center),
                angle: z.utils.getAngle(U.center, T.center),
                direction: z.utils.getDirection(U.center, T.center),
                scale: z.utils.getScale(U.touches, T.touches),
                rotation: z.utils.getRotation(U.touches, T.touches),
                startEvent: U
            });
            return T
        },
        register: function f(Q) {
            var P = Q.defaults || {};
            if (typeof(P[Q.name]) == "undefined") {
                P[Q.name] = true
            }
            z.utils.extend(z.defaults, P);
            Q.index = Q.index || 1000;
            this.gestures.push(Q);
            this.gestures.sort(function(S, R) {
                if (S.index < R.index) {
                    return -1
                }
                if (S.index > R.index) {
                    return 1
                }
                return 0
            });
            return this.gestures
        }
    };
    z.gestures = z.gestures || {};
    z.gestures.Hold = {
        name: "hold",
        index: 10,
        defaults: {
            hold_timeout: 500,
            hold_threshold: 1
        },
        timer: null,
        handler: function M(P, Q) {
            switch (P.eventType) {
                case z.EVENT_START:
                    clearTimeout(this.timer);
                    z.detection.current.name = this.name;
                    this.timer = setTimeout(function() {
                        if (z.detection.current.name == "hold") {
                            Q.trigger("hold", P)
                        }
                    }, Q.options.hold_timeout);
                    break;
                case z.EVENT_MOVE:
                    if (P.distance > Q.options.hold_threshold) {
                        clearTimeout(this.timer)
                    }
                    break;
                case z.EVENT_END:
                    clearTimeout(this.timer);
                    break
            }
        }
    };
    z.gestures.Tap = {
        name: "tap",
        index: 100,
        defaults: {
            tap_max_touchtime: 250,
            tap_max_distance: 10,
            doubletap_distance: 20,
            doubletap_interval: 300
        },
        handler: function H(Q, R) {
            if (Q.eventType == z.EVENT_END) {
                var P = z.detection.previous;
                if (Q.deltaTime > R.options.tap_max_touchtime || Q.distance > R.options.tap_max_distance) {
                    return
                }
                if (P && P.name == "tap" && (Q.timestamp - P.lastEvent.timestamp) < R.options.doubletap_interval && Q.distance < R.options.doubletap_distance) {
                    z.detection.current.name = "doubletap"
                } else {
                    z.detection.current.name = "tap"
                }
                R.trigger(z.detection.current.name, Q)
            }
        }
    };
    z.gestures.Swipe = {
        name: "swipe",
        index: 40,
        defaults: {
            swipe_max_touches: 1,
            swipe_velocity: 0.7
        },
        handler: function O(P, Q) {
            if (P.eventType == z.EVENT_END) {
                if (Q.options.swipe_max_touches > 0 && P.touches.length > Q.options.swipe_max_touches) {
                    return
                }
                if (P.velocityX > Q.options.swipe_velocity || P.velocityY > Q.options.swipe_velocity) {
                    Q.trigger(this.name, P);
                    Q.trigger(this.name + P.direction, P)
                }
            }
        }
    };
    z.gestures.Drag = {
        name: "drag",
        index: 50,
        defaults: {
            drag_min_distance: 10,
            drag_max_touches: 1,
            drag_block_horizontal: false,
            drag_block_vertical: false,
            drag_lock_to_axis: false
        },
        triggered: false,
        handler: function t(P, Q) {
            if (z.detection.current.name != this.name && this.triggered) {
                Q.trigger(this.name + "end", P);
                this.triggered = false;
                return
            }
            if (Q.options.drag_max_touches > 0 && P.touches.length > Q.options.drag_max_touches) {
                return
            }
            switch (P.eventType) {
                case z.EVENT_START:
                    this.triggered = false;
                    break;
                case z.EVENT_MOVE:
                    if (P.distance < Q.options.drag_min_distance && z.detection.current.name != this.name) {
                        return
                    }
                    z.detection.current.name = this.name;
                    var R = z.detection.current.lastEvent.direction;
                    if (Q.options.drag_lock_to_axis && R !== P.direction) {
                        if (z.utils.isVertical(R)) {
                            P.direction = (P.deltaY < 0) ? z.DIRECTION_UP : z.DIRECTION_DOWN
                        } else {
                            P.direction = (P.deltaX < 0) ? z.DIRECTION_LEFT : z.DIRECTION_RIGHT
                        }
                    }
                    if (!this.triggered) {
                        Q.trigger(this.name + "start", P);
                        this.triggered = true
                    }
                    Q.trigger(this.name, P);
                    Q.trigger(this.name + P.direction, P);
                    if ((Q.options.drag_block_vertical && z.utils.isVertical(P.direction)) || (Q.options.drag_block_horizontal && !z.utils.isVertical(P.direction))) {
                        P.preventDefault()
                    }
                    break;
                case z.EVENT_END:
                    if (this.triggered) {
                        Q.trigger(this.name + "end", P)
                    }
                    this.triggered = false;
                    break
            }
        }
    };
    z.gestures.Transform = {
        name: "transform",
        index: 45,
        defaults: {
            transform_min_scale: 0.01,
            transform_min_rotation: 1,
            transform_always_block: false
        },
        triggered: false,
        handler: function q(R, S) {
            if (z.detection.current.name != this.name && this.triggered) {
                S.trigger(this.name + "end", R);
                this.triggered = false;
                return
            }
            if (R.touches.length < 2) {
                return
            }
            if (S.options.transform_always_block) {
                R.preventDefault()
            }
            switch (R.eventType) {
                case z.EVENT_START:
                    this.triggered = false;
                    break;
                case z.EVENT_MOVE:
                    var Q = Math.abs(1 - R.scale);
                    var P = Math.abs(R.rotation);
                    if (Q < S.options.transform_min_scale && P < S.options.transform_min_rotation) {
                        return
                    }
                    z.detection.current.name = this.name;
                    if (!this.triggered) {
                        S.trigger(this.name + "start", R);
                        this.triggered = true
                    }
                    S.trigger(this.name, R);
                    if (P > S.options.transform_min_rotation) {
                        S.trigger("rotate", R)
                    }
                    if (Q > S.options.transform_min_scale) {
                        S.trigger("pinch", R);
                        S.trigger("pinch" + ((R.scale < 1) ? "in" : "out"), R)
                    }
                    break;
                case z.EVENT_END:
                    if (this.triggered) {
                        S.trigger(this.name + "end", R)
                    }
                    this.triggered = false;
                    break
            }
        }
    };
    z.gestures.Touch = {
        name: "touch",
        index: -Infinity,
        defaults: {
            prevent_default: false
        },
        handler: function g(P, Q) {
            if (Q.options.prevent_default) {
                P.preventDefault()
            }
            if (P.eventType == z.EVENT_START) {
                Q.trigger(this.name, P)
            }
        }
    };
    z.gestures.Release = {
        name: "release",
        index: Infinity,
        handler: function L(P, Q) {
            if (P.eventType == z.EVENT_END) {
                Q.trigger(this.name, P)
            }
        }
    };
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = z
    } else {
        F.Hammer = z;
        if (typeof F.define === "function" && F.define.amd) {
            F.define("hammer", [], function() {
                return z
            })
        }
    }
})(this);
var Ease = {
    linear: function(e, f, a, h, g) {
        return h * (f /= g) + a
    },
    easeInQuad: function(e, f, a, h, g) {
        return h * (f /= g) * f + a
    },
    easeOutQuad: function(e, f, a, h, g) {
        return -h * (f /= g) * (f - 2) + a
    },
    easeInOutQuad: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f + a
        }
        return -h / 2 * ((--f) * (f - 2) - 1) + a
    },
    easeInCubic: function(e, f, a, h, g) {
        return h * (f /= g) * f * f + a
    },
    easeOutCubic: function(e, f, a, h, g) {
        return h * ((f = f / g - 1) * f * f + 1) + a
    },
    easeInOutCubic: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f + a
        }
        return h / 2 * ((f -= 2) * f * f + 2) + a
    },
    easeInQuart: function(e, f, a, h, g) {
        return h * (f /= g) * f * f * f + a
    },
    easeOutQuart: function(e, f, a, h, g) {
        return -h * ((f = f / g - 1) * f * f * f - 1) + a
    },
    easeInOutQuart: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f * f + a
        }
        return -h / 2 * ((f -= 2) * f * f * f - 2) + a
    },
    easeInQuint: function(e, f, a, h, g) {
        return h * (f /= g) * f * f * f * f + a
    },
    easeOutQuint: function(e, f, a, h, g) {
        return h * ((f = f / g - 1) * f * f * f * f + 1) + a
    },
    easeInOutQuint: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f * f * f + a
        }
        return h / 2 * ((f -= 2) * f * f * f * f + 2) + a
    },
    easeInSine: function(e, f, a, h, g) {
        return -h * Math.cos(f / g * (Math.PI / 2)) + h + a
    },
    easeOutSine: function(e, f, a, h, g) {
        return h * Math.sin(f / g * (Math.PI / 2)) + a
    },
    easeInOutSine: function(e, f, a, h, g) {
        return -h / 2 * (Math.cos(Math.PI * f / g) - 1) + a
    },
    easeInExpo: function(e, f, a, h, g) {
        return (f == 0) ? a : h * Math.pow(2, 10 * (f / g - 1)) + a
    },
    easeOutExpo: function(e, f, a, h, g) {
        return (f == g) ? a + h : h * (-Math.pow(2, -10 * f / g) + 1) + a
    },
    easeInOutExpo: function(e, f, a, h, g) {
        if (f == 0) {
            return a
        }
        if (f == g) {
            return a + h
        }
        if ((f /= g / 2) < 1) {
            return h / 2 * Math.pow(2, 10 * (f - 1)) + a
        }
        return h / 2 * (-Math.pow(2, -10 * --f) + 2) + a
    },
    easeInCirc: function(e, f, a, h, g) {
        return -h * (Math.sqrt(1 - (f /= g) * f) - 1) + a
    },
    easeOutCirc: function(e, f, a, h, g) {
        return h * Math.sqrt(1 - (f = f / g - 1) * f) + a
    },
    easeInOutCirc: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return -h / 2 * (Math.sqrt(1 - f * f) - 1) + a
        }
        return h / 2 * (Math.sqrt(1 - (f -= 2) * f) + 1) + a
    },
    easeInElastic: function(f, h, e, m, l) {
        var i = 1.70158;
        var k = 0;
        var g = m;
        if (h == 0) {
            return e
        }
        if ((h /= l) == 1) {
            return e + m
        }
        if (!k) {
            k = l * 0.3
        }
        if (g < Math.abs(m)) {
            g = m;
            var i = k / 4
        } else {
            var i = k / (2 * Math.PI) * Math.asin(m / g)
        }
        return -(g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h * l - i) * (2 * Math.PI) / k)) + e
    },
    easeOutElastic: function(f, h, e, m, l) {
        var i = 1.70158;
        var k = 0;
        var g = m;
        if (h == 0) {
            return e
        }
        if ((h /= l) == 1) {
            return e + m
        }
        if (!k) {
            k = l * 0.3
        }
        if (g < Math.abs(m)) {
            g = m;
            var i = k / 4
        } else {
            var i = k / (2 * Math.PI) * Math.asin(m / g)
        }
        return g * Math.pow(2, -10 * h) * Math.sin((h * l - i) * (2 * Math.PI) / k) + m + e
    },
    easeInOutElastic: function(f, h, e, m, l) {
        var i = 1.70158;
        var k = 0;
        var g = m;
        if (h == 0) {
            return e
        }
        if ((h /= l / 2) == 2) {
            return e + m
        }
        if (!k) {
            k = l * (0.3 * 1.5)
        }
        if (g < Math.abs(m)) {
            g = m;
            var i = k / 4
        } else {
            var i = k / (2 * Math.PI) * Math.asin(m / g)
        }
        if (h < 1) {
            return -0.5 * (g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h * l - i) * (2 * Math.PI) / k)) + e
        }
        return g * Math.pow(2, -10 * (h -= 1)) * Math.sin((h * l - i) * (2 * Math.PI) / k) * 0.5 + m + e
    },
    easeInBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158
        }
        return i * (f /= h) * f * ((g + 1) * f - g) + a
    },
    easeOutBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158
        }
        return i * ((f = f / h - 1) * f * ((g + 1) * f + g) + 1) + a
    },
    easeInOutBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158
        }
        if ((f /= h / 2) < 1) {
            return i / 2 * (f * f * (((g *= (1.525)) + 1) * f - g)) + a
        }
        return i / 2 * ((f -= 2) * f * (((g *= (1.525)) + 1) * f + g) + 2) + a
    },
    easeInBounce: function(e, f, a, h, g) {
        return h - jQuery.easing.easeOutBounce(e, g - f, 0, h, g) + a
    },
    easeOutBounce: function(e, f, a, h, g) {
        if ((f /= g) < (1 / 2.75)) {
            return h * (7.5625 * f * f) + a
        } else {
            if (f < (2 / 2.75)) {
                return h * (7.5625 * (f -= (1.5 / 2.75)) * f + 0.75) + a
            } else {
                if (f < (2.5 / 2.75)) {
                    return h * (7.5625 * (f -= (2.25 / 2.75)) * f + 0.9375) + a
                } else {
                    return h * (7.5625 * (f -= (2.625 / 2.75)) * f + 0.984375) + a
                }
            }
        }
    },
    easeInOutBounce: function(e, f, a, h, g) {
        if (f < g / 2) {
            return jQuery.easing.easeInBounce(e, f * 2, 0, h, g) * 0.5 + a
        }
        return jQuery.easing.easeOutBounce(e, f * 2 - g, 0, h, g) * 0.5 + h * 0.5 + a
    }
};
Class.create("Timeline", {
    _timeline: {},
    _frequence: 0,
    _stop: false,
    _propreties: [],
    _key_times: [],
    _onFinish: null,
    _varTime: {},
    initialize: function(a) {
        this._frequence = 0;
        this.el = a;
        this.addProprety(["opacity", "x", "y", "scaleX", "scaleY", "rotation"]);
        this._loop()
    },
    to: function(a, e, d, b) {
        if (d) {
            a._ease_ = d
        }
        if (!b) {
            b = "set"
        }
        this._key_times.push(e);
        this._timeline[e] = a;
        this._timeline[e]._cal = b;
        return this
    },
    wait: function(b) {
        var a = this.getLastKey();
        this.to(a, b, false, "wait");
        return this
    },
    getLastKey: function() {
        var b = this._key_times[this._key_times.length - 1];
        if (!b) {
            var d = {};
            for (var a = 0; a < this._propreties.length; a++) {
                d[this._propreties[a]] = this.el[this._propreties[a]]
            }
            return d
        }
        return this._timeline[b]
    },
    add: function(a, d, b) {
        return this.to(a, d, b, "add")
    },
    addProprety: function(a) {
        if (!(a instanceof Array)) {
            a = [a]
        }
        for (var b = 0; b < a.length; b++) {
            this._propreties.push(a[b])
        }
    },
    loop: function() {
        var a = this;
        this.call(function() {
            a._stop = false;
            return true
        })
    },
    _initVar: function() {
        this._varTime = {
            freq: this._frequence,
            time: 0,
            time_tmp: 0,
            last_t: 0,
            next_t: 0,
            find_next: false
        }
    },
    _loop: function() {
        var a = this,
            b;
        this.el.addLoopListener(function() {
            if (a._varTime.time === undefined) {
                return
            }
            var e = a._varTime._frequence,
                f = a._varTime.time,
                h = a._varTime.time_tmp,
                n = a._varTime.last_t,
                m = a._varTime.next_t,
                p = a._varTime.find_next;

            function k() {
                var t = {};
                for (var r = 0; r < a._propreties.length; r++) {
                    t[a._propreties[r]] = +this[a._propreties[r]]
                }
                a._timeline["0"] = t
            }

            function l(i) {
                var t, r;
                if (a._timeline[m][i] === undefined) {
                    return this[i]
                }
                t = a._timeline[m]._cal;
                r = a._timeline[m][i];
                switch (t) {
                    case "add":
                        r += a._timeline[n][i];
                        break
                }
                return r
            }

            function d(i) {
                var w, t, v, r, u;
                if (a._timeline[m][i] === undefined) {
                    return this[i]
                }
                w = a._timeline[m]._ease_;
                v = a._timeline[m]._cal;
                u = a._timeline[m][i];
                switch (v) {
                    case "add":
                        u += a._timeline[n][i];
                        break
                }
                if (!w) {
                    w = Ease.linear
                }
                t = w(u, (m - n) - h, a._timeline[n][i], u - a._timeline[n][i], m - n);
                return t
            }
            e = 0;
            var q;
            if (a._stop) {
                return
            }
            e++;
            if (e >= a._frequence) {
                if (f == 0) {
                    k.call(this)
                }
                if (h == 0) {
                    p = false;
                    for (var o in a._timeline) {
                        if (o > f) {
                            n = m ? m : 0;
                            m = o;
                            p = true;
                            break
                        }
                    }
                    if (!p) {
                        a._stop = true;
                        f = 0;
                        n = 0;
                        h = 0;
                        if (a._onFinish) {
                            b = a._onFinish.call(this)
                        }
                        if (!b) {
                            return
                        } else {
                            k.call(this);
                            m = 0
                        }
                    }
                }
                h = m - f;
                if (h != 0) {
                    if (a._timeline[m]._cal != "wait") {
                        if (h == 1) {
                            for (var g = 0; g < a._propreties.length; g++) {
                                this[a._propreties[g]] = l.call(this, a._propreties[g])
                            }
                        } else {
                            for (var g = 0; g < a._propreties.length; g++) {
                                this[a._propreties[g]] = d.call(this, a._propreties[g])
                            }
                        }
                    }
                }
                f++
            }
            a._varTime._frequence = e;
            a._varTime.time = f;
            a._varTime.time_tmp = h;
            a._varTime.last_t = n;
            a._varTime.next_t = m;
            a._varTime.find_next = p
        })
    },
    call: function(a) {
        this._initVar();
        this._onFinish = a;
        this._stop = false
    }
});
Class.create("Animation", {
    _images: [],
    _frames: {},
    _animations: {},
    _frequence: 0,
    _stop: false,
    _timeline: null,
    _onFinish: null,
    _seq: null,
    _loop: false,
    _els: null,
    el: null,
    initialize: function(a) {
        this._options = a;
        this._images = a.images;
        this._animations = a.animations;
        this._timeline = a.timeline;
        if (a.addIn) {
            this.el = a.addIn.scene.createElement();
            a.addIn.append(this.el);
            this.add()
        }
    },
    remove: function(a) {
        if (a) {
            this.el = a
        }
        this.el.off("canvas:render");
        return this
    },
    add: function(e, h) {
        if (e) {
            this.el = e
        }
        var a = this;
        var d = 0;
        var g = null;
        var f = 0;
        var b;
        if (h) {
            this.remove()
        }
        this.stop();
        this.el.addLoopListener(function() {
			//console.log("=========loop=========" + a._animations[a._seq].frames[1])
            if (a._seq !== b) {
                b = a._seq;
                d = 0;
                g = null
            }
            var y = a._animations[a._seq],
                p = a._loop == "loop";

            function v(z) {
                if (y.size) {
                    return y.size
                }
                var A = Global_CE.Materials.get(z);
                y.size = {
                    width: A.width,
                    height: A.height
                }
            }
            if (y && !y.frequence) {
                y.frequence = 0
            }
            if (g == null && y) {
                g = y.frequence
            }
            if (a._stop) {
                if (y) {
                    g = y.frequence
                }
                d = 0;
                return
            }
            g++;
            if (g >= y.frequence) {
                if (a._images instanceof Array) {
                    var n = a._images[f];
                    v(n);
                    this.drawImage(n);
                    f++;
                    if (f >= a._images.length) {
                        f = 0;
                        if (!p) {
                            a._stop = true
                        }
                    }
                } else {
                    var n = Global_CE.Materials.get(a._images),
                        u = 0,
                        r = 0;
                    v(a._images);
                    var w;
                    var q = n.width / y.size.width;
                    var o = n.height / y.size.height;
                    var k;
                    var l;

                    function i(D, C) {
                        var A = a._images;
                        if (y.patternSize) {
                            y.size = {
                                width: n.width / y.patternSize.width,
                                height: n.height / y.patternSize.height
                            }
                        }
                        r = parseInt(C / Math.round(n.width / y.size.width));
                        u = (C % Math.round(n.width / y.size.width));
                        var z = y.size.width * u,
                            B = y.size.height * r;
                        D.trigger("animation:draw", C);
                        if (y.image) {
                            A = y.image
                        }
                        if (!y.position) {
                            y.position = {}
                        }
                        if (!y.position.left) {
                            y.position.left = 0
                        }
                        if (!y.position.top) {
                            y.position.top = 0
                        }
                        D.drawImage(A, z, B, y.size.width, y.size.height, y.position.left, y.position.top, y.size.width, y.size.height)
                    }

                    function t() {
                        if (a._loop == "stop") {
                            if (y.finish) {
                                y.finish.call(a)
                            }
                            a.stop();
                            return true
                        } else {
                            if (a._loop == "remove") {
                                if (y.finish) {
                                    y.finish.call(a)
                                }
								if (a._options.addIn) {
                                    this.empty()
                                } else {
                                    this.remove()
                                }
                                a.stop();
                                return true
                            }
                        }
                        return false
                    }
                    if (y.frames[0] instanceof Array) {
                        if (y.frames[d] === undefined) {
                            d = 0;
                            if (t.call(this)) {
                                return
                            }
                        }
                        this.empty();
                        y.framesDefault = y.framesDefault || {};
                        if (!y.framesDefault.x) {
                            y.framesDefault.x = 0
                        }
                        if (!y.framesDefault.y) {
                            y.framesDefault.y = 0
                        }
                        if (!y.framesDefault.zoom) {
                            y.framesDefault.zoom = 100
                        }
                        if (!y.framesDefault.opacity) {
                            y.framesDefault.opacity = 255
                        }
                        if (!y.framesDefault.rotation) {
                            y.framesDefault.rotation = 0
                        }
                        if (!y.frames[d]) {
                            d++;
                            return
                        }
                        for (var m = 0; m < y.frames[d].length; m++) {
                            w = y.frames[d][m];
                            if (w) {
                                l = this.scene.createElement(y.size.width, y.size.height);
                                k = w.pattern - 1;
                                l.setOriginPoint("middle");
                                l.x = w.x != undefined ? w.x : y.framesDefault.x;
                                l.y = w.y != undefined ? w.y : y.framesDefault.y;
                                l.scaleX = w.zoom != undefined ? w.zoom / 100 : y.framesDefault.zoom / 100;
                                l.scaleY = w.zoom != undefined ? w.zoom / 100 : y.framesDefault.zoom / 100;
                                l.opacity = w.opacity != undefined ? w.opacity / 255 : y.framesDefault.opacity / 255;
                                l.rotation = w.rotation != undefined ? w.rotation : y.framesDefault.rotation;
                                i(l, k);
                                this.append(l)
                            }
                        }
                    } else {
                        k = y.frames[0] + d;
						
                        if (k > y.frames[1] - 1) {
                            d = 0;
                            t.call(this);
                            i(this, k);
                        } else {
                            i(this, k)
                        }
                    }
                    d++
                }
                g = 0
            }
        })
    },
    isStopped: function() {
        return this._stop
    },
    stop: function() {
        this._stop = true;
        return this
    },
    play: function(a, b) {
        this._loop = b;
        this._seq = a;
        this._stop = false;
        return this
    }
});
var Animation = {
    Timeline: {
        New: function() {
            return this["new"].apply(this, arguments)
        },
        "new": function(a) {
            return Class["new"]("Timeline", [a])
        }
    },
    Animation: {
        New: function() {
            return this["new"].apply(this, arguments)
        },
        "new": function(a) {
            return Class["new"]("Animation", [a])
        }
    }
};
var Input = {
    Input: {
        keyBuffer: [],
        cacheKeyBuffer: [],
        _keyFunctions: {},
        _keyPress: {},
        _keyUp: {},
        _keyType: {},
        _keyPressed: {},
        _lock: {},
        _rules: {},
        _key: function(d, b, f) {
            if (typeof b == "function") {
                b(d)
            } else {
                if (b instanceof Array) {
                    for (var a = 0; a < b.length; a++) {
                        if (d.which == b[a]) {
                            if (f) {
                                f(d)
                            }
                        }
                    }
                } else {
                    if (d.which == b) {
                        if (f) {
                            f(d)
                        }
                    }
                }
            }
        },
        press: function(b, a) {
            this._press("keyPress", b, a);
            this.keyUp(b)
        },
        clearKeys: function(a) {
            this.press(a, function() {})
        },
        keyDown: function(b, a) {
            this._press("keyDown", b, a)
        },
        keyUp: function(e, b) {
            var a = this;
            if (e instanceof Array) {
                for (var d = 0; d < e.length; d++) {
                    a._keyUp[e[d]] = b
                }
            } else {
                a._keyUp[e] = b
            }
            document.onkeyup = function(f) {
                a._keyPress[f.which] = 0;
                a._keyPressed[f.which] = false;
                if (a._keyUp[f.which]) {
                    a._keyUp[f.which](f)
                }
            }
        },
        _press: function(h, g, d) {
            var a = this;
            if (typeof g == "string") {
                g = this._rules[g]
            }
            if (g instanceof Array) {
                for (var f = 0; f < g.length; f++) {
                    e(g[f], h)
                }
            } else {
                e(g, h)
            }
            if (this._lock.canvas) {
                var b = this._lock.canvas;
                b.onkeydown = k;
                b.onfocus = function(i) {
                    document.onkeydown = function() {
                        return false
                    };
                    if (a._lock.onFocus) {
                        a._lock.onFocus(i, b)
                    }
                };
                b.onblur = function(i) {
                    document.onkeydown = null;
                    if (a._lock.onBlur) {
                        a._lock.onBlur(i, b)
                    }
                }
            } else {
                document.onkeydown = k
            }

            function k(l) {
                var i;
                if (!a._keyPress[l.which]) {
                    a._keyPress[l.which] = 0
                }
                a._keyPress[l.which]++;
                if (a._keyPress[l.which] > 1 && a._keyType[l.which] == "keyPress") {
                    return
                }
                a._keyPressed[l.which] = true;
                if (a._keyFunctions[l.which]) {
                    i = a._keyFunctions[l.which](l)
                }
                if (i !== undefined) {
                    return i
                } else {
                    return false
                }
            }

            function e(l, i) {
                a._keyType[l] = i;
                a._keyFunctions[l] = d
            }
        },
        reset: function(b) {
            this._keyPressed = {};
            if (b) {
                for (var a = 0; a < b.length; a++) {
                    this._keyFunctions[b[a]] = null
                }
            } else {
                this._keyFunctions = {}
            }
        },
        lock: function(a, f, b, d) {
            var e = document.getElementById(a);
            e.setAttribute("tabindex", 1);
            if (f) {
                e.focus();
                document.onkeydown = function() {
                    return false
                }
            }
            this._lock.canvas = e;
            this._lock.onFocus = b;
            this._lock.onBlur = d
        },
        isPressed: function(b) {
            if (!(b instanceof Array)) {
                b = [b]
            }
            for (var a = 0; a < b.length; a++) {
                if (this._keyPressed[b[a]]) {
                    return true
                }
            }
            return false
        },
        addKey: function(b, a) {
            Input[b] = a
        },
        memorize: function() {
            this.cacheKeyBuffer = this.keyBuffer
        },
        restore: function() {
            this.keyBuffer = this.cacheKeyBuffer
        },
        trigger: function(d, e, a) {
            var f, b, g;
            if (e == "press") {
                this.trigger(d, "down");
                this.trigger(d, "up", a);
                return
            }
            if (this._lock.canvas) {
                b = this._lock.canvas
            } else {
                b = document
            }
            if (document.createEventObject) {
                f = document.createEventObject();
                f.keyCode = d;
                b.fireEvent("onkey" + e, f)
            } else {
                if (document.createEvent) {
                    f = document.createEvent("Events");
                    f.initEvent("key" + e, true, true);
                    f.which = d;
                    b.dispatchEvent(f)
                }
            }
            if (a) {
                g = document.getElementById(a.id + "-dom");
                g.focus()
            }
        },
        addRule: function(b, a) {
            this._rules[b] = a
        },
        Gamepad: {
            _listener: {},
            gamepad: null,
            _onConnect: null,
            _onDisconnect: null,
            _connectState: false,
            init: function(a, b) {
                this._onConnect = a;
                this._onDisconnect = b;
                return this
            },
            getState: function(a) {
                this.gamepad = Gamepad.getStates()[a];
                if (this.gamepad && !this._connectState) {
                    if (this._onConnect) {
                        this._onConnect()
                    }
                    this._connectState = true
                } else {
                    if (!this.gamepad && this._connectState) {
                        if (this._onDisconnect) {
                            this._onDisconnect()
                        }
                        this._connectState = false
                    }
                }
            },
            addListener: function(e, d, f) {
                var a = Input.Input;
                if (typeof d != "function") {
                    var b = d;
                    d = function() {
                        a.trigger(b, "down")
                    };
                    f = function() {
                        a.trigger(b, "up")
                    }
                }
                this._listener[e] = {
                    onDown: d,
                    onUp: f,
                    state: false
                }
            },
            update: function() {
                this.getState(0);
                if (!this.gamepad) {
                    return
                }
                for (var a in this._listener) {
                    if (this.gamepad[a] == 1 && !this._listener[a].state) {
                        if (this._listener[a].onDown) {
                            this._listener[a].onDown()
                        }
                        this._listener[a].state = true
                    } else {
                        if (this.gamepad[a] == 0 && this._listener[a].state) {
                            if (this._listener[a].onUp) {
                                this._listener[a].onUp()
                            }
                            this._listener[a].state = false
                        }
                    }
                }
            }
        },
        accelerometer: function(b) {
            if (window.DeviceOrientationEvent) {
                window.addEventListener("deviceorientation", function(d) {
                    a(d.alpha, d.beta, d.gamma)
                }, false)
            } else {
                if (window.OrientationEvent) {
                    window.addEventListener("MozOrientation", function(d) {
                        a(d.x, d.y, d.z)
                    }, false)
                }
            }

            function a(d, f, e) {
                b(d, f, e)
            }
        }
    }
};
Input.A = 65;
Input.Z = 90;
Input.E = 69;
Input.Q = 81;
Input.Esc = 27;
Input.Enter = 13;
Input.Shift = 16;
Input.Ctrl = 17;
Input.Alt = 18;
Input.Space = 32;
Input.Back = 8;
Input.F1 = 112;
Input.F2 = 113;
Input.F11 = 122;
Input.F12 = 123;
Input.Left = 37;
Input.Up = 38;
Input.Right = 39;
Input.Bottom = 40;
var BISON;
(function(n, f) {
    var o = (function() {
        var u = new n(255);
        for (var w = 0; w < 256; w++) {
            u[w] = String.fromCharCode(w)
        }
        var y = new n(8),
            v = new n(8);
        for (var w = 0; w < 9; w++) {
            y[w] = ~((v[w] = Math.pow(2, w) - 1) ^ 255)
        }
        var C = "",
            B = 0,
            t = 8,
            z = 0,
            A = 0;
        return {
            open: function(i) {
                t = 8;
                if (i !== f) {
                    A = i.length;
                    z = 0;
                    C = i;
                    B = C.charCodeAt(z)
                } else {
                    B = 0;
                    C = ""
                }
            },
            close: function() {
                if (B > 0) {
                    C += u[B]
                }
                return C
            },
            writeRaw: function(i) {
                if (t !== 8) {
                    C += u[B];
                    B = 0;
                    t = 8
                }
                C += i
            },
            readRaw: function(i) {
                if (t !== 8) {
                    z++;
                    B = 0;
                    t = 8
                }
                var E = C.substr(z, i);
                z += i;
                B = C.charCodeAt(z);
                return E
            },
            write: function D(G, F) {
                var H = F - t,
                    E = t < F ? t : F,
                    i = t - E;
                if (H > 0) {
                    B += G >> H << i
                } else {
                    B += G << i
                }
                t -= E;
                if (t === 0) {
                    C += u[B];
                    t = 8;
                    B = 0;
                    if (H > 0) {
                        D(G & v[H], H)
                    }
                }
            },
            read: function r(F) {
                if (z >= A) {
                    return null
                }
                var H = F - t,
                    E = t < F ? t : F,
                    i = t - E;
                var G = (B & y[t]) >> i;
                t -= E;
                if (t === 0) {
                    B = C.charCodeAt(++z);
                    t = 8;
                    if (H > 0) {
                        G = G << H | r(H)
                    }
                }
                return G
            }
        }
    })();
    var q = o.write,
        d = o.read,
        g = o.writeRaw,
        e = o.readRaw,
        l = o.open,
        p = o.close;

    function b(B, A) {
        if (typeof B === "number") {
            var z = B !== (B | 0),
                u = 0;
            if (B < 0) {
                B = -B;
                u = 1
            }
            q(1 + z, 3);
            if (z) {
                var r = 1,
                    t = 10;
                while (t <= B) {
                    r++;
                    t *= 10
                }
                r = (8 - r) + 1;
                B = Math.round(B * (1000000000 / t));
                while (B / 10 === ((B / 10) | 0)) {
                    B /= 10;
                    r--
                }
            }
            if (B < 2) {
                q(B, 4)
            } else {
                if (B < 16) {
                    q(1, 3);
                    q(B, 4)
                } else {
                    if (B < 256) {
                        q(2, 3);
                        q(B, 8)
                    } else {
                        if (B < 4096) {
                            q(3, 3);
                            q(B >> 8 & 255, 4);
                            q(B & 255, 8)
                        } else {
                            if (B < 65536) {
                                q(4, 3);
                                q(B >> 8 & 255, 8);
                                q(B & 255, 8)
                            } else {
                                if (B < 1048576) {
                                    q(5, 3);
                                    q(B >> 16 & 255, 4);
                                    q(B >> 8 & 255, 8);
                                    q(B & 255, 8)
                                } else {
                                    if (B < 16777216) {
                                        q(6, 3);
                                        q(B >> 16 & 255, 8);
                                        q(B >> 8 & 255, 8);
                                        q(B & 255, 8)
                                    } else {
                                        q(7, 3);
                                        q(B >> 24 & 255, 8);
                                        q(B >> 16 & 255, 8);
                                        q(B >> 8 & 255, 8);
                                        q(B & 255, 8)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            q(u, 1);
            if (z) {
                q(r, 4)
            }
        } else {
            if (typeof B === "string") {
                var v = B.length;
                q(3, 3);
                if (v > 65535) {
                    q(31, 5);
                    q(v >> 24 & 255, 8);
                    q(v >> 16 & 255, 8);
                    q(v >> 8 & 255, 8);
                    q(v & 255, 8)
                } else {
                    if (v > 255) {
                        q(30, 5);
                        q(v >> 8 & 255, 8);
                        q(v & 255, 8)
                    } else {
                        if (v > 28) {
                            q(29, 5);
                            q(v, 8)
                        } else {
                            q(v, 5)
                        }
                    }
                }
                g(B)
            } else {
                if (typeof B === "boolean") {
                    q(+B, 5)
                } else {
                    if (B === null) {
                        q(2, 5)
                    } else {
                        if (B instanceof n) {
                            q(4, 3);
                            for (var w = 0, v = B.length; w < v; w++) {
                                b(B[w])
                            }
                            if (!A) {
                                q(6, 3)
                            }
                        } else {
                            q(5, 3);
                            for (var y in B) {
                                b(y);
                                b(B[y])
                            }
                            if (!A) {
                                q(6, 3)
                            }
                        }
                    }
                }
            }
        }
    }

    function m(i) {
        l();
        b(i, true);
        q(0, 3);
        q(3, 2);
        return p()
    }
    var h = new n(16);
    for (var k = 0; k < 16; k++) {
        h[k] = Math.pow(10, k)
    }

    function a(w) {
        var A = [],
            u = -1,
            y, z, B, t, v = false,
            D, r, C;
        l(w);
        while (true) {
            y = d(3);
            if (y === 0) {
                B = d(2);
                if (B === 2) {
                    B = null
                } else {
                    if (B < 2) {
                        B = !!B
                    } else {
                        if (B === 3) {
                            break
                        }
                    }
                }
            } else {
                if (y === 1 || y === 2) {
                    switch (d(3)) {
                        case 0:
                            B = d(1);
                            break;
                        case 1:
                            B = d(4);
                            break;
                        case 2:
                            B = d(8);
                            break;
                        case 3:
                            B = (d(4) << 8) + d(8);
                            break;
                        case 4:
                            B = (d(8) << 8) + d(8);
                            break;
                        case 5:
                            B = (d(4) << 16) + (d(8) << 8) + d(8);
                            break;
                        case 6:
                            B = (d(8) << 16) + (d(8) << 8) + d(8);
                            break;
                        case 7:
                            B = (d(8) << 24) + (d(8) << 16) + (d(8) << 8) + d(8);
                            break
                    }
                    if (d(1)) {
                        B = -B
                    }
                    if (y === 2) {
                        B /= h[d(4)]
                    }
                } else {
                    if (y === 3) {
                        var E = d(5);
                        switch (E) {
                            case 31:
                                E = (d(8) << 24) + (d(8) << 16) + (d(8) << 8) + d(8);
                                break;
                            case 30:
                                E = (d(8) << 8) + d(8);
                                break;
                            case 29:
                                E = d(8);
                                break
                        }
                        B = e(E);
                        if (v) {
                            D = B;
                            v = false;
                            continue
                        }
                    } else {
                        if (y === 4 || y === 5) {
                            v = y === 5;
                            B = v ? {} : [];
                            if (C === f) {
                                C = B
                            } else {
                                if (r) {
                                    z[D] = B
                                } else {
                                    z.push(B)
                                }
                            }
                            z = A[++u] = B;
                            r = !(z instanceof Array);
                            continue
                        } else {
                            if (y === 6) {
                                z = A[--u];
                                v = r = !(z instanceof Array);
                                continue
                            }
                        }
                    }
                }
            }
            if (r) {
                z[D] = B;
                v = true
            } else {
                if (z !== f) {
                    z.push(B)
                } else {
                    return B
                }
            }
        }
        return C
    }
    if (typeof window === "undefined") {
        exports.encode = m;
        exports.decode = a;
        BISON = exports
    } else {
        window.BISON = {
            encode: m,
            decode: a
        }
    }
})(Array);
if (typeof exports != "undefined") {
    var CE = require("canvasengine").listen(),
        Class = CE.Class
}
Class.create("Marshal", {
    _pointer: {},
    _cache: {},
    _stack_dump: [],
    _decode: function(b) {
        if (typeof navigator != "undefined" && navigator.appName == "Microsoft Internet Explorer") {
            try {
                return JSON.parse(b)
            } catch (a) {}
        } else {
            return BISON.decode(b)
        }
    },
    _encode: function(b) {
        if (typeof navigator != "undefined" && navigator.appName == "Microsoft Internet Explorer") {
            try {
                return JSON.stringify(b)
            } catch (a) {}
        } else {
            return BISON.encode(b)
        }
    },
    exist: function(a) {
        return typeof localStorage != "undefined" && localStorage[a]
    },
    _recursiveData: function(f, l, h) {
        var k, g = {},
            d = {},
            b;
        h = h || [];
        if (f instanceof Object) {
            for (var a in f) {
                b = f[a];
                if (typeof b != "function" && (CE.Core || CE).inArray(a, h) == -1) {
                    if (b instanceof Array) {
                        d[a] = [];
                        for (var e = 0; e < b.length; e++) {
                            d[a][e] = this._recursiveData(b[e], l, h)
                        }
                    } else {
                        if (b instanceof Object) {
                            d[a] = this._recursiveData(b, l, h)
                        } else {
                            if (b !== undefined) {
                                d[a] = b
                            }
                        }
                    }
                }
            }
        } else {
            if (typeof f != "function" && f !== undefined) {
                return f
            }
        }
        if (l == "load") {
            if (d.__name__) {
                g = Class.New(f.__name__, false);
                for (var a in d) {
                    if (typeof g[a] != "function") {
                        g[a] = d[a]
                    }
                }
            } else {
                g = d
            }
        } else {
            g = d
        }
        return g
    },
    load: function(b, e) {
        var f, a, d;
        if (this._pointer[b] === undefined) {
            this._pointer[b] = 0
        }
        if (this._cache[b]) {
            f = this._cache[b]
        } else {
            if (e) {
                f = this._decode(e) || [];
                this._cache[b] = f
            } else {
                if (typeof localStorage != "undefined") {
                    f = this._decode(localStorage[b]) || [];
                    this._cache[b] = f
                }
            }
        }
        a = this._recursiveData(f[this._pointer[b]], "load");
        if (!e && !this.exist(b)) {
            return false
        }
        this._pointer[b]++;
        return a
    },
    dump: function(b, d, f) {
        var e = [],
            a = {};
        if (typeof b == "number" || typeof b == "string" || b instanceof Array) {
            a = b
        } else {
            a = this._recursiveData(b, "save", f)
        }
        this._stack_dump.push(a);
        if (typeof localStorage != "undefined") {
            localStorage[d] = this._encode(this._stack_dump)
        }
    },
    getStack: function(a) {
        return !a ? this._stack_dump : this._encode(this._stack_dump)
    },
    remove: function(a) {
        if (typeof localStorage != "undefined") {
            localStorage.removeItem(a);
            return true
        }
        return false
    }
});
var Marshal = Class.New("Marshal");
Class.create("Scrolling", {
    main_el: null,
    scroll_el: [],
    scene: null,
    freeze: false,
    initialize: function(d, b, a) {
        this.scene = d;
        this.tile_h = b;
        this.tile_w = a
    },
    setMainElement: function(a) {
        this.main_el = a
    },
    addScroll: function(a) {
        if (!a.screen_x) {
            a.screen_x = 0
        }
        if (!a.screen_y) {
            a.screen_y = 0
        }
        if (!a.parallax_x) {
            a.parallax_x = 0
        }
        if (!a.parallax_y) {
            a.parallax_y = 0
        }
        this.scroll_el.push(a);
        if (this.main_el) {
            this.setScreen(a)
        }
        return this.scroll_el[this.scroll_el.length - 1]
    },
    setScreen: function(h, b, a) {
        var d, i;
        if (!b && this.main_el) {
            b = this.main_el.x;
            a = this.main_el.y
        }
        var e = this.scene.getCanvas();
        if (b <= e.width / 2) {
            d = 0
        } else {
            if (b + e.width / 2 >= h.width) {
                d = -(h.width - e.width)
            } else {
                d = -(b - e.width / 2 + (e.width / 2 % this.tile_w))
            }
        }
        if (a <= e.height / 2) {
            i = 0
        } else {
            if (a + e.height / 2 >= h.height) {
                i = -(h.height - e.height)
            } else {
                i = -(a - e.height / 2 + (e.height / 2 % this.tile_h))
            }
        }
        h.element.x = d;
        h.element.y = i;
        var k = this.tile_w / h.speed;
        var g = this.tile_h / h.speed;
        h.element.x = Math.floor(h.element.x / k) * k;
        h.element.y = Math.floor(h.element.y / g) * g;
        h.screen_x = Math.abs(h.element.x);
        h.screen_y = Math.abs(h.element.y);
        var f = this._multipleScreen(h.speed, h.screen_x, h.screen_y);
        h.screen_x = f.x;
        h.screen_y = f.y;
        this.update()
    },
    _multipleScreen: function(d, a, f) {
        var e = this.tile_w / d;
        var b = this.tile_h / d;
        a = Math.floor(a / e) * e;
        f = Math.floor(f / b) * b;
        return {
            x: a,
            y: f
        }
    },
    update: function() {
        var b, e;
        var f = this.scene.getCanvas();
        if (this.freeze) {
            return
        }
        if (!this.main_el) {
            return
        }
        for (var g = 0; g < this.scroll_el.length; g++) {
            b = this.scroll_el[g];
            e = {
                x: b.element.x,
                y: b.element.y
            };
            b.screen_x = this.main_el.x - f.width / 2 + (f.width / 2 % this.tile_w);
            b.screen_y = this.main_el.y - f.height / 2 + (f.height / 2 % this.tile_h);
            var k = Math.abs(e.x);
            var h = Math.abs(e.y);
            var d = b.speed;
            var a = b.speed;
            if (b.parallax) {
                if (b.screen_x != b.parallax_x) {
                    if (b.screen_x > b.parallax_x) {
                        e.x -= d
                    } else {
                        e.x += d
                    }
                    b.parallax_x = b.screen_x
                }
                if (b.screen_y != b.parallax_y) {
                    if (b.screen_y > b.parallax_y) {
                        e.y -= a
                    } else {
                        e.y += a
                    }
                    b.parallax_y = b.screen_y
                }
            } else {
                if (k != b.screen_x) {
                    if (b.screen_x > k) {
                        if (k > b.screen_x - d) {
                            e.x = -b.screen_x
                        } else {
                            e.x -= d
                        }
                    } else {
                        if (b.screen_x < k) {
                            if (k < b.screen_x + d) {
                                e.x = -b.screen_x
                            } else {
                                e.x += d
                            }
                        }
                    }
                }
                if (h != b.screen_y) {
                    if (b.screen_y > h) {
                        if (h > b.screen_y - a) {
                            e.y = -b.screen_y
                        } else {
                            e.y -= a
                        }
                    } else {
                        if (b.screen_y < h) {
                            if (h < b.screen_y + a) {
                                e.y = -b.screen_y
                            } else {
                                e.y += a
                            }
                        }
                    }
                }
            }
            if (b.block) {
                if (e.x > 0) {
                    b.screen_x = e.x = 0
                } else {
                    if (e.x + b.width < f.width) {
                        e.x = f.width - b.width;
                        e.x = this._multipleScreen(b.speed, e.x, 0).x;
                        b.screen_x = Math.abs(e.x)
                    }
                }
                if (e.y > 0) {
                    b.screen_y = e.y = 0
                } else {
                    if (e.y + b.height < f.height) {
                        e.y = f.height - b.height;
                        e.y = this._multipleScreen(b.speed, 0, e.y).y;
                        b.screen_y = Math.abs(e.y)
                    }
                }
            }
            if (f.width <= b.width) {
                b.element.x = e.x >> 0
            }
            if (f.height <= b.height) {
                b.element.y = e.y >> 0
            }
        }
    },
    mouseScroll: function(f, e, d) {
        d = d || {};
        if (e.height < f.height) {
            f.append(e);
            return this
        }
        var a = {};
        var b = this;
        e._forceEvent = true;
        f.beginPath();
        f.rect(0, 0, f.width, f.height);
        f.clip();
        f.closePath();
        e.rect(0, 0, e.width, e.height);
        e.on("dragstart", function(g) {
            a = this.offset();
            a.time = new Date().getTime();
            if (d.dragstart) {
                d.dragstart.call(this, g)
            }
        });
        e.on("drag", function(g) {
            if (g.direction == "up" || g.direction == "left") {
                g.distance = -g.distance
            }
            var i = 1,
                h;
            h = a.top + g.distance * i;
            if (h >= 0) {
                h = 0;
                if (d.onTop) {
                    d.onTop.call(this, g)
                }
            } else {
                if (f.height >= (h + this.height)) {
                    h = -this.height + f.height;
                    if (d.onBottom) {
                        d.onBottom.call(this, g)
                    }
                }
            }
            this.y = h;
            if (d.drag) {
                d.drag.call(this, g)
            }
        });
        e.on("dragend", function(g) {
            if (d.dragend) {
                d.dragend.call(this, g)
            }
        });
        f.append(e);
        return this
    }
});
var Scrolling = {
    Scrolling: {
        New: function() {
            return this["new"].apply(this, arguments)
        },
        "new": function(d, b, a) {
            return Class["new"]("Scrolling", [d, b, a])
        }
    }
};
Class.create("Spritesheet", {
    image: null,
    _set: {},
    initialize: function(a, b) {
        this.image = a;
        if (b) {
            this.set(b)
        }
    },
    set: function(n) {
        var k, a, m, l, h, g, f = Global_CE.Materials.get(this.image, "image");
        if (!f) {
            return false
        }
        for (var b in n) {
            if (b == "grid") {
                for (var e = 0; e < n.grid.length; e++) {
                    for (var d = 0; d < n.grid[e].set.length; d++) {
                        a = n.grid[e].set[d];
                        k = n.grid[e];
                        if (!k.tile) {
                            k.tile = [f.width / k.size[0], f.height / k.size[1]]
                        }
                        l = k.tile[1] * parseInt(d / Math.round(k.size[0]));
                        m = k.tile[0] * (d % Math.round(k.size[0]));
                        if (!k.reg) {
                            k.reg = [0, 0]
                        }
                        h = k.reg[0] || +"0";
                        g = k.reg[1] || +"0";
                        this._set[a] = [m, l, k.tile[0], k.tile[1], 0, h, g]
                    }
                }
            } else {
                this._set[b] = n[b]
            }
        }
    },
    exist: function(a) {
        return this._set[a] ? true : false
    },
    draw: function(e, i, b) {
        b = b || {};
        var f = this._set[i];
        if (!f) {
            throw "Spritesheet " + i + " don't exist"
        }
        var h = +(b.x || "0") - f[5],
            g = +(b.y || "0") - f[6],
            a = b.w || f[2],
            d = b.h || f[3];
        e.drawImage(this.image, f[0], f[1], f[2], f[3], h, g, a, d)
    },
    pattern: function(d, f, a) {
        if (!this._set[f]) {
            throw "Spritesheet " + f + " don't exist"
        }
        var e = this._set[f],
            b = Global_CE.Materials.cropImage(this.image, e[0], e[1], e[2], e[3]);
        pattern = d.getScene().getCanvas().createPattern(b, a);
        d.fillStyle = pattern
    }
});
var Spritesheet = {
    Spritesheet: {
        New: function() {
            return this["new"].apply(this, arguments)
        },
        "new": function(a, b) {
            return Class["new"]("Spritesheet", [a, b])
        }
    }
};
Class.create("Window", {
    border: null,
    width: 0,
    height: 0,
    bitmap: null,
    el: null,
    _content: null,
    _borders: {},
    _border_size: {
        width: 0,
        height: 0
    },
    initialize: function(e, d, a, b) {
        this.width = d;
        this.height = a;
        this.border = b;
        this.scene = e;
        if (b) {
            this.border_img = Global_CE.Materials.get(b);
            this._construct()
        } else {
            this.el = this.scene.createElement(this.width, this.height);
            this._content = this.scene.createElement();
            this.el.append(this._content)
        }
    },
    _construct: function() {
        if (!Global_CE.Spritesheet) {
            throw "Add Spritesheet class to use windows"
        }
        var f = ["corner_upleft", "up", "corner_upright", "left", "center", "right", "corner_bottomleft", "bottom", "corner_bottomright"],
            e, a;
        this.el = this.scene.createElement(this.width, this.height);
        this._border_size.width = this.border_img.width / 3;
        this._border_size.height = this.border_img.height / 3;
        this.spritesheet = Global_CE.Spritesheet["new"](this.border, {
            grid: [{
                size: [3, 3],
                tile: [this._border_size.width, this._border_size.height],
                set: f
            }]
        });
        this._content = this.scene.createElement();
        for (var d = 0; d < f.length; d++) {
            a = f[d];
            e = this._borders[a] = this.scene.createElement();
            if (/^corner/.test(a)) {
                this.spritesheet.draw(e, a)
            } else {
                this.spritesheet.pattern(e, a)
            }
            this.el.append(e)
        }
        this._borders.center.zIndex(0);
        this.el.append(this._content);
        this.size(this.width, this.height)
    },
    size: function(e, a) {
        var f = this._border_size.width,
            d = this._border_size.height;

        function b(g) {
            return (g < 0 ? 0 : g)
        }
        this._borders.up.x = f - 1;
        this._borders.up.fillRect(0, 0, e + 1 - f * 2, d);
        this._borders.corner_upright.x = e - f;
        this._borders.left.y = d;
        this._borders.left.fillRect(0, 0, f, b(a - d * 2));
        this._borders.right.x = e - f;
        this._borders.right.y = d;
        this._borders.right.fillRect(0, 0, f, b(a - d * 2));
        this._borders.corner_bottomleft.y = a - d;
        this._borders.bottom.x = f - 1;
        this._borders.bottom.y = a - d;
        this._borders.bottom.fillRect(0, 0, b(e + 1 - f * 2), d);
        this._borders.corner_bottomright.x = e - f;
        this._borders.corner_bottomright.y = a - d;
        this._borders.center.x = this._content.x = f - 1;
        this._borders.center.y = this._content.y = d;
        this._borders.center.fillRect(0, 0, b(e + 3 - f * 2), b(a - d * 2));
        this.el.width = e;
        this.el.height = a;
        this.el.setOriginPoint("middle");
        return this
    },
    position: function(b, e) {
        var a = this.scene.getCanvas(),
            d;
        if (b === undefined) {
            return {
                x: this.el.x,
                y: this.el.y
            }
        }
        if (e === undefined) {
            if (b == "middle") {
                this.el.x = a.width / 2 - this.width / 2;
                this.el.y = a.height / 2 - this.height / 2
            } else {
                if (b == "bottom") {
                    this.el.x = a.width / 2 - this.width / 2;
                    this.el.y = a.height - this.height - (a.height * 0.03)
                } else {
                    if (b == "top") {
                        this.el.x = a.width / 2 - this.width / 2;
                        this.el.y = a.height * 0.03
                    } else {
                        if (d = b.match(/top+([0-9]+)/)) {
                            this.el.x = a.width / 2 - this.width / 2;
                            this.el.y = d[1]
                        } else {
                            if (d = b.match(/bottom-([0-9]+)/)) {
                                this.el.x = a.width / 2 - this.width / 2;
                                this.el.y = a.height - d[1]
                            }
                        }
                    }
                }
            }
        } else {
            this.el.x = b;
            this.el.y = e
        }
        return this
    },
    setBackground: function(a, e, b) {
        var d;
        if (!e) {
            e = 0
        }
        b = b || 1;
        d = this._borders.center;
        d.x = e;
        d.y = e;
        d.fillStyle = a;
        d.opacity = b;
        d.fillRect(0, 0, this.width - e * 2, this.height - e * 2);
        return this
    },
    getBox: function() {
        return this.el
    },
    getContent: function() {
        return this._content
    },
    open: function(a) {
        a.append(this.el);
        return this
    },
    remove: function() {
        this.el.remove();
        return this
    },
    cursor: {
        array_elements: null,
        el: null,
        index: 0,
        params: {},
        _enable: true,
        init: function(a, b, d) {
            if (a instanceof Array) {
                b = a;
                a = null
            }
            this.params = CanvasEngine.extend(this.params, d);
            this.array_elements = b;
            this.el = a;
            this.update();
            return this
        },
        refresh: function(a, b) {
            this.array_elements = a;
            this.setIndex(this.index, b);
            this.update();
            return this
        },
        remove: function() {
            this.el.remove();
            return this
        },
        assignKeys: function(e) {
            var b = this;
            if (e) {
                Global_CE.Input.reset()
            }
            Global_CE.Input.press([Input.Up], function() {
                if (!b._enable) {
                    return
                }
                b.setIndex(b.index - 1)
            });
            Global_CE.Input.press([Input.Bottom], function() {
                if (!b._enable) {
                    return
                }
                b.setIndex(b.index + 1)
            });

            function f() {
                if (!b._enable) {
                    return
                }
                var g = b.array_elements[b.index];
                if (b._select && g) {
                    b._select.call(b, g)
                }
            }
            Global_CE.Input.press(this.params.enter, f);

            function a(g) {
                var h = this.array_elements[g];
                if (h.width && h.height && this._enable) {
                    h.forceEvent();
                    h.on("touch", function() {
                        b.setIndex(g);
                        b.update();
                        f()
                    })
                }
            }
            for (var d = 0; d < this.array_elements.length; d++) {
                a.call(this, d)
            }
            return this
        },
        getCurrentElement: function() {
            return this.array_elements[this.index]
        },
        setIndex: function(a, d) {
            var b = this.array_elements.length;
            if (a < 0) {
                a = this.params.reverse ? b - 1 : 0
            } else {
                if (a >= b) {
                    a = this.params.reverse ? 0 : b - 1
                }
            }
            this.index = a;
            this.update(true);
            return true
        },
        update: function(a) {
            if (this.el) {
                if (this.array_elements.length == 0) {
                    this.el.hide();
                    return
                } else {
                    this.el.show()
                }
            }
            var b = this.getCurrentElement(),
                d;
            if (b) {
                d = b.position();
                if (this.el) {
                    this.el.x = d.left;
                    this.el.y = d.top
                }
                if (a && this._onchange && this.array_elements.length > 0) {
                    this._onchange.call(this, b)
                }
            }
        },
        enable: function(a) {
            if (a != undefined) {
                this._enable = a;
                if (a) {
                    this.assignKeys()
                } else {
                    Global_CE.Input.reset([Input.Enter, Input.Up, Input.bottom])
                }
            }
            return this._enable
        },
        change: function(a) {
            this._onchange = a;
            return this
        },
        select: function(a) {
            this._select = a;
            return this
        }
    }
});
var Window = {
    Window: {
        New: function() {
            return this["new"].apply(this, arguments)
        },
        "new": function(e, d, a, b) {
            return Class["new"]("Window", [e, d, a, b])
        }
    }
};
if (typeof exports != "undefined") {
    var CE = require("canvasengine").listen(),
        CanvasEngine = false,
        Class = CE.Class
}
Class.create("Point", {
    initialize: function(b, a) {
        this.x = b;
        this.y = a
    }
});
Class.create("Polygon", {
    initialize: function(a) {
        this.points = [];
        this.center = a
    },
    addPoint: function(a) {
        this.points.push(a)
    },
    addAbsolutePoint: function(a) {
        this.points.push({
            x: a.x - this.center.x,
            y: a.y - this.center.y
        })
    },
    getNumberOfSides: function() {
        return this.points.length
    },
    rotate: function(b) {
        for (var d = 0; d < this.points.length; d++) {
            var a = this.points[d].x;
            var e = this.points[d].y;
            this.points[d].x = Math.cos(b) * a - Math.sin(b) * e;
            this.points[d].y = Math.sin(b) * a + Math.cos(b) * e
        }
    },
    containsPoint: function(a) {
        var l = this.points.length;
        var n = a.x;
        var m = a.y;
        var g = new Array();
        for (var b = 0; b < this.points.length; b++) {
            g.push(this.points[b].x + this.center.x)
        }
        var f = new Array();
        for (var k = 0; k < this.points.length; k++) {
            f.push(this.points[k].y + this.center.y)
        }
        var e, d = 0;
        var h = false;
        for (e = 0, d = l - 1; e < l; d = e++) {
            if (((f[e] > m) != (f[d] > m)) && (n < (g[d] - g[e]) * (m - f[e]) / (f[d] - f[e]) + g[e])) {
                h = !h
            }
        }
        return h
    },
    intersectsWith: function(g) {
        var f = Class.New("Point");
        var w, p, n, m, l;
        var e, v;
        var b = null;
        var a = 99999999;
        for (e = 0; e < this.getNumberOfSides(); e++) {
            if (e == 0) {
                f.x = this.points[this.getNumberOfSides() - 1].y - this.points[0].y;
                f.y = this.points[0].x - this.points[this.getNumberOfSides() - 1].x
            } else {
                f.x = this.points[e - 1].y - this.points[e].y;
                f.y = this.points[e].x - this.points[e - 1].x
            }
            w = Math.sqrt(f.x * f.x + f.y * f.y);
            f.x /= w;
            f.y /= w;
            p = n = this.points[0].x * f.x + this.points[0].y * f.y;
            for (v = 1; v < this.getNumberOfSides(); v++) {
                w = this.points[v].x * f.x + this.points[v].y * f.y;
                if (w > n) {
                    n = w
                } else {
                    if (w < p) {
                        p = w
                    }
                }
            }
            w = this.center.x * f.x + this.center.y * f.y;
            p += w;
            n += w;
            m = l = g.points[0].x * f.x + g.points[0].y * f.y;
            for (v = 1; v < g.getNumberOfSides(); v++) {
                w = g.points[v].x * f.x + g.points[v].y * f.y;
                if (w > l) {
                    l = w
                } else {
                    if (w < m) {
                        m = w
                    }
                }
            }
            w = g.center.x * f.x + g.center.y * f.y;
            m += w;
            l += w;
            if (n < m || p > l) {
                return false
            } else {
                var r = (n > m ? n - m : l - p);
                if (r < a) {
                    a = r;
                    b = {
                        x: f.x,
                        y: f.y
                    }
                }
            }
        }
        for (e = 0; e < g.getNumberOfSides(); e++) {
            if (e == 0) {
                f.x = g.points[g.getNumberOfSides() - 1].y - g.points[0].y;
                f.y = g.points[0].x - g.points[g.getNumberOfSides() - 1].x
            } else {
                f.x = g.points[e - 1].y - g.points[e].y;
                f.y = g.points[e].x - g.points[e - 1].x
            }
            w = Math.sqrt(f.x * f.x + f.y * f.y);
            f.x /= w;
            f.y /= w;
            p = n = this.points[0].x * f.x + this.points[0].y * f.y;
            for (v = 1; v < this.getNumberOfSides(); v++) {
                w = this.points[v].x * f.x + this.points[v].y * f.y;
                if (w > n) {
                    n = w
                } else {
                    if (w < p) {
                        p = w
                    }
                }
            }
            w = this.center.x * f.x + this.center.y * f.y;
            p += w;
            n += w;
            m = l = g.points[0].x * f.x + g.points[0].y * f.y;
            for (v = 1; v < g.getNumberOfSides(); v++) {
                w = g.points[v].x * f.x + g.points[v].y * f.y;
                if (w > l) {
                    l = w
                } else {
                    if (w < m) {
                        m = w
                    }
                }
            }
            w = g.center.x * f.x + g.center.y * f.y;
            m += w;
            l += w;
            if (n < m || p > l) {
                return false
            } else {
                var r = (n > m ? n - m : l - p);
                if (r < a) {
                    a = r;
                    b = {
                        x: f.x,
                        y: f.y
                    }
                }
            }
        }

        function h(i, k) {
            return {
                x: k.x + i.center.x,
                y: k.y + i.center.y
            }
        }
        var z, y, q = [],
            d = [],
            u = 0;

        function t(D, o, k) {
            var C, B, A, i, E = [];
            for (C = 0; C < g.getNumberOfSides(); C++) {
                B = h(g, g.points[C]);
                A = h(g, g.points[C + 1] ? g.points[C + 1] : g.points[0]);
                i = Polygon.intersectLineLine(o, k, B, A);
                if (i == "Coincident") {
                    E.push({
                        sides: C
                    })
                }
                d[u].push(i)
            }
            u++;
            return E
        }
        for (v = 0; v < this.getNumberOfSides(); v++) {
            d[u] = [];
            z = h(this, this.points[v]);
            y = h(this, this.points[v + 1] ? this.points[v + 1] : this.points[0]);
            q.push(t(null, z, y))
        }
        return {
            overlap: a + 0.001,
            axis: b,
            lines: d,
            coincident: q
        }
    }
});
var Polygon = {};
Polygon.intersectLineLine = function(f, d, k, i) {
    var g = (i.x - k.x) * (f.y - k.y) - (i.y - k.y) * (f.x - k.x);
    var h = (d.x - f.x) * (f.y - k.y) - (d.y - f.y) * (f.x - k.x);
    var e = (i.y - k.y) * (d.x - f.x) - (i.x - k.x) * (d.y - f.y);
    if (e != 0) {
        var b = g / e;
        var a = h / e;
        if (0 <= b && b <= 1 && 0 <= a && a <= 1) {
            return {
                x: f.x + b * (d.x - f.x),
                y: f.y + b * (d.y - f.y)
            }
        } else {
            return false
        }
    } else {
        if (g == 0 || h == 0) {
            return "Coincident"
        } else {
            return "Parallel"
        }
    }
};
Class.create("EntityModel", {
    x: 0,
    y: 0,
    _memorize: {
        x: 0,
        y: 0
    },
    hitState: {
        over: 0,
        out: 0
    },
    _polygon: {},
    _frame: "0",
    position: function(a, d) {
        if (a !== undefined && d !== undefined) {
            this.x = a;
            this.y = d;
            var b = this._polygon[this._frame];
            if (b) {
                b.center.x = this.x;
                b.center.y = this.y
            }
        }
        return {
            x: this.x,
            y: this.y
        }
    },
    savePosition: function() {
        this._memorize.x = this.x;
        this._memorize.y = this.y
    },
    restorePosition: function() {
        this.x = this._memorize.x;
        this.y = this._memorize.y
    },
    polygon: function(d) {
        if (d instanceof Array) {
            d = {
                "0": d
            }
        }
        for (var b in d) {
            this._polygon[b] = Class.New("Polygon", [{
                x: d[b][0][0],
                y: d[b][0][1]
            }]);
            for (var a = 0; a < d[b].length; a++) {
                this._polygon[b].addPoint({
                    x: d[b][a][0],
                    y: d[b][a][1]
                })
            }
        }
    },
    rect: function(a, e, b, d) {
        if (!b && !d) {
            b = a;
            d = e;
            a = 0;
            e = 0
        }
        if (!d) {
            d = b
        }
        this.polygon([
            [a, e],
            [a + b, e],
            [a + b, e + d],
            [a, e + d]
        ])
    },
    hit: function(b) {
        var a = this._polygon[this._frame].intersectsWith(b._polygon[b._frame]);
        this.hitState.result = a;
        if (a) {
            this.hitState.out = 0;
            this.hitState.over++
        } else {
            if (this.hitState.over > 0) {
                this.hitState.out = 1;
                this.hitState.over = 0
            } else {
                this.hitState.out = 0;
                this.hitState.over = 0
            }
        }
        return this.hitState
    },
    getPoints: function(a) {
        a = a || this._frame;
        return this._polygon[a].points
    },
    getPolygonReg: function(a) {
        a = a || this._frame;
        return this._polygon[a].center
    },
    getPolygon: function(a) {
        a = a || this._frame;
        return this._polygon[a]
    },
    frame: function(a) {
        if (a) {
            this._frame = a
        }
        return this._frame
    },
});
Class.create("Entity", {
    stage: null,
    params: {},
    el: null,
    mode: null,
    hit_entities: [],
    initialize: function(b, d, a) {
        if (a === undefined) {
            a = true
        }
        this.stage = b;
        this.params = d;
        this.el = this.stage.getScene().createElement();
        if (a) {
            this.setModel(Class.New("EntityModel"))
        }
        this.testHit()
    },
    setModel: function(a) {
        this.model = a
    },
    position: function(a, e, b) {
        var d = this.model.position(a, e);
        if (a !== undefined) {
            this.el.x = d.x;
            this.el.y = d.y
        }
        return {
            x: d.y,
            y: d.y
        }
    },
    move: function(a, d) {
        var b = this.model.position();
        if (!a) {
            a = 0
        }
        if (!d) {
            d = 0
        }
        return this.position(a + b.x, d + b.y, true)
    },
    polygon: function(a) {
        this.model.polygon(a)
    },
    rect: function(a, e, b, d) {
        this.model.rect(a, e, b, d);
        this.el.width = b;
        this.el.height = d
    },
    onHit: function(a, b, d) {
        this.hit_entities = this.hit_entities.concat(b);
        this.el.on("entity:hit:" + a, d)
    },
    testHit: function() {
        var a = this;
        this.el.attr("entity:testHit", function() {
            a.hit(a.hit_entities)
        })
    },
    testAnimHit: function() {
        var a = this;
        this.el.on("animation:draw", function(b) {})
    },
    hit: function(f, g) {
        var e, a = this;

        function b(h) {
            if (g) {
                g.call(a, h, a.el)
            }
            a.el.trigger("entity:hit:" + h, [a.el])
        }
        for (var d = 0; d < f.length; d++) {
            e = this.model.hit(f[d].model);
            if (e.over == 1) {
                b("over")
            } else {
                if (e.out == 1) {
                    b("out")
                }
            }
        }
    }
});
var Matrix = {};
Class.create("Grid", {
    _rows: 0,
    _cols: 0,
    cell: {
        width: 0,
        height: 0,
        prop: [],
    },
    _matrix: null,
    _transform: null,
    _func: null,
    initialize: function(a, b) {
        if (a instanceof Array) {
            this._matrix = a;
            this.cell.prop = a;
            b = a[0].length;
            a = a.length
        }
        this._rows = a;
        this._cols = b
    },
    transform: function(a) {
        this._func = a
    },
    convert: function(a, b) {
        if (!this._func) {
            return {
                x: a,
                y: b
            }
        }
        return this._func.call(this, a, b)
    },
    setPropertyCell: function(a) {
        if (typeof(PF) != "undefined") {
            this._pf_grid = false;
            this._pf_prop = (CanvasEngine || CE.Core).rotateMatrix(a)
        }
        this.cell.prop = a
    },
    getPropertyByCell: function(a, b) {
        if (!this.cell.prop[a]) {
            return undefined
        }
        return this.cell.prop[a][b]
    },
    setPropertyByCell: function(a, b, d) {
        if (!this.cell.prop[a]) {
            return undefined
        }
        this.cell.prop[a][b] = d;
        if (typeof(PF) != "undefined") {
            this._pf_grid = false;
            this._pf_prop = (CanvasEngine || CE.Core).rotateMatrix(this.cell.prop)
        }
        return this
    },
    getPropertyByPos: function(b, d) {
        var a = this.getCellByPos(b, d);
        return this.getPropertyByCell(a.col, a.row)
    },
    testCell: function(l, h, f) {
        f = f || {};
        if (!h.getPolygon) {
            h = h.model
        }
        var n = [],
            b = h.getPolygon(),
            m = this;

        function g(o, p) {
            return {
                x: p.x + o.center.x,
                y: p.y + o.center.y
            }
        }

        function e(w, q, p, o) {
            var u, A, y, C = [],
                t = 0,
                B, r = [],
                z = null,
                v = {};
            for (u = 0; u < o.getNumberOfSides(); u++) {
                A = g(o, o.points[u]);
                y = g(o, o.points[u + 1] ? o.points[u + 1] : o.points[0]);
                B = Polygon.intersectLineLine(q, p, A, y);
                if (B == "Coincident") {
                    if (q.x == A.x && q.y == A.y) {
                        z = {
                            x: q.x,
                            y: q.y
                        }
                    } else {
                        if (p.x == y.x && p.y == y.y) {
                            z = {
                                x: p.x,
                                y: p.y
                            }
                        } else {
                            if (q.x == y.x && q.y == y.y) {
                                z = {
                                    x: q.x,
                                    y: q.y
                                }
                            } else {
                                if (p.x == A.x && p.y == A.y) {
                                    z = {
                                        x: p.x,
                                        y: p.y
                                    }
                                }
                            }
                        }
                    }
                    r.push({
                        sides: u,
                        points: z
                    })
                }
            }
            if (true) {
                return r
            } else {
                v[w] = r;
                return v
            }
        }

        function k(o) {
            return {
                x: o.x * m.cell.width,
                y: o.y * m.cell.height
            }
        }
        if (!l.getPolygon) {
            h = h.model
        }
        var i = [{
            y: l.row,
            x: l.col
        }, {
            y: l.row,
            x: l.col + 1
        }, {
            y: l.row + 1,
            x: l.col + 1
        }, {
            y: l.row + 1,
            x: l.col
        }];
        var d, a;
        for (j = 0; j < i.length; j++) {
            d = k(i[j]);
            a = k(i[j + 1] ? i[j + 1] : i[0]);
            n.push(e(null, d, a, b))
        }
        return n
    },
    getEntityCells: function(k, g) {
        var l, h, d, q, e, a, n, m, b = [],
            t = {
                min_x: 99999999,
                max_x: 0,
                min_y: 99999999,
                max_y: 0
            };
        g = g || {};
        if (k.model) {
            q = k.model.getPoints();
            e = k.model.getPolygonReg();
            a = k.model.getPolygon()
        } else {
            q = k.getPoints();
            e = k.getPolygonReg();
            a = k.getPolygon()
        }
        for (l = 0; l < q.length; l++) {
            d = q[l];
            n = d.x + e.x;
            m = d.y + e.y;
            if (n < t.min_x) {
                t.min_x = n
            }
            if (n > t.max_x) {
                t.max_x = n
            }
            if (m < t.min_y) {
                t.min_y = m
            }
            if (m > t.max_y) {
                t.max_y = m
            }
        }
        var o = [this.getCellByPos(t.min_x, t.min_y), this.getCellByPos(t.max_x, t.min_y), this.getCellByPos(t.max_x, t.max_y), this.getCellByPos(t.min_x, t.max_y)];
        var f = o[2].row - o[0].row,
            r = o[1].col - o[0].col;
        for (l = 0; l < r - 1; l++) {
            for (h = 0; h < f - 1; h++) {
                o.push({
                    row: o[0].row + h,
                    col: o[0].col + l
                })
            }
        }
        return {
            cells: o
        }
    },
    getCellByPos: function(a, e) {
        if (this.cell.width == 0 || this.cell.height == 0) {
            throw "Set the size of the cell prior with setCellSize method"
        }
        var b = Math.floor(this.convert(a, e).x / this.cell.width),
            d = Math.floor(this.convert(a, e).y / this.cell.height);
        return {
            col: b,
            row: d
        }
    },
    setCellSize: function(a, b) {
        this.cell.width = a;
        this.cell.height = b
    },
    getRows: function() {
        return this._rows
    },
    getCols: function() {
        return this._cols
    },
    getNbCell: function() {
        return this.getRows() * this.getCols()
    },
    passableCell: function(h, g, t, o) {
        o = o || [];
        var k = this._cols;
        var z = this._rows;
        var m = this.cell.prop;
        var p = [];

        function d() {
            for (var E = 0; E < k * 2 + 1; E++) {
                p[E] = [];
                for (var D = 0; D < k * 2 + 1; D++) {
                    p[E][D] = -1
                }
            }
            var y = Math.floor(p.length / 2);
            p[y][y] = 0
        }
        var A = [];
        var b = [
            [h, g]
        ];
        var l = 0;
        var f = b[0][0] - k;
        var e = b[0][1] - k;
        var B = [];
        var n = 0;
        d();

        function w(i, E) {
            for (var D = 0; D < o.length; D++) {
                if (o[D][0] == i && o[D][1] == E) {
                    return true
                }
            }
            return false
        }
        while (!b.length == 0 && l < t) {
            A = [];
            for (var r = 0; r < b.length; r++) {
                var v = b[r][0];
                var u = b[r][1];
                var a = v;
                var C = u;
                for (var q = 0; q < 4; q++) {
                    switch (q) {
                        case 0:
                            if (m[v][u + 1] != undefined && m[v][u + 1] == n && !w(v, u + 1) && p[a][C + 1] == -1) {
                                A.push([v, u + 1]);
                                B.push([v, u + 1]);
                                p[a][C + 1] = 0
                            }
                            break;
                        case 1:
                            if (m[v + 1] != undefined && m[v + 1][u] != undefined && m[v + 1][u] == n && !w(v + 1, u) && p[a + 1][C] == -1) {
                                A.push([v + 1, u]);
                                B.push([v + 1, u]);
                                p[a + 1][C] = 0
                            }
                            break;
                        case 2:
                            if (m[v][u - 1] != undefined && m[v][u - 1] == n && !w(v, u - 1) && p[a][C - 1] == -1) {
                                A.push([v, u - 1]);
                                B.push([v, u - 1]);
                                p[a][C - 1] = 0
                            }
                            break;
                        case 3:
                            if (m[v - 1] != undefined && m[v - 1][u] != undefined && m[v - 1][u] == n && !w(v - 1, u) && p[a - 1][C] == -1) {
                                A.push([v - 1, u]);
                                B.push([v - 1, u]);
                                p[a - 1][C] = 0
                            }
                            break
                    }
                }
            }
            b = A;
            l += 1
        }
        return B
    },
    pathfinding: function(d, g, b, f, e, a) {
        e = e || "AStarFinder";
        if (!this._pf_grid) {
            this._pf_grid = new PF.Grid(this._rows, this._cols, this._pf_prop)
        }
        if (d === undefined) {
            return this._pf_grid
        }
        return new PF[e](a).findPath(d, g, b, f, this._pf_grid.clone())
    }
});
var Hit = {
    Grid: {
        "new": function(a, b) {
            return Class.New("Grid", [a, b])
        }
    }
};
if (typeof exports != "undefined") {
    exports.Class = Hit
}
Class.create("Effect", {
    scene: null,
    el: null,
    canvas: null,
    initialize: function(b, a) {
        this.scene = b;
        this.el = a;
        this.canvas = this.scene.getCanvas();
        if (!Global_CE.Timeline) {
            throw "Add Timeline class to use effects"
        }
        return this
    },
    screenFlash: function(a, f, g) {
        var d = this.scene.createElement(),
            b = this.scene.getCanvas();
        d.fillStyle = a;
        d.fillRect(0, 0, b.width, b.height);
        d.opacity = 0.8;
        this.scene.getStage().append(d);
        d.zIndex(-1);
        var e = Global_CE.Timeline["new"](d);
        e.to({
            opacity: "0"
        }, f).call(function() {
            d.remove();
            if (g) {
                g()
            }
        })
    },
    blink: function(d, b, f) {
        var e = 0;
        var a = function() {
            d--;
            e++;
            if (e >= b) {
                e = 0;
                this.toggle()
            }
            if (d <= 0) {
                this.off("canvas:render", a);
                this.show();
                if (f) {
                    f()
                }
            }
        };
        this.el.on("canvas:render", a)
    },
    shake: function(d, e, h, b, i) {
        if (typeof b == "function") {
            i = b;
            b = false
        }
        var g = 0,
            f = 1;
        b = b || "x";
        var a = function() {
            var k = (d * e * f) / 10;
            if (h <= 1 && g * (g + k) < 0) {
                g = 0
            } else {
                g += k
            }
            if (g > d * 2) {
                f = -1
            }
            if (g < -d * 2) {
                f = 1
            }
            if (h >= 1) {
                h -= 1
            }
            if (/x/.test(b)) {
                this.x = g
            }
            if (/y/.test(b)) {
                this.y = g
            }
            if (h == 0) {
                this.off("canvas:render", a);
                if (i) {
                    i()
                }
            }
            console.log(k)
        };
        this.el.on("canvas:render", a)
    },
    changeScreenColorTone: function(a, e, g, d, f) {
        var b = false;
        if (this.tone) {
            this.tone.remove();
            delete this.tone;
            b = true;
            if (a == "reset") {
                return
            }
        }
        this.tone = this.scene.createElement(), canvas = this.scene.getCanvas();
        this.tone.fillStyle = a;
        this.tone.fillRect(0, 0, canvas.width, canvas.height);
        this.tone.opacity = 0;
        this.tone.globalCompositeOperation = g;
        this.scene.getStage().append(this.tone);
        this.tone.zIndex(-1);
        if (!b) {
            this.tone.opacity = 0;
            if (e > 0) {
                Global_CE.Timeline["new"](this.tone).to({
                    opacity: d
                }, e).call(f)
            } else {
                this.tone.opacity = d
            }
        }
    },
    _weather: function(i, b) {
        if (b.intensity == "stop") {
            clearInterval(this._weather_.timer);
            this._weather_.state = "stop";
            return
        }
        var a = b.intensity || 100;
        var e = 0;
        var f = this.scene.getStage(),
            m = this;
        this._weather_ = {
            number: 0,
            numberStop: 0,
            state: "loop"
        };
        var k = this.el.width || this.canvas.width,
            d = this.el.height || this.canvas.height;
        var l = setInterval(function() {
            if (m._weather_.number == a) {
                clearInterval(l);
                return
            }
            var n = m.scene.createElement();
            n.x = CanvasEngine.random(0, k);
            n.y = -10;
            var h;
            if (i == "rain") {
                n.attr("drift", 0);
                n.attr("speed", CanvasEngine.random(4, 6)) * 8;
                n.width = n.height = CanvasEngine.random(2, 6) * 5;
                h = m.canvas.createRadialGradient(n.height / 2, n.height / 2, 0, n.height / 2, n.height / 2, n.height);
                h.addColorStop(0, "rgba(125, 125, 255, 1)");
                h.addColorStop(1, "rgba(125, 125, 255, 0)");
                n.beginPath();
                n.moveTo(0, 0);
                n.lineTo(e, n.height);
                n.strokeStyle = h;
                n.stroke()
            } else {
                if (i = "snow") {
                    n.attr("drift", Math.random());
                    n.attr("speed", CanvasEngine.random(1, 6));
                    n.width = n.height = CanvasEngine.random(2, 6);
                    if (b.use_gradient) {
                        h = m.canvas.createRadialGradient(0, 0, 0, 0, 0, n.width);
                        h.addColorStop(0, "rgba(255, 255, 255, 1)");
                        h.addColorStop(1, "rgba(255, 255, 255, 0)")
                    } else {
                        h = "white"
                    }
                    n.fillStyle = h;
                    n.fillCircle()
                }
            }
            n.name = "weather";
            m.el.append(n);
            m._weather_.number++
        }, 200);
        this._weather_.timer = l;
        var g = function(h) {
            if (h.name != "weather") {
                return
            }
            if (m._weather_.state == "finish") {
                m.el.empty();
                m.el.off("canvas:refresh", g);
                return
            }
            if (h.attr("flake_state") == "stop") {
                return
            }
            if (h.y < d) {
                h.y += h.attr("speed")
            }
            if (h.y > d - 3) {
                h.y = i == "snow" ? -5 : -30;
                if (m._weather_.state == "stop") {
                    h.attr("flake_state", "stop");
                    m._weather_.numberStop++;
                    if (m._weather_.number == m._weather_.numberStop) {
                        m._weather_.state = "finish"
                    }
                    return
                }
            }
            h.x += h.attr("drift");
            if (h.x > k) {
                h.x = 0
            }
        };
        this.el.on("canvas:refresh", g);
        return this
    },
    rain: function(a) {
        return this._weather("rain", {
            intensity: a
        })
    },
    snow: function(a, b) {
        return this._weather("snow", {
            intensity: a,
            use_gradient: b
        })
    },
    storm: function(a, f, d) {
        var b = this;
        d = d || "#FCFFE6";
        this.rain(a);
        if (a == "stop") {
            return this
        }

        function e() {
            var g = CanvasEngine.random(4, 10);
            setTimeout(function() {
                if (b._weather_.state == "loop") {
                    if (f) {
                        f()
                    }
                    b.screenFlash(d, 10);
                    e()
                }
            }, g * 1000)
        }
        e()
    },
    particles: function() {}
});
var Effect = {
    Effect: {
        New: function() {
            return this["new"].apply(this, arguments)
        },
        "new": function(b, a) {
            return Class["new"]("Effect", [b, a])
        }
    }
};
Class.create("Text", {
    scene: null,
    text: "",
    el: null,
    _family: null,
    _style: {
        size: "20px",
        family: "Arial",
        weight: "normal",
        style: "normal",
        variant: "normal",
        color: "#000",
        transform: "none",
        decoration: "none",
        border: "none",
        lineHeight: 25,
        shadow: null,
        textBaseline: "alphabetic",
        lineWidth: null
    },
    lines: [],
    initialize: function(a, b) {
        this.scene = a;
        this.construct(b)
    },
    construct: function(a) {
        a = "" + a;
        this.el = this.scene.createElement();
        a = this._transformHTML(a);
        this.text = a.split("\n");
        this.lines = []
    },
    _transformHTML: function(a) {
        a = a.replace(/<br>/g, "\n");
        return a
    },
    setImageText: function(d, g, b, a) {
        var e = this.scene.createElement();
        if (!Global_CE.Spritesheet) {
            throw "Add Spritesheet class to use setImageText method"
        }
        a = a || {
            rows: 1,
            cols: 1
        };
        var f = Global_CE.Spritesheet.New(d, {
            grid: [{
                size: a,
                tile: [b.width, b.height],
                set: g
            }]
        });
        this._family = f
    },
    style: function(b) {
        if (b.size & !b.lineHeight) {
            b.lineHeight = b.size
        }
        for (var a in b) {
            this._style[a] = b[a]
        }
        return this
    },
    draw: function(k, m, l, t) {
        if (t && !Global_CE.Timeline) {
            throw "Add Timeline class to use effects"
        }
        if (!t) {
            t = {}
        }
        if (!m) {
            m = 0
        }
        if (!l) {
            l = 0
        }
        var q = this._style,
            B, p, A, a = 0,
            h, g = "",
            f;
        var d = this.scene.getCanvas(),
            u = this;
        this.el.x = m;
        this.el.y = l;

        function C(y, i, n) {
            h = parseInt(q.lineHeight);
            h *= parseInt(q.size) / 20;
            a = h * y;
            i.font = q.style + " " + q.weight + " " + q.variant + " " + q.size + " " + q.family;
            i.fillStyle = q.color;
            i.textBaseline = q.textBaseline;
            if (q.shadow) {
                f = q.shadow.match(/(-?[0-9]+) (-?[0-9]+) ([0-9]+) ([#a-zA-Z0-9]+)/);
                if (f) {
                    i.shadowOffsetX = f[1];
                    i.shadowOffsetY = f[2];
                    i.shadowBlur = f[3];
                    i.shadowColor = f[4]
                }
            }
            i.fillText(n, 0, a);
            if (q.border != "none") {
                B = q.border.match(/([0-9]+)px ([#a-zA-Z0-9]+)/);
                i.font = q.style + " " + q.weight + " " + q.variant + " " + (q.size + B[1]) + " " + q.family;
                i.strokeStyle = B[2];
                i.strokeText(n, 0, a)
            }
            return i
        }

        function r(y, n) {
            var i = u.scene.createElement();
            C(y, i, n);
            u.lines.push({
                text: n,
                el: i,
                chars: []
            });
            i.opacity = 0
        }

        function b(K, n, H) {
            var L = this.lines[K].el;
            if (n >= this.lines[K].text.length) {
                H();
                for (var G = 0; G < this.lines[K].chars.length; G++) {
                    this.lines[K].chars[G].el.remove()
                }
                this.el.append(L);
                L.opacity = 1;
                this.lines[K].el.opacity = 1;
                if (t._char.onFinish) {
                    t._char.onFinish()
                }
                return
            }
            var F = this.scene.createElement(),
                I = this.lines[K].text[n],
                y = d.measureText(I).width,
                J = this;
            C(K, F, I);
            F.x = n * y;
            F.opacity = 0;
            this.el.append(F);
            this.lines[K].chars.push({
                _char: I,
                el: F
            });
            Global_CE.Timeline["new"](F).to({
                opacity: 1
            }, t._char.frames).call(function() {
                if (t._char.onEffect) {
                    t._char.onEffect(I, F)
                }
                b.call(J, K, n + 1, H)
            })
        }

        function z(y) {
            var i = this,
                n;
            if (y >= this.lines.length) {
                if (t.line && t.line.onFinish) {
                    t.line.onFinish()
                }
                return
            }
            n = this.lines[y].el;
            if (t.line) {
                this.el.append(n);
                Global_CE.Timeline["new"](n).to({
                    opacity: 1
                }, t.line.frames).call(function() {
                    if (t.line.onEffect) {
                        t.line.onEffect(i.lines[y].text, n)
                    }
                    z.call(i, y + 1)
                })
            } else {
                if (t._char) {
                    b.call(this, y, 0, function() {
                        z.call(i, y + 1)
                    })
                } else {
                    n.opacity = 1;
                    this.el.append(n);
                    z.call(this, y + 1)
                }
            }
        }
        var A, E, o, v, e = 0;
        for (var D = 0; D < this.text.length; D++) {
            p = this.text[D];
            if (q.lineWidth) {
                o = d.measureText(p, q.size, q.family).width;
                g = "";
                v = p.split(" ");
                for (var w = 0; w < v.length; w++) {
                    E = g + v[w] + " ";
                    A = d.measureText(E, q.size, q.family);
                    o = A.width;
                    if (o > q.lineWidth) {
                        r(e, g);
                        g = v[w] + " ";
                        e++
                    } else {
                        g = E
                    }
                }
                if (o < q.lineWidth) {
                    r(e, g);
                    e++
                }
            } else {
                r(D, p)
            }
        }
        z.call(this, 0);
        k.append(this.el);
        this.parent = k;
        this.pos = {
            x: m,
            y: l
        };
        return this
    },
    refresh: function(a) {
        if (!this.parent) {
            throw "Use 'draw' method before"
        }
        this.parent.empty();
        this.construct(a);
        this.draw(this.parent, this.pos.x, this.pos.y);
        return this
    },
    getNumberLines: function() {
        return this.lines.length
    }
});
var Text = {
    Text: {
        New: function() {
            return this["new"].apply(this, arguments)
        },
        "new": function(a, b) {
            return Class["new"]("Text", [a, b])
        }
    }
};