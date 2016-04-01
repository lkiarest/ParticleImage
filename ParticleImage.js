/*
The MIT License (MIT)

Copyright (c) 2015 arest

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Add particle animation for image
 * usage:
        <script type="text/javascript" src="ParticleImage.js"></script>
        <script>
            window.onload = function() {
                // be sure to use image file in your own server (prevent CORS issue)
                ParticleImage.create("logo", "logo_s2.png", "fast");
            };
        </script>
        // in html file
        <div id="logo"></div>
        // you can set default background image as usual
        #logo {
            margin-left:20px;
            margin-top:20px;
            width:160px;
            height:48px;
            background:url('logo_s2.png');
        }
 *
 * @author tianx.qin (rushi_wowen@163.com)
 * @file ParticleImage.js
 * @version 0.9
 */
var ParticleImage = (function(window) {
    var container = null, canvas = null;
    var ctx = null, _spirit = [], timer = null,
        cw = 0, ch = 0, // container width/height
        iw = 0, ih = 0, // image width/height
        mx = 0, my = 0, // mouse position
        bMove = true,
        MOVE_SPAN = 4, DEFAULT_ALPHA = 100,
        speed = 100, S = {"fast":10, "mid":100, "low":300},
        ALPHA = 255 * 255;

    // spirit class
    var Spirit = function(data) {
        this.orginal = {
            pos: data.pos,
            x : data.x, y : data.y,
            r : data.r, g : data.g, b : data.b, a : data.a
        };
        // change state, for animation
        this.current = {
            x : data.x,
            y : data.y,
            a : data.a
        };
    };

    /**
     * move spirit to original position
     */
    Spirit.prototype.move = function() {
        var cur = this.current, orig = this.orginal;
        if ((cur.x === orig.x) && (cur.y === orig.y)) {
            //console.log("don't move:" + cur.y);
            return false;
        }
        //console.log("move:" + cur.y);
        var rand = 1 + Math.round(MOVE_SPAN * Math.random());
        var offsetX = cur.x - orig.x,
            offsetY = cur.y - orig.y;
        var rad = offsetX == 0 ? 0 : offsetY / offsetX;
        var xSpan = cur.x < orig.x ? rand : cur.x > orig.x ? -rand : 0;
        cur.x += xSpan;
        var tempY = xSpan == 0 ? Math.abs(rand) : Math.abs(Math.round(rad * xSpan));
        var ySpan = offsetY < 0 ? tempY : offsetY > 0 ? -tempY : 0;
        cur.y += ySpan;
        cur.a = ((cur.x === orig.x) && (cur.y === orig.y))  ? orig.a : DEFAULT_ALPHA;
        return true;
    };

    /**
     * set random position
     */
    Spirit.prototype.random = function(width, height) {
        var cur = this.current;
        cur.x = width + Math.round(width * 2 * Math.random());
        this.current.y = height + Math.round(height * 2 * Math.random());
    };

    /**
     * set random positions for all spirits
     */
    var _disorder = function() {
        var len = _spirit.length;
        for (var i = 0; i < len; i++) {
            _spirit[i].random(cw, ch);
        }
    };

    /**
     * start to move spirit
     */
    var _move = function() {
        var sprt = _spirit;
        var len = sprt.length;
        var isMove = false; // whether need to move
        for (var i = 0; i < len; i++) {
            if (sprt[i].move()) {
                isMove = true;
            }
        }
        isMove ? _redraw() : _stopTimer();
    };

    /**
     * redraw all spirits while animating
     */
    var _redraw = function() {
        var imgDataObj = ctx.createImageData(iw, ih);
        var imgData = imgDataObj.data;
        var sprt = _spirit;
        var len = sprt.length;
        //console.log("redraw image : " + len);
        for (var i = 0; i < len; i++) {
            var temp = sprt[i];
            //console.log("item : " + JSON.stringify(temp));
            var orig = temp.orginal;
            var cur = temp.current;
            var pos = (cur.y * iw + cur.x) * 4;
            imgData[pos] = orig.r;
            imgData[pos + 1] = orig.g;
            imgData[pos + 2] = orig.b;
            imgData[pos + 3] = cur.a;
        }
        ctx.putImageData(imgDataObj, 0, 0);
    };

    /**
     * add mousemove/mouseclick event
     */
    var _addMouseEvent = function(c) {
        c.addEventListener("mouseenter", function(e) {
            //console.log("e.y:" + e.clientY + ", " + container.offsetTop);
            _startTimer();
        });
        c.addEventListener("click", function() {
            // disorder all spirits and start animation
            _startTimer();
        });
    };

    /**
     * calculate all pixels of the logo image
     */
    var _checkImage = function(imgUrl, callback) {
        // var tempCanvas = document.getElementById("temp");
        //canvas.width = width;
        //canvas.height = height;

        var proc = function(image) {
            var w = image.width, h = image.height;
            iw = w, ih = h;
            //console.log("proc image " + image + "," + w + "," + h);
            canvas = _createCanvas();
            // hide container background
            container.style.backgroundPosition = (-w) + "px";
            container.style.backgroundRepeat = "no-repeat";
            ctx.drawImage(image, 0, 0);
            // this may cause security error for CORS issue
            try {
                var imgData = ctx.getImageData(0, 0, w, h);
                var arrData = imgData.data;
                for (var i = 0; i < arrData.length; i += 4) {
                    var r = arrData[i], g = arrData[i + 1], b = arrData[i + 2], a = arrData[i + 3];
                    if (r > 0 || g > 0 || b > 0 || a > 0) {
                        var pos = i / 4;
                        _spirit.push(new Spirit({
                            x : pos % w, y : Math.floor(pos / w), 
                            r : r, g : g, b : b, a : a
                        }));
                    }
                }
                return true;
            } catch (e) {
                // do nothing
                return false;
            }
            //return out;
        };

        var img = new Image();
        img.src = imgUrl;
        if (img.complete || img.complete === undefined) {
            proc(img) && callback && callback();
        } else {
            img.onload = function() {
                proc(img) && callback && callback();
            };
        }
    };

    // use "requestAnimationFrame" to create a timer, need browser support
    var _timer = function(func, dur) {
        //console.log("speed is " + dur);
        var timeLast = null;
        var bStop = false;
        var bRunning = false; // prevent running more than once
        var _start = function() {
            if (func) {
                if (! timeLast) {
                    timeLast = Date.now();
                    func();
                } else {
                    var current = Date.now();
                    if (current - timeLast >= dur) {
                        timeLast = current;
                        func();
                    }
                }
            }

            if (bStop) {
                return;
            }
            requestAnimationFrame(_start);
        };

        var _stop = function() {
            bStop = true;
        };

        return {
            start : function() {
                if (bRunning) {
                    //console.log("already running..");
                    return;
                }
                //console.log("start running..");
                bRunning = true;
                bStop = false;
                _disorder();
                _start();
            },
            stop : function() {
                _stop();
                bRunning = false;
            }
        };
    };

    var _startTimer = function() {
        if (! timer) {
            timer = _timer(function() {
                bMove && _move();
            }, speed);
        }
        timer.start();
    };

    var _stopTimer = function() {
        timer && timer.stop();
    };

    /**
     * start process
     */
    var _create = function(imgUrl) {
        _checkImage(imgUrl, function() {
            //_createSpirits();
            _addMouseEvent(canvas);
            //_startTimer();
        });
    };

    var _setSpeed = function(s) {
        S[s] && (speed = S[s]);
    };

    /**
     * check whether browser supports canvas
     */
    var _support = function() {
        try {
            document.createElement("canvas").getContext("2d");
            return true;
        } catch (e) {
            return false;
        }
    };

    /**
     * create a canvas element
     */
    var _createCanvas = function() {
        var cav = document.createElement("canvas");
        cav.width = iw;
        cav.height = ih;
        container.appendChild(cav);
        ctx = cav.getContext("2d");
        return cav;
    };

    /**
     * initialize container params
     */
    var _init = function(c, s) {
        if ((! c) || (! _support())) { // DIV id doesn't exist
            return false;
        }
        container = c;
        cw = c.clientWidth;
        ch = c.clientHeight;
        s && _setSpeed(s);
        return true;
    };

    /**
     * export
     */
    return {
        "create" : function(cId, imgUrl, s) { // user can set move speed by 's'['fast','mid','low']
            _init(document.getElementById(cId), s) && _create(imgUrl);
        }
    };
})(window);
