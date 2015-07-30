// See license: https://github.com/erkie/erkie.github.com/blob/master/README
// Modified for the Atom editor environment by Tom Preston-Werner.

startAsteroids = function () {
	function Asteroids() {
		if (!window.ASTEROIDS) window.ASTEROIDS = {
			enemiesKilled: 0,
			startedPlaying: new Date().getTime()
		};

		/*
  	Classes
  */

		function Vector(x, y) {
			if (typeof x == "Object") {
				this.x = x.x;
				this.y = x.y;
			} else {
				this.x = x;
				this.y = y;
			}
		};

		Vector.prototype = {
			cp: function cp() {
				return new Vector(this.x, this.y);
			},

			mul: function mul(factor) {
				this.x *= factor;
				this.y *= factor;
				return this;
			},

			mulNew: function mulNew(factor) {
				return new Vector(this.x * factor, this.y * factor);
			},

			add: function add(vec) {
				this.x += vec.x;
				this.y += vec.y;
				return this;
			},

			addNew: function addNew(vec) {
				return new Vector(this.x + vec.x, this.y + vec.y);
			},

			sub: function sub(vec) {
				this.x -= vec.x;
				this.y -= vec.y;
				return this;
			},

			subNew: function subNew(vec) {
				return new Vector(this.x - vec.x, this.y - vec.y);
			},

			// angle in radians
			rotate: function rotate(angle) {
				var x = this.x,
				    y = this.y;
				this.x = x * Math.cos(angle) - Math.sin(angle) * y;
				this.y = x * Math.sin(angle) + Math.cos(angle) * y;
				return this;
			},

			// angle still in radians
			rotateNew: function rotateNew(angle) {
				return this.cp().rotate(angle);
			},

			// angle in radians... again
			setAngle: function setAngle(angle) {
				var l = this.len();
				this.x = Math.cos(angle) * l;
				this.y = Math.sin(angle) * l;
				return this;
			},

			// RADIANS
			setAngleNew: function setAngleNew(angle) {
				return this.cp().setAngle(angle);
			},

			setLength: function setLength(length) {
				var l = this.len();
				if (l) this.mul(length / l);else this.x = this.y = length;
				return this;
			},

			setLengthNew: function setLengthNew(length) {
				return this.cp().setLength(length);
			},

			normalize: function normalize() {
				var l = this.len();
				this.x /= l;
				this.y /= l;
				return this;
			},

			normalizeNew: function normalizeNew() {
				return this.cp().normalize();
			},

			angle: function angle() {
				return Math.atan2(this.y, this.x);
			},

			collidesWith: function collidesWith(rect) {
				return this.x > rect.x && this.y > rect.y && this.x < rect.x + rect.width && this.y < rect.y + rect.height;
			},

			len: function len() {
				var l = Math.sqrt(this.x * this.x + this.y * this.y);
				if (l < 0.005 && l > -0.005) {
					return 0;
				}return l;
			},

			is: function is(test) {
				return typeof test == "object" && this.x == test.x && this.y == test.y;
			},

			toString: function toString() {
				return "[Vector(" + this.x + ", " + this.y + ") angle: " + this.angle() + ", length: " + this.len() + "]";
			}
		};

		function Line(p1, p2) {
			this.p1 = p1;
			this.p2 = p2;
		};

		Line.prototype = {
			shift: function shift(pos) {
				this.p1.add(pos);
				this.p2.add(pos);
			},

			intersectsWithRect: function intersectsWithRect(rect) {
				var LL = new Vector(rect.x, rect.y + rect.height);
				var UL = new Vector(rect.x, rect.y);
				var LR = new Vector(rect.x + rect.width, rect.y + rect.height);
				var UR = new Vector(rect.x + rect.width, rect.y);

				if (this.p1.x > LL.x && this.p1.x < UR.x && this.p1.y < LL.y && this.p1.y > UR.y && this.p2.x > LL.x && this.p2.x < UR.x && this.p2.y < LL.y && this.p2.y > UR.y) {
					return true;
				}if (this.intersectsLine(new Line(UL, LL))) {
					return true;
				}if (this.intersectsLine(new Line(LL, LR))) {
					return true;
				}if (this.intersectsLine(new Line(UL, UR))) {
					return true;
				}if (this.intersectsLine(new Line(UR, LR))) {
					return true;
				}return false;
			},

			intersectsLine: function intersectsLine(line2) {
				var v1 = this.p1,
				    v2 = this.p2;
				var v3 = line2.p1,
				    v4 = line2.p2;

				var denom = (v4.y - v3.y) * (v2.x - v1.x) - (v4.x - v3.x) * (v2.y - v1.y);
				var numerator = (v4.x - v3.x) * (v1.y - v3.y) - (v4.y - v3.y) * (v1.x - v3.x);

				var numerator2 = (v2.x - v1.x) * (v1.y - v3.y) - (v2.y - v1.y) * (v1.x - v3.x);

				if (denom == 0) {
					return false;
				}
				var ua = numerator / denom;
				var ub = numerator2 / denom;

				return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
			}
		};

		/*
  	end classes, begin code
  */

		var that = this;

		// configuration directives are placed in local variables
		var w = document.documentElement.clientWidth,
		    h = document.documentElement.clientHeight;

		var playerWidth = 20,
		    playerHeight = 30;

		var playerVerts = [[-1 * playerHeight / 2, -1 * playerWidth / 2], [-1 * playerHeight / 2, playerWidth / 2], [playerHeight / 2, 0]];

		var ignoredTypes = ["HTML", "HEAD", "BODY", "SCRIPT", "TITLE", "META", "STYLE", "LINK"];
		var hiddenTypes = ["BR", "HR"];

		var FPS = 50;

		// units/second
		var acc = 300;
		var maxSpeed = 600;
		var rotSpeed = 360; // one rotation per second
		var bulletSpeed = 700;
		var particleSpeed = 400;

		var timeBetweenFire = 150; // how many milliseconds between shots
		var timeBetweenBlink = 250; // milliseconds between enemy blink
		var timeBetweenEnemyUpdate = 2000;
		var bulletRadius = 2;
		var maxParticles = 40;
		var maxBullets = 20;

		// generated every 10 ms
		this.flame = { r: [], y: [] };

		// blink style
		this.toggleBlinkStyle = function () {
			if (this.updated.blink.isActive) {
				removeClass(document.body, "ASTEROIDSBLINK");
			} else {
				addClass(document.body, "ASTEROIDSBLINK");
			}

			this.updated.blink.isActive = !this.updated.blink.isActive;
		};

		addStylesheet(".ASTEROIDSBLINK .ASTEROIDSYEAHENEMY", "outline: 2px dotted red;");

		this.pos = new Vector(100, 100);
		this.lastPos = false;
		this.vel = new Vector(0, 0);
		this.dir = new Vector(0, 1);
		this.keysPressed = {};
		this.firedAt = false;
		this.updated = {
			enemies: false, // if the enemy index has been updated since the user pressed B for Blink
			flame: new Date().getTime(), // the time the flame was last updated
			blink: { time: 0, isActive: false }
		};
		this.scrollPos = new Vector(0, 0);

		this.bullets = [];

		// Enemies lay first in this.enemies, when they are shot they are moved to this.dying
		this.enemies = [];
		this.dying = [];
		this.totalEnemies = 0;

		// Particles are created when something is shot
		this.particles = [];

		// things to shoot is everything textual and an element of type not specified
		// in types AND not a navigation element (see further down)
		function updateEnemyIndex() {
			for (var i = 0, enemy; enemy = that.enemies[i]; i++) removeClass(enemy, "ASTEROIDSYEAHENEMY");

			var all = document.body.getElementsByTagName("*");
			that.enemies = [];
			for (var i = 0, el; el = all[i]; i++) {
				// elements with className ASTEROIDSYEAH are part of the "game"
				if (indexOf(ignoredTypes, el.tagName.toUpperCase()) == -1 && el.prefix != "g_vml_" && hasOnlyTextualChildren(el) && el.className != "ASTEROIDSYEAH" && el.offsetHeight > 0) {
					el.aSize = size(el);
					that.enemies.push(el);

					addClass(el, "ASTEROIDSYEAHENEMY");

					// this is only for enemycounting
					if (!el.aAdded) {
						el.aAdded = true;
						that.totalEnemies++;
					}
				}
			}
		};
		updateEnemyIndex();

		// createFlames create the vectors for the flames of the ship
		var createFlames;
		(function () {
			var rWidth = playerWidth,
			    rIncrease = playerWidth * 0.1,
			    yWidth = playerWidth * 0.6,
			    yIncrease = yWidth * 0.2,
			    halfR = rWidth / 2,
			    halfY = yWidth / 2,
			    halfPlayerHeight = playerHeight / 2;

			createFlames = function () {
				// Firstly create red flames
				that.flame.r = [[-1 * halfPlayerHeight, -1 * halfR]];
				that.flame.y = [[-1 * halfPlayerHeight, -1 * halfY]];

				for (var x = 0; x < rWidth; x += rIncrease) {
					that.flame.r.push([-random(2, 7) - halfPlayerHeight, x - halfR]);
				}

				that.flame.r.push([-1 * halfPlayerHeight, halfR]);

				// ... And now the yellow flames
				for (var x = 0; x < yWidth; x += yIncrease) {
					that.flame.y.push([-random(2, 7) - halfPlayerHeight, x - halfY]);
				}

				that.flame.y.push([-1 * halfPlayerHeight, halfY]);
			};
		})();

		createFlames();

		/*
  	Math operations
  */

		function radians(deg) {
			return deg * 0.0174532925;
		};

		function degrees(rad) {
			return rad * 57.2957795;
		};

		function random(from, to) {
			return Math.floor(Math.random() * (to + 1) + from);
		};

		/*
  	Misc operations
  */

		function code(name) {
			var table = { up: 38, down: 40, left: 37, right: 39, esc: 27 };
			if (table[name]) {
				return table[name];
			}return name.charCodeAt(0);
		};

		function boundsCheck(vec) {
			if (vec.x > w) vec.x = 0;else if (vec.x < 0) vec.x = w;

			if (vec.y > h) vec.y = 0;else if (vec.y < 0) vec.y = h;
		};

		function size(element) {
			var el = element,
			    left = 0,
			    top = 0;
			do {
				left += el.offsetLeft || 0;
				top += el.offsetTop || 0;
				el = el.offsetParent;
			} while (el);
			return { x: left, y: top, width: element.offsetWidth || 10, height: element.offsetHeight || 10 };
		};

		// Taken from:
		// http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html
		function addEvent(obj, type, fn) {
			if (obj.addEventListener) obj.addEventListener(type, fn, false);else if (obj.attachEvent) {
				obj["e" + type + fn] = fn;
				obj[type + fn] = function () {
					obj["e" + type + fn](window.event);
				};
				obj.attachEvent("on" + type, obj[type + fn]);
			}
		}

		function removeEvent(obj, type, fn) {
			if (obj.removeEventListener) obj.removeEventListener(type, fn, false);else if (obj.detachEvent) {
				obj.detachEvent("on" + type, obj[type + fn]);
				obj[type + fn] = null;
				obj["e" + type + fn] = null;
			}
		}

		function arrayRemove(array, from, to) {
			var rest = array.slice((to || from) + 1 || array.length);
			array.length = from < 0 ? array.length + from : from;
			return array.push.apply(array, rest);
		};

		function applyVisibility(vis) {
			for (var i = 0, p; p = window.ASTEROIDSPLAYERS[i]; i++) {
				p.gameContainer.style.visibility = vis;
			}
		}

		function getElementFromPoint(x, y) {
			// hide canvas so it isn't picked up
			applyVisibility("hidden");

			var element = document.elementFromPoint(x, y);

			if (!element) {
				applyVisibility("visible");
				return false;
			}

			if (element.nodeType == 3) element = element.parentNode;

			// show the canvas again, hopefully it didn't blink
			applyVisibility("visible");
			return element;
		};

		function addParticles(startPos) {
			var time = new Date().getTime();
			var amount = maxParticles;
			for (var i = 0; i < amount; i++) {
				that.particles.push({
					// random direction
					dir: new Vector(Math.random() * 20 - 10, Math.random() * 20 - 10).normalize(),
					pos: startPos.cp(),
					cameAlive: time
				});
			}
		};

		function hasOnlyTextualChildren(element) {
			if (element.offsetLeft < -100 && element.offsetWidth > 0 && element.offsetHeight > 0) {
				return false;
			}if (indexOf(hiddenTypes, element.tagName) != -1) {
				return true;
			}if (element.offsetWidth == 0 && element.offsetHeight == 0) {
				return false;
			}for (var i = 0; i < element.childNodes.length; i++) {
				// <br /> doesn't count... and empty elements
				if (indexOf(hiddenTypes, element.childNodes[i].tagName) == -1 && element.childNodes[i].childNodes.length != 0) {
					return false;
				}
			}
			return true;
		};

		function indexOf(arr, item, from) {
			if (arr.indexOf) {
				return arr.indexOf(item, from);
			}var len = arr.length;
			for (var i = from < 0 ? Math.max(0, len + from) : from || 0; i < len; i++) {
				if (arr[i] === item) {
					return i;
				}
			}
			return -1;
		};

		// taken from MooTools Core
		function addClass(element, className) {
			if (element.className.indexOf(className) == -1) element.className = (element.className + " " + className).replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
		};

		// taken from MooTools Core
		function removeClass(element, className) {
			element.className = element.className.replace(new RegExp("(^|\\s)" + className + "(?:\\s|$)"), "$1");
		};

		function addStylesheet(selector, rules) {
			var stylesheet = document.createElement("style");
			stylesheet.type = "text/css";
			stylesheet.rel = "stylesheet";
			stylesheet.id = "ASTEROIDSYEAHSTYLES";
			try {
				stylesheet.innerHTML = selector + "{" + rules + "}";
			} catch (e) {
				stylesheet.styleSheet.addRule(selector, rules);
			}
			document.getElementsByTagName("head")[0].appendChild(stylesheet);
		};

		function removeStylesheet(name) {
			var stylesheet = document.getElementById(name);
			if (stylesheet) {
				stylesheet.parentNode.removeChild(stylesheet);
			}
		};

		/*
  	== Setup ==
  */
		this.gameContainer = document.createElement("div");
		this.gameContainer.className = "ASTEROIDSYEAH";
		document.body.appendChild(this.gameContainer);

		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("width", w);
		this.canvas.setAttribute("height", h);
		this.canvas.className = "ASTEROIDSYEAH";
		with (this.canvas.style) {
			width = w + "px";
			height = h + "px";
			position = "fixed";
			top = "0px";
			left = "0px";
			bottom = "0px";
			right = "0px";
			zIndex = "10000";
		}

		addEvent(this.canvas, "mousedown", function (e) {
			e = e || window.event;
			var message = document.createElement("span");
			message.style.position = "absolute";
			message.style.border = "1px solid #999";
			message.style.background = "white";
			message.style.color = "black";
			message.innerHTML = "Press Esc to quit";
			document.body.appendChild(message);

			var x = e.pageX || e.clientX + document.documentElement.scrollLeft;
			var y = e.pageY || e.clientY + document.documentElement.scrollTop;
			message.style.left = x - message.offsetWidth / 2 + "px";
			message.style.top = y - message.offsetHeight / 2 + "px";

			setTimeout(function () {
				try {
					message.parentNode.removeChild(message);
				} catch (e) {}
			}, 1000);
		});

		var eventResize = function eventResize() {
			that.canvas.style.display = "none";

			w = document.documentElement.clientWidth;
			h = document.documentElement.clientHeight;

			that.canvas.setAttribute("width", w);
			that.canvas.setAttribute("height", h);

			with (that.canvas.style) {
				display = "block";
				width = w + "px";
				height = h + "px";
			}
			forceChange = true;
		};
		addEvent(window, "resize", eventResize);

		this.gameContainer.appendChild(this.canvas);
		this.ctx = this.canvas.getContext("2d");

		this.ctx.fillStyle = "black";
		this.ctx.strokeStyle = "black";

		/*
  	== Events ==
  */

		var eventKeydown = function eventKeydown(event) {
			event = event || window.event;
			if (event.ctrlKey || event.shiftKey) {
				return;
			}that.keysPressed[event.keyCode] = true;

			switch (event.keyCode) {
				case code(" "):
					that.firedAt = 1;
					break;
			}

			// check here so we can stop propagation appropriately
			if (indexOf([code("up"), code("down"), code("right"), code("left"), code(" "), code("B"), code("W"), code("A"), code("S"), code("D")], event.keyCode) != -1) {
				if (event.ctrlKey || event.shiftKey) {
					return;
				}if (event.preventDefault) event.preventDefault();
				if (event.stopPropagation) event.stopPropagation();
				event.returnValue = false;
				event.cancelBubble = true;
				return false;
			}
		};
		addEvent(document, "keydown", eventKeydown);

		var eventKeypress = function eventKeypress(event) {
			event = event || window.event;
			if (indexOf([code("up"), code("down"), code("right"), code("left"), code(" "), code("W"), code("A"), code("S"), code("D")], event.keyCode || event.which) != -1) {
				if (event.ctrlKey || event.shiftKey) {
					return;
				}if (event.preventDefault) event.preventDefault();
				if (event.stopPropagation) event.stopPropagation();
				event.returnValue = false;
				event.cancelBubble = true;
				return false;
			}
		};
		addEvent(document, "keypress", eventKeypress);

		var eventKeyup = function eventKeyup(event) {
			event = event || window.event;
			that.keysPressed[event.keyCode] = false;

			if (indexOf([code("up"), code("down"), code("right"), code("left"), code(" "), code("B"), code("W"), code("A"), code("S"), code("D")], event.keyCode) != -1) {
				if (event.preventDefault) event.preventDefault();
				if (event.stopPropagation) event.stopPropagation();
				event.returnValue = false;
				event.cancelBubble = true;
				return false;
			}
		};
		addEvent(document, "keyup", eventKeyup);

		/*
  	Context operations
  */

		this.ctx.clear = function () {
			this.clearRect(0, 0, w, h);
		};

		this.ctx.clear();

		this.ctx.drawLine = function (xFrom, yFrom, xTo, yTo) {
			this.beginPath();
			this.moveTo(xFrom, yFrom);
			this.lineTo(xTo, yTo);
			this.lineTo(xTo + 1, yTo + 1);
			this.closePath();
			this.fill();
		};

		this.ctx.tracePoly = function (verts) {
			this.beginPath();
			this.moveTo(verts[0][0], verts[0][1]);
			for (var i = 1; i < verts.length; i++) this.lineTo(verts[i][0], verts[i][1]);
			this.closePath();
		};

		var THEPLAYER = false;
		if (window.KICKASSIMG) {
			THEPLAYER = document.createElement("img");
			THEPLAYER.src = window.KICKASSIMG;
		}

		this.ctx.drawPlayer = function () {
			if (!THEPLAYER) {
				this.save();
				this.translate(that.pos.x, that.pos.y);
				this.rotate(that.dir.angle());
				this.tracePoly(playerVerts);
				this.fillStyle = "white";
				this.fill();
				this.tracePoly(playerVerts);
				this.stroke();
				this.restore();
			} else {
				this.save();
				this.translate(that.pos.x, that.pos.y);
				this.rotate(that.dir.angle() + Math.PI / 2);
				this.drawImage(THEPLAYER, -THEPLAYER.width / 2, -THEPLAYER.height / 2);
				this.restore();
			}
		};

		var PI_SQ = Math.PI * 2;

		this.ctx.drawBullets = function (bullets) {
			for (var i = 0; i < bullets.length; i++) {
				this.beginPath();
				this.fillStyle = "red";
				this.arc(bullets[i].pos.x, bullets[i].pos.y, bulletRadius, 0, PI_SQ, true);
				this.closePath();
				this.fill();
			}
		};

		var randomParticleColor = function randomParticleColor() {
			return ["red", "yellow"][random(0, 1)];
		};

		this.ctx.drawParticles = function (particles) {
			var oldColor = this.fillStyle;

			for (var i = 0; i < particles.length; i++) {
				this.fillStyle = randomParticleColor();
				this.drawLine(particles[i].pos.x, particles[i].pos.y, particles[i].pos.x - particles[i].dir.x * 10, particles[i].pos.y - particles[i].dir.y * 10);
			}

			this.fillStyle = oldColor;
		};

		this.ctx.drawFlames = function (flame) {
			if (THEPLAYER) return;

			this.save();

			this.translate(that.pos.x, that.pos.y);
			this.rotate(that.dir.angle());

			var oldColor = this.strokeStyle;
			this.strokeStyle = "red";
			this.tracePoly(flame.r);
			this.stroke();

			this.strokeStyle = "yellow";
			this.tracePoly(flame.y);
			this.stroke();

			this.strokeStyle = oldColor;
			this.restore();
		};

		/*
  	Game loop
  */

		// Attempt to focus window if possible, so keyboard events are posted to us
		try {
			window.focus();
		} catch (e) {}

		addParticles(this.pos);
		addClass(document.body, "ASTEROIDSYEAH");

		var isRunning = true;
		var lastUpdate = new Date().getTime();
		var forceChange = false;

		this.update = function () {
			// ==
			// logic
			// ==
			var nowTime = new Date().getTime();
			var tDelta = (nowTime - lastUpdate) / 1000;
			lastUpdate = nowTime;

			// update flame and timer if needed
			var drawFlame = false;
			if (nowTime - this.updated.flame > 50) {
				createFlames();
				this.updated.flame = nowTime;
			}

			this.scrollPos.x = window.pageXOffset || document.documentElement.scrollLeft;
			this.scrollPos.y = window.pageYOffset || document.documentElement.scrollTop;

			// update player
			// move forward
			if (this.keysPressed[code("up")] || this.keysPressed[code("W")]) {
				this.vel.add(this.dir.mulNew(acc * tDelta));

				drawFlame = true;
			} else {
				// decrease speed of player
				this.vel.mul(0.96);
			}

			// rotate counter-clockwise
			if (this.keysPressed[code("left")] || this.keysPressed[code("A")]) {
				forceChange = true;
				this.dir.rotate(radians(rotSpeed * tDelta * -1));
			}

			// rotate clockwise
			if (this.keysPressed[code("right")] || this.keysPressed[code("D")]) {
				forceChange = true;
				this.dir.rotate(radians(rotSpeed * tDelta));
			}

			// fire
			if (this.keysPressed[code(" ")] && nowTime - this.firedAt > timeBetweenFire) {
				this.bullets.unshift({
					dir: this.dir.cp(),
					pos: this.pos.cp(),
					startVel: this.vel.cp(),
					cameAlive: nowTime
				});

				this.firedAt = nowTime;

				if (this.bullets.length > maxBullets) {
					this.bullets.pop();
				}
			}

			// add blink
			if (this.keysPressed[code("B")]) {
				if (!this.updated.enemies) {
					updateEnemyIndex();
					this.updated.enemies = true;
				}

				forceChange = true;

				this.updated.blink.time += tDelta * 1000;
				if (this.updated.blink.time > timeBetweenBlink) {
					this.toggleBlinkStyle();
					this.updated.blink.time = 0;
				}
			} else {
				this.updated.enemies = false;
			}

			if (this.keysPressed[code("esc")]) {
				destroy.apply(this);
				return;
			}

			// cap speed
			if (this.vel.len() > maxSpeed) {
				this.vel.setLength(maxSpeed);
			}

			// add velocity to player (physics)
			this.pos.add(this.vel.mulNew(tDelta));

			// check bounds X of player, if we go outside we scroll accordingly
			if (this.pos.x > w) {
				window.scrollTo(this.scrollPos.x + 50, this.scrollPos.y);
				this.pos.x = 0;
			} else if (this.pos.x < 0) {
				window.scrollTo(this.scrollPos.x - 50, this.scrollPos.y);
				this.pos.x = w;
			}

			// check bounds Y
			if (this.pos.y > h) {
				window.scrollTo(this.scrollPos.x, this.scrollPos.y + h * 0.75);
				this.pos.y = 0;
			} else if (this.pos.y < 0) {
				window.scrollTo(this.scrollPos.x, this.scrollPos.y - h * 0.75);
				this.pos.y = h;
			}

			// update positions of bullets
			for (var i = this.bullets.length - 1; i >= 0; i--) {
				// bullets should only live for 2 seconds
				if (nowTime - this.bullets[i].cameAlive > 2000) {
					this.bullets.splice(i, 1);
					forceChange = true;
					continue;
				}

				var bulletVel = this.bullets[i].dir.setLengthNew(bulletSpeed * tDelta).add(this.bullets[i].startVel.mulNew(tDelta));

				this.bullets[i].pos.add(bulletVel);
				boundsCheck(this.bullets[i].pos);

				// check collisions
				var murdered = getElementFromPoint(this.bullets[i].pos.x, this.bullets[i].pos.y);
				if (murdered && murdered.tagName && indexOf(ignoredTypes, murdered.tagName.toUpperCase()) == -1 && hasOnlyTextualChildren(murdered) && murdered.className != "ASTEROIDSYEAH") {
					didKill = true;
					addParticles(this.bullets[i].pos);
					this.dying.push(murdered);

					this.bullets.splice(i, 1);
					continue;
				}
			}

			if (this.dying.length) {
				for (var i = this.dying.length - 1; i >= 0; i--) {
					try {
						// If we have multiple spaceships it might have already been removed
						if (this.dying[i].parentNode) window.ASTEROIDS.enemiesKilled++;

						this.dying[i].parentNode.removeChild(this.dying[i]);
					} catch (e) {}
				}

				this.dying = [];
			}

			// update particles position
			for (var i = this.particles.length - 1; i >= 0; i--) {
				this.particles[i].pos.add(this.particles[i].dir.mulNew(particleSpeed * tDelta * Math.random()));

				if (nowTime - this.particles[i].cameAlive > 1000) {
					this.particles.splice(i, 1);
					forceChange = true;
					continue;
				}
			}

			// ==
			// drawing
			// ==

			// clear
			if (forceChange || this.bullets.length != 0 || this.particles.length != 0 || !this.pos.is(this.lastPos) || this.vel.len() > 0) {
				this.ctx.clear();

				// draw player
				this.ctx.drawPlayer();

				// draw flames
				if (drawFlame) this.ctx.drawFlames(that.flame);

				// draw bullets
				if (this.bullets.length) {
					this.ctx.drawBullets(this.bullets);
				}

				// draw particles
				if (this.particles.length) {
					this.ctx.drawParticles(this.particles);
				}
			}
			this.lastPos = this.pos;
			forceChange = false;
		};

		// Start timer
		var updateFunc = function updateFunc() {
			that.update.call(that);
		};
		var interval = setInterval(updateFunc, 1000 / FPS);

		function destroy() {
			clearInterval(interval);
			removeEvent(document, "keydown", eventKeydown);
			removeEvent(document, "keypress", eventKeypress);
			removeEvent(document, "keyup", eventKeyup);
			removeEvent(window, "resize", eventResize);
			isRunning = false;
			removeStylesheet("ASTEROIDSYEAHSTYLES");
			removeClass(document.body, "ASTEROIDSYEAH");
			this.gameContainer.parentNode.removeChild(this.gameContainer);
		};
	}

	if (!window.ASTEROIDSPLAYERS) window.ASTEROIDSPLAYERS = [];

	window.ASTEROIDSPLAYERS[window.ASTEROIDSPLAYERS.length] = new Asteroids();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9haG1ldC8uYXRvbS9wYWNrYWdlcy9hc3Rlcm9pZHMvbGliL2FzdGVyb2lkcy1nYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUdBLGNBQWMsR0FBRyxZQUFXO0FBQzVCLFVBQVMsU0FBUyxHQUFHO0FBQ3BCLE1BQUssQ0FBRSxNQUFNLENBQUMsU0FBUyxFQUN0QixNQUFNLENBQUMsU0FBUyxHQUFHO0FBQ2xCLGdCQUFhLEVBQUUsQ0FBQztBQUNoQixpQkFBYyxFQUFFLEFBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBRSxPQUFPLEVBQUU7R0FDdEMsQ0FBQzs7Ozs7O0FBTUgsV0FBUyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNyQixPQUFLLE9BQU8sQ0FBQyxJQUFJLFFBQVEsRUFBRztBQUMzQixRQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDYixRQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDYixNQUFNO0FBQ04sUUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxRQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNYO0dBQ0QsQ0FBQzs7QUFFRixRQUFNLENBQUMsU0FBUyxHQUFHO0FBQ2xCLEtBQUUsRUFBRSxjQUFXO0FBQ2QsV0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQzs7QUFFRCxNQUFHLEVBQUUsYUFBUyxNQUFNLEVBQUU7QUFDckIsUUFBSSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUM7QUFDakIsUUFBSSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUM7QUFDakIsV0FBTyxJQUFJLENBQUM7SUFDWjs7QUFFRCxTQUFNLEVBQUUsZ0JBQVMsTUFBTSxFQUFFO0FBQ3hCLFdBQU8sSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLEVB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R0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVqRCxRQUNDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQzVFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQzNFLFlBQU8sSUFBSSxDQUFDO0tBQUEsQUFFZCxJQUFLLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQUcsWUFBTyxJQUFJLENBQUM7S0FBQSxBQUN6RCxJQUFLLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQUcsWUFBTyxJQUFJLENBQUM7S0FBQSxBQUN6RCxJQUFLLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQUcsWUFBTyxJQUFJLENBQUM7S0FBQSxBQUN6RCxJQUFLLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQUcsWUFBTyxJQUFJLENBQUM7S0FBQSxBQUN6RCxPQUFPLEtBQUssQ0FBQztJQUNiOztBQUVELGlCQUFjLEVBQUUsd0JBQVMsS0FBSyxFQUFFO0FBQy9CLFFBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFO1FBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDL0IsUUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUU7UUFBRSxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQzs7QUFFakMsUUFBSSxLQUFLLEdBQUcsQUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQSxJQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQSxBQUFDLEdBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUEsSUFBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUEsQUFBQyxBQUFDLENBQUM7QUFDOUUsUUFBSSxTQUFTLEdBQUcsQUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQSxJQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQSxBQUFDLEdBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUEsSUFBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUEsQUFBQyxBQUFDLENBQUM7O0FBRWxGLFFBQUksVUFBVSxHQUFHLEFBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUEsSUFBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUEsQUFBQyxHQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBLElBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBLEFBQUMsQUFBQyxDQUFDOztB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QUFRLEdBQUcsV0FBVyxDQUFDLFVBQVUsRUFBRSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7O0FBRW5ELFdBQVMsT0FBTyxHQUFHO0FBQ2xCLGdCQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEIsY0FBVyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDL0MsY0FBVyxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDakQsY0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDM0MsY0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDM0MsWUFBUyxHQUFHLEtBQUssQ0FBQztBQUNsQixtQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3hDLGNBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQzVDLE9BQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7R0FDOUQsQ0FBQztFQUNGOztBQUVELEtBQUssQ0FBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQzdCLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7O0FBRTlCLE9BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztDQUV6RSxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9haG1ldC8uYXRvbS9wYWNrYWdlcy9hc3Rlcm9pZHMvbGliL2FzdGVyb2lkcy1nYW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU2VlIGxpY2Vuc2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9lcmtpZS9lcmtpZS5naXRodWIuY29tL2Jsb2IvbWFzdGVyL1JFQURNRVxuLy8gTW9kaWZpZWQgZm9yIHRoZSBBdG9tIGVkaXRvciBlbnZpcm9ubWVudCBieSBUb20gUHJlc3Rvbi1XZXJuZXIuXG5cbnN0YXJ0QXN0ZXJvaWRzID0gZnVuY3Rpb24oKSB7XG5mdW5jdGlvbiBBc3Rlcm9pZHMoKSB7XG5cdGlmICggISB3aW5kb3cuQVNURVJPSURTIClcblx0XHR3aW5kb3cuQVNURVJPSURTID0ge1xuXHRcdFx0ZW5lbWllc0tpbGxlZDogMCxcblx0XHRcdHN0YXJ0ZWRQbGF5aW5nOiAobmV3IERhdGUoKSkuZ2V0VGltZSgpXG5cdFx0fTtcblxuXHQvKlxuXHRcdENsYXNzZXNcblx0Ki9cblxuXHRmdW5jdGlvbiBWZWN0b3IoeCwgeSkge1xuXHRcdGlmICggdHlwZW9mIHggPT0gJ09iamVjdCcgKSB7XG5cdFx0XHR0aGlzLnggPSB4Lng7XG5cdFx0XHR0aGlzLnkgPSB4Lnk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMueCA9IHg7XG5cdFx0XHR0aGlzLnkgPSB5O1xuXHRcdH1cblx0fTtcblxuXHRWZWN0b3IucHJvdG90eXBlID0ge1xuXHRcdGNwOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCwgdGhpcy55KTtcblx0XHR9LFxuXG5cdFx0bXVsOiBmdW5jdGlvbihmYWN0b3IpIHtcblx0XHRcdHRoaXMueCAqPSBmYWN0b3I7XG5cdFx0XHR0aGlzLnkgKj0gZmFjdG9yO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdG11bE5ldzogZnVuY3Rpb24oZmFjdG9yKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKiBmYWN0b3IsIHRoaXMueSAqIGZhY3Rvcik7XG5cdFx0fSxcblxuXHRcdGFkZDogZnVuY3Rpb24odmVjKSB7XG5cdFx0XHR0aGlzLnggKz0gdmVjLng7XG5cdFx0XHR0aGlzLnkgKz0gdmVjLnk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0YWRkTmV3OiBmdW5jdGlvbih2ZWMpIHtcblx0XHRcdHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCArIHZlYy54LCB0aGlzLnkgKyB2ZWMueSk7XG5cdFx0fSxcblxuXHRcdHN1YjogZnVuY3Rpb24odmVjKSB7XG5cdFx0XHR0aGlzLnggLT0gdmVjLng7XG5cdFx0XHR0aGlzLnkgLT0gdmVjLnk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0c3ViTmV3OiBmdW5jdGlvbih2ZWMpIHtcblx0XHRcdHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCAtIHZlYy54LCB0aGlzLnkgLSB2ZWMueSk7XG5cdFx0fSxcblxuXHRcdC8vIGFuZ2xlIGluIHJhZGlhbnNcblx0XHRyb3RhdGU6IGZ1bmN0aW9uKGFuZ2xlKSB7XG5cdFx0XHR2YXIgeCA9IHRoaXMueCwgeSA9IHRoaXMueTtcblx0XHRcdHRoaXMueCA9IHggKiBNYXRoLmNvcyhhbmdsZSkgLSBNYXRoLnNpbihhbmdsZSkgKiB5O1xuXHRcdFx0dGhpcy55ID0geCAqIE1hdGguc2luKGFuZ2xlKSArIE1hdGguY29zKGFuZ2xlKSAqIHk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0Ly8gYW5nbGUgc3RpbGwgaW4gcmFkaWFuc1xuXHRcdHJvdGF0ZU5ldzogZnVuY3Rpb24oYW5nbGUpIHtcblx0XHRcdHJldHVybiB0aGlzLmNwKCkucm90YXRlKGFuZ2xlKTtcblx0XHR9LFxuXG5cdFx0Ly8gYW5nbGUgaW4gcmFkaWFucy4uLiBhZ2FpblxuXHRcdHNldEFuZ2xlOiBmdW5jdGlvbihhbmdsZSkge1xuXHRcdFx0dmFyIGwgPSB0aGlzLmxlbigpO1xuXHRcdFx0dGhpcy54ID0gTWF0aC5jb3MoYW5nbGUpICogbDtcblx0XHRcdHRoaXMueSA9IE1hdGguc2luKGFuZ2xlKSAqIGw7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXG5cdFx0Ly8gUkFESUFOU1xuXHRcdHNldEFuZ2xlTmV3OiBmdW5jdGlvbihhbmdsZSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3AoKS5zZXRBbmdsZShhbmdsZSk7XG5cdFx0fSxcblxuXHRcdHNldExlbmd0aDogZnVuY3Rpb24obGVuZ3RoKSB7XG5cdFx0XHR2YXIgbCA9IHRoaXMubGVuKCk7XG5cdFx0XHRpZiAoIGwgKSB0aGlzLm11bChsZW5ndGggLyBsKTtcblx0XHRcdGVsc2UgdGhpcy54ID0gdGhpcy55ID0gbGVuZ3RoO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblxuXHRcdHNldExlbmd0aE5ldzogZnVuY3Rpb24obGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcCgpLnNldExlbmd0aChsZW5ndGgpO1xuXHRcdH0sXG5cblx0XHRub3JtYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGwgPSB0aGlzLmxlbigpO1xuXHRcdFx0dGhpcy54IC89IGw7XG5cdFx0XHR0aGlzLnkgLz0gbDtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHRub3JtYWxpemVOZXc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY3AoKS5ub3JtYWxpemUoKTtcblx0XHR9LFxuXG5cdFx0YW5nbGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIE1hdGguYXRhbjIodGhpcy55LCB0aGlzLngpO1xuXHRcdH0sXG5cblx0XHRjb2xsaWRlc1dpdGg6IGZ1bmN0aW9uKHJlY3QpIHtcblx0XHRcdHJldHVybiB0aGlzLnggPiByZWN0LnggJiYgdGhpcy55ID4gcmVjdC55ICYmIHRoaXMueCA8IHJlY3QueCArIHJlY3Qud2lkdGggJiYgdGhpcy55IDwgcmVjdC55ICsgcmVjdC5oZWlnaHQ7XG5cdFx0fSxcblxuXHRcdGxlbjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbCA9IE1hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkpO1xuXHRcdFx0aWYgKCBsIDwgMC4wMDUgJiYgbCA+IC0wLjAwNSkgcmV0dXJuIDA7XG5cdFx0XHRyZXR1cm4gbDtcblx0XHR9LFxuXG5cdFx0aXM6IGZ1bmN0aW9uKHRlc3QpIHtcblx0XHRcdHJldHVybiB0eXBlb2YgdGVzdCA9PSAnb2JqZWN0JyAmJiB0aGlzLnggPT0gdGVzdC54ICYmIHRoaXMueSA9PSB0ZXN0Lnk7XG5cdFx0fSxcblxuXHRcdHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAnW1ZlY3RvcignICsgdGhpcy54ICsgJywgJyArIHRoaXMueSArICcpIGFuZ2xlOiAnICsgdGhpcy5hbmdsZSgpICsgJywgbGVuZ3RoOiAnICsgdGhpcy5sZW4oKSArICddJztcblx0XHR9XG5cdH07XG5cblx0ZnVuY3Rpb24gTGluZShwMSwgcDIpIHtcblx0XHR0aGlzLnAxID0gcDE7XG5cdFx0dGhpcy5wMiA9IHAyO1xuXHR9O1xuXG5cdExpbmUucHJvdG90eXBlID0ge1xuXHRcdHNoaWZ0OiBmdW5jdGlvbihwb3MpIHtcblx0XHRcdHRoaXMucDEuYWRkKHBvcyk7XG5cdFx0XHR0aGlzLnAyLmFkZChwb3MpO1xuXHRcdH0sXG5cblx0XHRpbnRlcnNlY3RzV2l0aFJlY3Q6IGZ1bmN0aW9uKHJlY3QpIHtcblx0XHRcdHZhciBMTCA9IG5ldyBWZWN0b3IocmVjdC54LCByZWN0LnkgKyByZWN0LmhlaWdodCk7XG5cdFx0XHR2YXIgVUwgPSBuZXcgVmVjdG9yKHJlY3QueCwgcmVjdC55KTtcblx0XHRcdHZhciBMUiA9IG5ldyBWZWN0b3IocmVjdC54ICsgcmVjdC53aWR0aCwgcmVjdC55ICsgcmVjdC5oZWlnaHQpO1xuXHRcdFx0dmFyIFVSID0gbmV3IFZlY3RvcihyZWN0LnggKyByZWN0LndpZHRoLCByZWN0LnkpO1xuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdHRoaXMucDEueCA+IExMLnggJiYgdGhpcy5wMS54IDwgVVIueCAmJiB0aGlzLnAxLnkgPCBMTC55ICYmIHRoaXMucDEueSA+IFVSLnkgJiZcblx0XHRcdFx0dGhpcy5wMi54ID4gTEwueCAmJiB0aGlzLnAyLnggPCBVUi54ICYmIHRoaXMucDIueSA8IExMLnkgJiYgdGhpcy5wMi55ID4gVVIueVxuXHRcdFx0KSByZXR1cm4gdHJ1ZTtcblxuXHRcdFx0aWYgKCB0aGlzLmludGVyc2VjdHNMaW5lKG5ldyBMaW5lKFVMLCBMTCkpICkgcmV0dXJuIHRydWU7XG5cdFx0XHRpZiAoIHRoaXMuaW50ZXJzZWN0c0xpbmUobmV3IExpbmUoTEwsIExSKSkgKSByZXR1cm4gdHJ1ZTtcblx0XHRcdGlmICggdGhpcy5pbnRlcnNlY3RzTGluZShuZXcgTGluZShVTCwgVVIpKSApIHJldHVybiB0cnVlO1xuXHRcdFx0aWYgKCB0aGlzLmludGVyc2VjdHNMaW5lKG5ldyBMaW5lKFVSLCBMUikpICkgcmV0dXJuIHRydWU7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSxcblxuXHRcdGludGVyc2VjdHNMaW5lOiBmdW5jdGlvbihsaW5lMikge1xuXHRcdFx0dmFyIHYxID0gdGhpcy5wMSwgdjIgPSB0aGlzLnAyO1xuXHRcdFx0dmFyIHYzID0gbGluZTIucDEsIHY0ID0gbGluZTIucDI7XG5cblx0XHRcdHZhciBkZW5vbSA9ICgodjQueSAtIHYzLnkpICogKHYyLnggLSB2MS54KSkgLSAoKHY0LnggLSB2My54KSAqICh2Mi55IC0gdjEueSkpO1xuXHRcdFx0dmFyIG51bWVyYXRvciA9ICgodjQueCAtIHYzLngpICogKHYxLnkgLSB2My55KSkgLSAoKHY0LnkgLSB2My55KSAqICh2MS54IC0gdjMueCkpO1xuXG5cdFx0XHR2YXIgbnVtZXJhdG9yMiA9ICgodjIueCAtIHYxLngpICogKHYxLnkgLSB2My55KSkgLSAoKHYyLnkgLSB2MS55KSAqICh2MS54IC0gdjMueCkpO1xuXG5cdFx0XHRpZiAoIGRlbm9tID09IDAuMCApIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHVhID0gbnVtZXJhdG9yIC8gZGVub207XG5cdFx0XHR2YXIgdWIgPSBudW1lcmF0b3IyIC8gZGVub207XG5cblx0XHRcdHJldHVybiAodWEgPj0gMC4wICYmIHVhIDw9IDEuMCAmJiB1YiA+PSAwLjAgJiYgdWIgPD0gMS4wKTtcblx0XHR9XG5cdH07XG5cblx0Lypcblx0XHRlbmQgY2xhc3NlcywgYmVnaW4gY29kZVxuXHQqL1xuXG5cdHZhciB0aGF0ID0gdGhpcztcblxuXHQvLyBjb25maWd1cmF0aW9uIGRpcmVjdGl2ZXMgYXJlIHBsYWNlZCBpbiBsb2NhbCB2YXJpYWJsZXNcblx0dmFyIHcgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsIGggPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXG5cdHZhciBwbGF5ZXJXaWR0aCA9IDIwLCBwbGF5ZXJIZWlnaHQgPSAzMDtcblxuXHR2YXIgcGxheWVyVmVydHMgPSBbWy0xICogcGxheWVySGVpZ2h0LzIsIC0xICogcGxheWVyV2lkdGgvMl0sIFstMSAqIHBsYXllckhlaWdodC8yLCBwbGF5ZXJXaWR0aC8yXSwgW3BsYXllckhlaWdodC8yLCAwXV07XG5cblx0dmFyIGlnbm9yZWRUeXBlcyA9IFsnSFRNTCcsICdIRUFEJywgJ0JPRFknLCAnU0NSSVBUJywgJ1RJVExFJywgJ01FVEEnLCAnU1RZTEUnLCAnTElOSyddO1xuXHR2YXIgaGlkZGVuVHlwZXMgPSBbJ0JSJywgJ0hSJ107XG5cblx0dmFyIEZQUyA9IDUwO1xuXG5cdC8vIHVuaXRzL3NlY29uZFxuXHR2YXIgYWNjXHRcdFx0ICA9IDMwMDtcblx0dmFyIG1heFNwZWVkXHQgID0gNjAwO1xuXHR2YXIgcm90U3BlZWRcdCAgPSAzNjA7IC8vIG9uZSByb3RhdGlvbiBwZXIgc2Vjb25kXG5cdHZhciBidWxsZXRTcGVlZFx0ICA9IDcwMDtcblx0dmFyIHBhcnRpY2xlU3BlZWQgPSA0MDA7XG5cblx0dmFyIHRpbWVCZXR3ZWVuRmlyZSA9IDE1MDsgLy8gaG93IG1hbnkgbWlsbGlzZWNvbmRzIGJldHdlZW4gc2hvdHNcblx0dmFyIHRpbWVCZXR3ZWVuQmxpbmsgPSAyNTA7IC8vIG1pbGxpc2Vjb25kcyBiZXR3ZWVuIGVuZW15IGJsaW5rXG5cdHZhciB0aW1lQmV0d2VlbkVuZW15VXBkYXRlID0gMjAwMDtcblx0dmFyIGJ1bGxldFJhZGl1cyA9IDI7XG5cdHZhciBtYXhQYXJ0aWNsZXMgPSA0MDtcblx0dmFyIG1heEJ1bGxldHMgPSAyMDtcblxuXHQvLyBnZW5lcmF0ZWQgZXZlcnkgMTAgbXNcblx0dGhpcy5mbGFtZSA9IHtyOiBbXSwgeTogW119O1xuXG5cdC8vIGJsaW5rIHN0eWxlXG5cdHRoaXMudG9nZ2xlQmxpbmtTdHlsZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy51cGRhdGVkLmJsaW5rLmlzQWN0aXZlKSB7XG5cdFx0XHRyZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCAnQVNURVJPSURTQkxJTksnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YWRkQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ0FTVEVST0lEU0JMSU5LJyk7XG5cdFx0fVxuXG5cdFx0dGhpcy51cGRhdGVkLmJsaW5rLmlzQWN0aXZlID0gIXRoaXMudXBkYXRlZC5ibGluay5pc0FjdGl2ZTtcblx0fTtcblxuXHRhZGRTdHlsZXNoZWV0KFwiLkFTVEVST0lEU0JMSU5LIC5BU1RFUk9JRFNZRUFIRU5FTVlcIiwgXCJvdXRsaW5lOiAycHggZG90dGVkIHJlZDtcIik7XG5cblx0dGhpcy5wb3MgPSBuZXcgVmVjdG9yKDEwMCwgMTAwKTtcblx0dGhpcy5sYXN0UG9zID0gZmFsc2U7XG5cdHRoaXMudmVsID0gbmV3IFZlY3RvcigwLCAwKTtcblx0dGhpcy5kaXIgPSBuZXcgVmVjdG9yKDAsIDEpO1xuXHR0aGlzLmtleXNQcmVzc2VkID0ge307XG5cdHRoaXMuZmlyZWRBdCA9IGZhbHNlO1xuXHR0aGlzLnVwZGF0ZWQgPSB7XG5cdFx0ZW5lbWllczogZmFsc2UsIC8vIGlmIHRoZSBlbmVteSBpbmRleCBoYXMgYmVlbiB1cGRhdGVkIHNpbmNlIHRoZSB1c2VyIHByZXNzZWQgQiBmb3IgQmxpbmtcblx0XHRmbGFtZTogbmV3IERhdGUoKS5nZXRUaW1lKCksIC8vIHRoZSB0aW1lIHRoZSBmbGFtZSB3YXMgbGFzdCB1cGRhdGVkXG5cdFx0Ymxpbms6IHt0aW1lOiAwLCBpc0FjdGl2ZTogZmFsc2V9XG5cdH07XG5cdHRoaXMuc2Nyb2xsUG9zID0gbmV3IFZlY3RvcigwLCAwKTtcblxuXHR0aGlzLmJ1bGxldHMgPSBbXTtcblxuXHQvLyBFbmVtaWVzIGxheSBmaXJzdCBpbiB0aGlzLmVuZW1pZXMsIHdoZW4gdGhleSBhcmUgc2hvdCB0aGV5IGFyZSBtb3ZlZCB0byB0aGlzLmR5aW5nXG5cdHRoaXMuZW5lbWllcyA9IFtdO1xuXHR0aGlzLmR5aW5nID0gW107XG5cdHRoaXMudG90YWxFbmVtaWVzID0gMDtcblxuXHQvLyBQYXJ0aWNsZXMgYXJlIGNyZWF0ZWQgd2hlbiBzb21ldGhpbmcgaXMgc2hvdFxuXHR0aGlzLnBhcnRpY2xlcyA9IFtdO1xuXG5cdC8vIHRoaW5ncyB0byBzaG9vdCBpcyBldmVyeXRoaW5nIHRleHR1YWwgYW5kIGFuIGVsZW1lbnQgb2YgdHlwZSBub3Qgc3BlY2lmaWVkXG5cdC8vIGluIHR5cGVzIEFORCBub3QgYSBuYXZpZ2F0aW9uIGVsZW1lbnQgKHNlZSBmdXJ0aGVyIGRvd24pXG5cdGZ1bmN0aW9uIHVwZGF0ZUVuZW15SW5kZXgoKSB7XG5cdFx0Zm9yICggdmFyIGkgPSAwLCBlbmVteTsgZW5lbXkgPSB0aGF0LmVuZW1pZXNbaV07IGkrKyApXG5cdFx0XHRyZW1vdmVDbGFzcyhlbmVteSwgXCJBU1RFUk9JRFNZRUFIRU5FTVlcIik7XG5cblx0XHR2YXIgYWxsID0gZG9jdW1lbnQuYm9keS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpO1xuXHRcdHRoYXQuZW5lbWllcyA9IFtdO1xuXHRcdGZvciAoIHZhciBpID0gMCwgZWw7IGVsID0gYWxsW2ldOyBpKysgKSB7XG5cdFx0XHQvLyBlbGVtZW50cyB3aXRoIGNsYXNzTmFtZSBBU1RFUk9JRFNZRUFIIGFyZSBwYXJ0IG9mIHRoZSBcImdhbWVcIlxuXHRcdFx0aWYgKCBpbmRleE9mKGlnbm9yZWRUeXBlcywgZWwudGFnTmFtZS50b1VwcGVyQ2FzZSgpKSA9PSAtMSAmJiBlbC5wcmVmaXggIT0gJ2dfdm1sXycgJiYgaGFzT25seVRleHR1YWxDaGlsZHJlbihlbCkgJiYgZWwuY2xhc3NOYW1lICE9IFwiQVNURVJPSURTWUVBSFwiICYmIGVsLm9mZnNldEhlaWdodCA+IDAgKSB7XG5cdFx0XHRcdGVsLmFTaXplID0gc2l6ZShlbCk7XG5cdFx0XHRcdHRoYXQuZW5lbWllcy5wdXNoKGVsKTtcblxuXHRcdFx0XHRhZGRDbGFzcyhlbCwgXCJBU1RFUk9JRFNZRUFIRU5FTVlcIik7XG5cblx0XHRcdFx0Ly8gdGhpcyBpcyBvbmx5IGZvciBlbmVteWNvdW50aW5nXG5cdFx0XHRcdGlmICggISBlbC5hQWRkZWQgKSB7XG5cdFx0XHRcdFx0ZWwuYUFkZGVkID0gdHJ1ZTtcblx0XHRcdFx0XHR0aGF0LnRvdGFsRW5lbWllcysrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHR1cGRhdGVFbmVteUluZGV4KCk7XG5cblx0Ly8gY3JlYXRlRmxhbWVzIGNyZWF0ZSB0aGUgdmVjdG9ycyBmb3IgdGhlIGZsYW1lcyBvZiB0aGUgc2hpcFxuXHR2YXIgY3JlYXRlRmxhbWVzO1xuXHQoZnVuY3Rpb24gKCkge1xuXHRcdHZhciByV2lkdGggPSBwbGF5ZXJXaWR0aCxcblx0XHRcdHJJbmNyZWFzZSA9IHBsYXllcldpZHRoICogMC4xLFxuXHRcdFx0eVdpZHRoID0gcGxheWVyV2lkdGggKiAwLjYsXG5cdFx0XHR5SW5jcmVhc2UgPSB5V2lkdGggKiAwLjIsXG5cdFx0XHRoYWxmUiA9IHJXaWR0aCAvIDIsXG5cdFx0XHRoYWxmWSA9IHlXaWR0aCAvIDIsXG5cdFx0XHRoYWxmUGxheWVySGVpZ2h0ID0gcGxheWVySGVpZ2h0IC8gMjtcblxuXHRcdGNyZWF0ZUZsYW1lcyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdC8vIEZpcnN0bHkgY3JlYXRlIHJlZCBmbGFtZXNcblx0XHRcdHRoYXQuZmxhbWUuciA9IFtbLTEgKiBoYWxmUGxheWVySGVpZ2h0LCAtMSAqIGhhbGZSXV07XG5cdFx0XHR0aGF0LmZsYW1lLnkgPSBbWy0xICogaGFsZlBsYXllckhlaWdodCwgLTEgKiBoYWxmWV1dO1xuXG5cdFx0XHRmb3IgKCB2YXIgeCA9IDA7IHggPCByV2lkdGg7IHggKz0gckluY3JlYXNlICkge1xuXHRcdFx0XHR0aGF0LmZsYW1lLnIucHVzaChbLXJhbmRvbSgyLCA3KSAtIGhhbGZQbGF5ZXJIZWlnaHQsIHggLSBoYWxmUl0pO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGF0LmZsYW1lLnIucHVzaChbLTEgKiBoYWxmUGxheWVySGVpZ2h0LCBoYWxmUl0pO1xuXG5cdFx0XHQvLyAuLi4gQW5kIG5vdyB0aGUgeWVsbG93IGZsYW1lc1xuXHRcdFx0Zm9yICggdmFyIHggPSAwOyB4IDwgeVdpZHRoOyB4ICs9IHlJbmNyZWFzZSApIHtcblx0XHRcdFx0dGhhdC5mbGFtZS55LnB1c2goWy1yYW5kb20oMiwgNykgLSBoYWxmUGxheWVySGVpZ2h0LCB4IC0gaGFsZlldKTtcblx0XHRcdH1cblxuXHRcdFx0dGhhdC5mbGFtZS55LnB1c2goWy0xICogaGFsZlBsYXllckhlaWdodCwgaGFsZlldKTtcblx0XHR9O1xuXHR9KSgpO1xuXG5cdGNyZWF0ZUZsYW1lcygpO1xuXG5cdC8qXG5cdFx0TWF0aCBvcGVyYXRpb25zXG5cdCovXG5cblx0ZnVuY3Rpb24gcmFkaWFucyhkZWcpIHtcblx0XHRyZXR1cm4gZGVnICogMC4wMTc0NTMyOTI1O1xuXHR9O1xuXG5cdGZ1bmN0aW9uIGRlZ3JlZXMocmFkKSB7XG5cdFx0cmV0dXJuIHJhZCAqIDU3LjI5NTc3OTU7XG5cdH07XG5cblx0ZnVuY3Rpb24gcmFuZG9tKGZyb20sIHRvKSB7XG5cdFx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh0byArIDEpICsgZnJvbSk7XG5cdH07XG5cblx0Lypcblx0XHRNaXNjIG9wZXJhdGlvbnNcblx0Ki9cblxuXHRmdW5jdGlvbiBjb2RlKG5hbWUpIHtcblx0XHR2YXIgdGFibGUgPSB7J3VwJzogMzgsICdkb3duJzogNDAsICdsZWZ0JzogMzcsICdyaWdodCc6IDM5LCAnZXNjJzogMjd9O1xuXHRcdGlmICggdGFibGVbbmFtZV0gKSByZXR1cm4gdGFibGVbbmFtZV07XG5cdFx0cmV0dXJuIG5hbWUuY2hhckNvZGVBdCgwKTtcblx0fTtcblxuXHRmdW5jdGlvbiBib3VuZHNDaGVjayh2ZWMpIHtcblx0XHRpZiAoIHZlYy54ID4gdyApXG5cdFx0XHR2ZWMueCA9IDA7XG5cdFx0ZWxzZSBpZiAoIHZlYy54IDwgMCApXG5cdFx0XHR2ZWMueCA9IHc7XG5cblx0XHRpZiAoIHZlYy55ID4gaCApXG5cdFx0XHR2ZWMueSA9IDA7XG5cdFx0ZWxzZSBpZiAoIHZlYy55IDwgMCApXG5cdFx0XHR2ZWMueSA9IGg7XG5cdH07XG5cblx0ZnVuY3Rpb24gc2l6ZShlbGVtZW50KSB7XG5cdFx0dmFyIGVsID0gZWxlbWVudCwgbGVmdCA9IDAsIHRvcCA9IDA7XG5cdFx0ZG8ge1xuXHRcdFx0bGVmdCArPSBlbC5vZmZzZXRMZWZ0IHx8IDA7XG5cdFx0XHR0b3AgKz0gZWwub2Zmc2V0VG9wIHx8IDA7XG5cdFx0XHRlbCA9IGVsLm9mZnNldFBhcmVudDtcblx0XHR9IHdoaWxlIChlbCk7XG5cdFx0cmV0dXJuIHt4OiBsZWZ0LCB5OiB0b3AsIHdpZHRoOiBlbGVtZW50Lm9mZnNldFdpZHRoIHx8IDEwLCBoZWlnaHQ6IGVsZW1lbnQub2Zmc2V0SGVpZ2h0IHx8IDEwfTtcblx0fTtcblxuXHQvLyBUYWtlbiBmcm9tOlxuXHQvLyBodHRwOi8vd3d3LnF1aXJrc21vZGUub3JnL2Jsb2cvYXJjaGl2ZXMvMjAwNS8xMC9fYW5kX3RoZV93aW5uZXJfMS5odG1sXG5cdGZ1bmN0aW9uIGFkZEV2ZW50KCBvYmosIHR5cGUsIGZuICkge1xuXHRcdGlmIChvYmouYWRkRXZlbnRMaXN0ZW5lcilcblx0XHRcdG9iai5hZGRFdmVudExpc3RlbmVyKCB0eXBlLCBmbiwgZmFsc2UgKTtcblx0XHRlbHNlIGlmIChvYmouYXR0YWNoRXZlbnQpIHtcblx0XHRcdG9ialtcImVcIit0eXBlK2ZuXSA9IGZuO1xuXHRcdFx0b2JqW3R5cGUrZm5dID0gZnVuY3Rpb24oKSB7IG9ialtcImVcIit0eXBlK2ZuXSggd2luZG93LmV2ZW50ICk7IH07XG5cdFx0XHRvYmouYXR0YWNoRXZlbnQoIFwib25cIit0eXBlLCBvYmpbdHlwZStmbl0gKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiByZW1vdmVFdmVudCggb2JqLCB0eXBlLCBmbiApIHtcblx0XHRpZiAob2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIpXG5cdFx0XHRvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lciggdHlwZSwgZm4sIGZhbHNlICk7XG5cdFx0ZWxzZSBpZiAob2JqLmRldGFjaEV2ZW50KSB7XG5cdFx0XHRvYmouZGV0YWNoRXZlbnQoIFwib25cIit0eXBlLCBvYmpbdHlwZStmbl0gKTtcblx0XHRcdG9ialt0eXBlK2ZuXSA9IG51bGw7XG5cdFx0XHRvYmpbXCJlXCIrdHlwZStmbl0gPSBudWxsO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGFycmF5UmVtb3ZlKGFycmF5LCBmcm9tLCB0bykge1xuXHRcdHZhciByZXN0ID0gYXJyYXkuc2xpY2UoKHRvIHx8IGZyb20pICsgMSB8fCBhcnJheS5sZW5ndGgpO1xuXHRcdGFycmF5Lmxlbmd0aCA9IGZyb20gPCAwID8gYXJyYXkubGVuZ3RoICsgZnJvbSA6IGZyb207XG5cdFx0cmV0dXJuIGFycmF5LnB1c2guYXBwbHkoYXJyYXksIHJlc3QpO1xuXHR9O1xuXG5cdGZ1bmN0aW9uIGFwcGx5VmlzaWJpbGl0eSh2aXMpIHtcblx0XHRmb3IgKCB2YXIgaSA9IDAsIHA7IHAgPSB3aW5kb3cuQVNURVJPSURTUExBWUVSU1tpXTsgaSsrICkge1xuXHRcdFx0cC5nYW1lQ29udGFpbmVyLnN0eWxlLnZpc2liaWxpdHkgPSB2aXM7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0RWxlbWVudEZyb21Qb2ludCh4LCB5KSB7XG5cdFx0Ly8gaGlkZSBjYW52YXMgc28gaXQgaXNuJ3QgcGlja2VkIHVwXG5cdFx0YXBwbHlWaXNpYmlsaXR5KCdoaWRkZW4nKTtcblxuXHRcdHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcblxuXHRcdGlmICggISBlbGVtZW50ICkge1xuXHRcdFx0YXBwbHlWaXNpYmlsaXR5KCd2aXNpYmxlJyk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKCBlbGVtZW50Lm5vZGVUeXBlID09IDMgKVxuXHRcdFx0ZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcblxuXHRcdC8vIHNob3cgdGhlIGNhbnZhcyBhZ2FpbiwgaG9wZWZ1bGx5IGl0IGRpZG4ndCBibGlua1xuXHRcdGFwcGx5VmlzaWJpbGl0eSgndmlzaWJsZScpO1xuXHRcdHJldHVybiBlbGVtZW50O1xuXHR9O1xuXG5cdGZ1bmN0aW9uIGFkZFBhcnRpY2xlcyhzdGFydFBvcykge1xuXHRcdHZhciB0aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0dmFyIGFtb3VudCA9IG1heFBhcnRpY2xlcztcblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBhbW91bnQ7IGkrKyApIHtcblx0XHRcdHRoYXQucGFydGljbGVzLnB1c2goe1xuXHRcdFx0XHQvLyByYW5kb20gZGlyZWN0aW9uXG5cdFx0XHRcdGRpcjogKG5ldyBWZWN0b3IoTWF0aC5yYW5kb20oKSAqIDIwIC0gMTAsIE1hdGgucmFuZG9tKCkgKiAyMCAtIDEwKSkubm9ybWFsaXplKCksXG5cdFx0XHRcdHBvczogc3RhcnRQb3MuY3AoKSxcblx0XHRcdFx0Y2FtZUFsaXZlOiB0aW1lXG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG5cblx0ZnVuY3Rpb24gaGFzT25seVRleHR1YWxDaGlsZHJlbihlbGVtZW50KSB7XG5cdFx0aWYgKCBlbGVtZW50Lm9mZnNldExlZnQgPCAtMTAwICYmIGVsZW1lbnQub2Zmc2V0V2lkdGggPiAwICYmIGVsZW1lbnQub2Zmc2V0SGVpZ2h0ID4gMCApIHJldHVybiBmYWxzZTtcblx0XHRpZiAoIGluZGV4T2YoaGlkZGVuVHlwZXMsIGVsZW1lbnQudGFnTmFtZSkgIT0gLTEgKSByZXR1cm4gdHJ1ZTtcblxuXHRcdGlmICggZWxlbWVudC5vZmZzZXRXaWR0aCA9PSAwICYmIGVsZW1lbnQub2Zmc2V0SGVpZ2h0ID09IDAgKSByZXR1cm4gZmFsc2U7XG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgZWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrICkge1xuXHRcdFx0Ly8gPGJyIC8+IGRvZXNuJ3QgY291bnQuLi4gYW5kIGVtcHR5IGVsZW1lbnRzXG5cdFx0XHRpZiAoXG5cdFx0XHRcdGluZGV4T2YoaGlkZGVuVHlwZXMsIGVsZW1lbnQuY2hpbGROb2Rlc1tpXS50YWdOYW1lKSA9PSAtMVxuXHRcdFx0XHQmJiBlbGVtZW50LmNoaWxkTm9kZXNbaV0uY2hpbGROb2Rlcy5sZW5ndGggIT0gMFxuXHRcdFx0KSByZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9O1xuXG5cdGZ1bmN0aW9uIGluZGV4T2YoYXJyLCBpdGVtLCBmcm9tKXtcblx0XHRpZiAoIGFyci5pbmRleE9mICkgcmV0dXJuIGFyci5pbmRleE9mKGl0ZW0sIGZyb20pO1xuXHRcdHZhciBsZW4gPSBhcnIubGVuZ3RoO1xuXHRcdGZvciAodmFyIGkgPSAoZnJvbSA8IDApID8gTWF0aC5tYXgoMCwgbGVuICsgZnJvbSkgOiBmcm9tIHx8IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0XHRpZiAoYXJyW2ldID09PSBpdGVtKSByZXR1cm4gaTtcblx0XHR9XG5cdFx0cmV0dXJuIC0xO1xuXHR9O1xuXG5cdC8vIHRha2VuIGZyb20gTW9vVG9vbHMgQ29yZVxuXHRmdW5jdGlvbiBhZGRDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpIHtcblx0XHRpZiAoIGVsZW1lbnQuY2xhc3NOYW1lLmluZGV4T2YoY2xhc3NOYW1lKSA9PSAtMSlcblx0XHRcdGVsZW1lbnQuY2xhc3NOYW1lID0gKGVsZW1lbnQuY2xhc3NOYW1lICsgJyAnICsgY2xhc3NOYW1lKS5yZXBsYWNlKC9cXHMrL2csICcgJykucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuXHR9O1xuXG5cdC8vIHRha2VuIGZyb20gTW9vVG9vbHMgQ29yZVxuXHRmdW5jdGlvbiByZW1vdmVDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpIHtcblx0XHRlbGVtZW50LmNsYXNzTmFtZSA9IGVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UobmV3IFJlZ0V4cCgnKF58XFxcXHMpJyArIGNsYXNzTmFtZSArICcoPzpcXFxcc3wkKScpLCAnJDEnKTtcblx0fTtcblxuXHRmdW5jdGlvbiBhZGRTdHlsZXNoZWV0KHNlbGVjdG9yLCBydWxlcykge1xuXHRcdHZhciBzdHlsZXNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblx0XHRzdHlsZXNoZWV0LnR5cGUgPSAndGV4dC9jc3MnO1xuXHRcdHN0eWxlc2hlZXQucmVsID0gJ3N0eWxlc2hlZXQnO1xuXHRcdHN0eWxlc2hlZXQuaWQgPSAnQVNURVJPSURTWUVBSFNUWUxFUyc7XG5cdFx0dHJ5IHtcblx0XHRcdHN0eWxlc2hlZXQuaW5uZXJIVE1MID0gc2VsZWN0b3IgKyBcIntcIiArIHJ1bGVzICsgXCJ9XCI7XG5cdFx0fSBjYXRjaCAoIGUgKSB7XG5cdFx0XHRzdHlsZXNoZWV0LnN0eWxlU2hlZXQuYWRkUnVsZShzZWxlY3RvciwgcnVsZXMpO1xuXHRcdH1cblx0XHRkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF0uYXBwZW5kQ2hpbGQoc3R5bGVzaGVldCk7XG5cdH07XG5cblx0ZnVuY3Rpb24gcmVtb3ZlU3R5bGVzaGVldChuYW1lKSB7XG5cdFx0dmFyIHN0eWxlc2hlZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChuYW1lKTtcblx0XHRpZiAoIHN0eWxlc2hlZXQgKSB7XG5cdFx0XHRzdHlsZXNoZWV0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVzaGVldCk7XG5cdFx0fVxuXHR9O1xuXG5cdC8qXG5cdFx0PT0gU2V0dXAgPT1cblx0Ki9cblx0dGhpcy5nYW1lQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdHRoaXMuZ2FtZUNvbnRhaW5lci5jbGFzc05hbWUgPSAnQVNURVJPSURTWUVBSCc7XG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5nYW1lQ29udGFpbmVyKTtcblxuXHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHR0aGlzLmNhbnZhcy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdyk7XG5cdHRoaXMuY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgaCk7XG5cdHRoaXMuY2FudmFzLmNsYXNzTmFtZSA9ICdBU1RFUk9JRFNZRUFIJztcblx0d2l0aCAoIHRoaXMuY2FudmFzLnN0eWxlICkge1xuXHRcdHdpZHRoID0gdyArIFwicHhcIjtcblx0XHRoZWlnaHQgPSBoICsgXCJweFwiO1xuXHRcdHBvc2l0aW9uID0gXCJmaXhlZFwiO1xuXHRcdHRvcCA9IFwiMHB4XCI7XG5cdFx0bGVmdCA9IFwiMHB4XCI7XG5cdFx0Ym90dG9tID0gXCIwcHhcIjtcblx0XHRyaWdodCA9IFwiMHB4XCI7XG5cdFx0ekluZGV4ID0gXCIxMDAwMFwiO1xuXHR9XG5cblx0YWRkRXZlbnQodGhpcy5jYW52YXMsICdtb3VzZWRvd24nLCBmdW5jdGlvbihlKSB7XG5cdFx0ZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuXHRcdHZhciBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXHRcdG1lc3NhZ2Uuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXHRcdG1lc3NhZ2Uuc3R5bGUuYm9yZGVyID0gJzFweCBzb2xpZCAjOTk5Jztcblx0XHRtZXNzYWdlLnN0eWxlLmJhY2tncm91bmQgPSAnd2hpdGUnO1xuXHRcdG1lc3NhZ2Uuc3R5bGUuY29sb3IgPSBcImJsYWNrXCI7XG5cdFx0bWVzc2FnZS5pbm5lckhUTUwgPSAnUHJlc3MgRXNjIHRvIHF1aXQnO1xuXHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWVzc2FnZSk7XG5cblx0XHR2YXIgeCA9IGUucGFnZVggfHwgKGUuY2xpZW50WCArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0KTtcblx0XHR2YXIgeSA9IGUucGFnZVkgfHwgKGUuY2xpZW50WSArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApO1xuXHRcdG1lc3NhZ2Uuc3R5bGUubGVmdCA9IHggLSBtZXNzYWdlLm9mZnNldFdpZHRoLzIgKyAncHgnO1xuXHRcdG1lc3NhZ2Uuc3R5bGUudG9wID0geSAtIG1lc3NhZ2Uub2Zmc2V0SGVpZ2h0LzIgKyAncHgnO1xuXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdG1lc3NhZ2UucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChtZXNzYWdlKTtcblx0XHRcdH0gY2F0Y2ggKCBlICkge31cblx0XHR9LCAxMDAwKTtcblx0fSk7XG5cblx0dmFyIGV2ZW50UmVzaXplID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhhdC5jYW52YXMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXG5cdFx0dyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcblx0XHRoID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcblxuXHRcdHRoYXQuY2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB3KTtcblx0XHR0aGF0LmNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIGgpO1xuXG5cdFx0d2l0aCAoIHRoYXQuY2FudmFzLnN0eWxlICkge1xuXHRcdFx0ZGlzcGxheSA9IFwiYmxvY2tcIjtcblx0XHRcdHdpZHRoID0gdyArIFwicHhcIjtcblx0XHRcdGhlaWdodCA9IGggKyBcInB4XCI7XG5cdFx0fVxuXHRcdGZvcmNlQ2hhbmdlID0gdHJ1ZTtcblx0fTtcblx0YWRkRXZlbnQod2luZG93LCAncmVzaXplJywgZXZlbnRSZXNpemUpO1xuXG5cdHRoaXMuZ2FtZUNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG5cdHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG5cdHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcblx0dGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBcImJsYWNrXCI7XG5cblx0Lypcblx0XHQ9PSBFdmVudHMgPT1cblx0Ki9cblxuXHR2YXIgZXZlbnRLZXlkb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudCA9IGV2ZW50IHx8IHdpbmRvdy5ldmVudDtcblx0XHRpZiAoIGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQuc2hpZnRLZXkgKVxuXHRcdFx0cmV0dXJuO1xuXHRcdHRoYXQua2V5c1ByZXNzZWRbZXZlbnQua2V5Q29kZV0gPSB0cnVlO1xuXG5cdFx0c3dpdGNoICggZXZlbnQua2V5Q29kZSApIHtcblx0XHRcdGNhc2UgY29kZSgnICcpOlxuXHRcdFx0XHR0aGF0LmZpcmVkQXQgPSAxO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0Ly8gY2hlY2sgaGVyZSBzbyB3ZSBjYW4gc3RvcCBwcm9wYWdhdGlvbiBhcHByb3ByaWF0ZWx5XG5cdFx0aWYgKCBpbmRleE9mKFtjb2RlKCd1cCcpLCBjb2RlKCdkb3duJyksIGNvZGUoJ3JpZ2h0JyksIGNvZGUoJ2xlZnQnKSwgY29kZSgnICcpLCBjb2RlKCdCJyksIGNvZGUoJ1cnKSwgY29kZSgnQScpLCBjb2RlKCdTJyksIGNvZGUoJ0QnKV0sIGV2ZW50LmtleUNvZGUpICE9IC0xICkge1xuXHRcdFx0aWYgKCBldmVudC5jdHJsS2V5IHx8IGV2ZW50LnNoaWZ0S2V5IClcblx0XHRcdFx0cmV0dXJuO1xuXG5cdFx0XHRpZiAoIGV2ZW50LnByZXZlbnREZWZhdWx0IClcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGlmICggZXZlbnQuc3RvcFByb3BhZ2F0aW9uKVxuXHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdGV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XG5cdFx0XHRldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fTtcblx0YWRkRXZlbnQoZG9jdW1lbnQsICdrZXlkb3duJywgZXZlbnRLZXlkb3duKTtcblxuXHR2YXIgZXZlbnRLZXlwcmVzcyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQgPSBldmVudCB8fCB3aW5kb3cuZXZlbnQ7XG5cdFx0aWYgKCBpbmRleE9mKFtjb2RlKCd1cCcpLCBjb2RlKCdkb3duJyksIGNvZGUoJ3JpZ2h0JyksIGNvZGUoJ2xlZnQnKSwgY29kZSgnICcpLCBjb2RlKCdXJyksIGNvZGUoJ0EnKSwgY29kZSgnUycpLCBjb2RlKCdEJyldLCBldmVudC5rZXlDb2RlIHx8IGV2ZW50LndoaWNoKSAhPSAtMSApIHtcblx0XHRcdGlmICggZXZlbnQuY3RybEtleSB8fCBldmVudC5zaGlmdEtleSApXG5cdFx0XHRcdHJldHVybjtcblxuXHRcdFx0aWYgKCBldmVudC5wcmV2ZW50RGVmYXVsdCApXG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRpZiAoIGV2ZW50LnN0b3BQcm9wYWdhdGlvbiApXG5cdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0ZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcblx0XHRcdGV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9O1xuXHRhZGRFdmVudChkb2N1bWVudCwgJ2tleXByZXNzJywgZXZlbnRLZXlwcmVzcyk7XG5cblx0dmFyIGV2ZW50S2V5dXAgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50ID0gZXZlbnQgfHwgd2luZG93LmV2ZW50O1xuXHRcdHRoYXQua2V5c1ByZXNzZWRbZXZlbnQua2V5Q29kZV0gPSBmYWxzZTtcblxuXHRcdGlmICggaW5kZXhPZihbY29kZSgndXAnKSwgY29kZSgnZG93bicpLCBjb2RlKCdyaWdodCcpLCBjb2RlKCdsZWZ0JyksIGNvZGUoJyAnKSwgY29kZSgnQicpLCBjb2RlKCdXJyksIGNvZGUoJ0EnKSwgY29kZSgnUycpLCBjb2RlKCdEJyldLCBldmVudC5rZXlDb2RlKSAhPSAtMSApIHtcblx0XHRcdGlmICggZXZlbnQucHJldmVudERlZmF1bHQgKVxuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0aWYgKCBldmVudC5zdG9wUHJvcGFnYXRpb24gKVxuXHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdGV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XG5cdFx0XHRldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fTtcblx0YWRkRXZlbnQoZG9jdW1lbnQsICdrZXl1cCcsIGV2ZW50S2V5dXApO1xuXG5cdC8qXG5cdFx0Q29udGV4dCBvcGVyYXRpb25zXG5cdCovXG5cblx0dGhpcy5jdHguY2xlYXIgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNsZWFyUmVjdCgwLCAwLCB3LCBoKTtcblx0fTtcblxuXHR0aGlzLmN0eC5jbGVhcigpO1xuXG5cdHRoaXMuY3R4LmRyYXdMaW5lID0gZnVuY3Rpb24oeEZyb20sIHlGcm9tLCB4VG8sIHlUbykge1xuXHRcdHRoaXMuYmVnaW5QYXRoKCk7XG5cdFx0dGhpcy5tb3ZlVG8oeEZyb20sIHlGcm9tKTtcblx0XHR0aGlzLmxpbmVUbyh4VG8sIHlUbyk7XG5cdFx0dGhpcy5saW5lVG8oeFRvICsgMSwgeVRvICsgMSk7XG5cdFx0dGhpcy5jbG9zZVBhdGgoKTtcblx0XHR0aGlzLmZpbGwoKTtcblx0fTtcblxuXHR0aGlzLmN0eC50cmFjZVBvbHkgPSBmdW5jdGlvbih2ZXJ0cykge1xuXHRcdHRoaXMuYmVnaW5QYXRoKCk7XG5cdFx0dGhpcy5tb3ZlVG8odmVydHNbMF1bMF0sIHZlcnRzWzBdWzFdKTtcblx0XHRmb3IgKCB2YXIgaSA9IDE7IGkgPCB2ZXJ0cy5sZW5ndGg7IGkrKyApXG5cdFx0XHR0aGlzLmxpbmVUbyh2ZXJ0c1tpXVswXSwgdmVydHNbaV1bMV0pO1xuXHRcdHRoaXMuY2xvc2VQYXRoKCk7XG5cdH07XG5cblx0dmFyIFRIRVBMQVlFUiA9IGZhbHNlO1xuXHRpZiAoIHdpbmRvdy5LSUNLQVNTSU1HICkge1xuXHRcdFRIRVBMQVlFUiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXHRcdFRIRVBMQVlFUi5zcmMgPSB3aW5kb3cuS0lDS0FTU0lNRztcblx0fVxuXG5cdHRoaXMuY3R4LmRyYXdQbGF5ZXIgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoICEgVEhFUExBWUVSICkge1xuXHRcdFx0dGhpcy5zYXZlKCk7XG5cdFx0XHR0aGlzLnRyYW5zbGF0ZSh0aGF0LnBvcy54LCB0aGF0LnBvcy55KTtcblx0XHRcdHRoaXMucm90YXRlKHRoYXQuZGlyLmFuZ2xlKCkpO1xuXHRcdFx0dGhpcy50cmFjZVBvbHkocGxheWVyVmVydHMpO1xuXHRcdFx0dGhpcy5maWxsU3R5bGUgPSBcIndoaXRlXCI7XG5cdFx0XHR0aGlzLmZpbGwoKTtcblx0XHRcdHRoaXMudHJhY2VQb2x5KHBsYXllclZlcnRzKTtcblx0XHRcdHRoaXMuc3Ryb2tlKCk7XG5cdFx0XHR0aGlzLnJlc3RvcmUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zYXZlKCk7XG5cdFx0XHR0aGlzLnRyYW5zbGF0ZSh0aGF0LnBvcy54LCB0aGF0LnBvcy55KTtcblx0XHRcdHRoaXMucm90YXRlKHRoYXQuZGlyLmFuZ2xlKCkrTWF0aC5QSS8yKTtcblx0XHRcdHRoaXMuZHJhd0ltYWdlKFRIRVBMQVlFUiwgLVRIRVBMQVlFUi53aWR0aC8yLCAtVEhFUExBWUVSLmhlaWdodC8yKTtcblx0XHRcdHRoaXMucmVzdG9yZSgpO1xuXHRcdH1cblx0fTtcblxuXHR2YXIgUElfU1EgPSBNYXRoLlBJKjI7XG5cblx0dGhpcy5jdHguZHJhd0J1bGxldHMgPSBmdW5jdGlvbihidWxsZXRzKSB7XG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgYnVsbGV0cy5sZW5ndGg7IGkrKyApIHtcblx0XHRcdHRoaXMuYmVnaW5QYXRoKCk7XG5cdFx0XHR0aGlzLmZpbGxTdHlsZSA9IFwicmVkXCI7XG5cdFx0XHR0aGlzLmFyYyhidWxsZXRzW2ldLnBvcy54LCBidWxsZXRzW2ldLnBvcy55LCBidWxsZXRSYWRpdXMsIDAsIFBJX1NRLCB0cnVlKTtcblx0XHRcdHRoaXMuY2xvc2VQYXRoKCk7XG5cdFx0XHR0aGlzLmZpbGwoKTtcblx0XHR9XG5cdH07XG5cblx0dmFyIHJhbmRvbVBhcnRpY2xlQ29sb3IgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gKFsncmVkJywgJ3llbGxvdyddKVtyYW5kb20oMCwgMSldO1xuXHR9O1xuXG5cdHRoaXMuY3R4LmRyYXdQYXJ0aWNsZXMgPSBmdW5jdGlvbihwYXJ0aWNsZXMpIHtcblx0XHR2YXIgb2xkQ29sb3IgPSB0aGlzLmZpbGxTdHlsZTtcblxuXHRcdGZvciAoIHZhciBpID0gMDsgaSA8IHBhcnRpY2xlcy5sZW5ndGg7IGkrKyApIHtcblx0XHRcdHRoaXMuZmlsbFN0eWxlID0gcmFuZG9tUGFydGljbGVDb2xvcigpO1xuXHRcdFx0dGhpcy5kcmF3TGluZShwYXJ0aWNsZXNbaV0ucG9zLngsIHBhcnRpY2xlc1tpXS5wb3MueSwgcGFydGljbGVzW2ldLnBvcy54IC0gcGFydGljbGVzW2ldLmRpci54ICogMTAsIHBhcnRpY2xlc1tpXS5wb3MueSAtIHBhcnRpY2xlc1tpXS5kaXIueSAqIDEwKTtcblx0XHR9XG5cblx0XHR0aGlzLmZpbGxTdHlsZSA9IG9sZENvbG9yO1xuXHR9O1xuXG5cdHRoaXMuY3R4LmRyYXdGbGFtZXMgPSBmdW5jdGlvbihmbGFtZSkge1xuXHRcdGlmICggVEhFUExBWUVSICkgcmV0dXJuO1xuXG5cdFx0dGhpcy5zYXZlKCk7XG5cblx0XHR0aGlzLnRyYW5zbGF0ZSh0aGF0LnBvcy54LCB0aGF0LnBvcy55KTtcblx0XHR0aGlzLnJvdGF0ZSh0aGF0LmRpci5hbmdsZSgpKTtcblxuXHRcdHZhciBvbGRDb2xvciA9IHRoaXMuc3Ryb2tlU3R5bGU7XG5cdFx0dGhpcy5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG5cdFx0dGhpcy50cmFjZVBvbHkoZmxhbWUucik7XG5cdFx0dGhpcy5zdHJva2UoKTtcblxuXHRcdHRoaXMuc3Ryb2tlU3R5bGUgPSBcInllbGxvd1wiO1xuXHRcdHRoaXMudHJhY2VQb2x5KGZsYW1lLnkpO1xuXHRcdHRoaXMuc3Ryb2tlKCk7XG5cblx0XHR0aGlzLnN0cm9rZVN0eWxlID0gb2xkQ29sb3I7XG5cdFx0dGhpcy5yZXN0b3JlKCk7XG5cdH07XG5cblx0Lypcblx0XHRHYW1lIGxvb3Bcblx0Ki9cblxuXHQvLyBBdHRlbXB0IHRvIGZvY3VzIHdpbmRvdyBpZiBwb3NzaWJsZSwgc28ga2V5Ym9hcmQgZXZlbnRzIGFyZSBwb3N0ZWQgdG8gdXNcblx0dHJ5IHtcblx0XHR3aW5kb3cuZm9jdXMoKTtcblx0fSBjYXRjaCAoIGUgKSB7fVxuXG5cdGFkZFBhcnRpY2xlcyh0aGlzLnBvcyk7XG5cdGFkZENsYXNzKGRvY3VtZW50LmJvZHksICdBU1RFUk9JRFNZRUFIJyk7XG5cblx0dmFyIGlzUnVubmluZyA9IHRydWU7XG5cdHZhciBsYXN0VXBkYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdHZhciBmb3JjZUNoYW5nZSA9IGZhbHNlO1xuXG5cdHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0Ly8gPT1cblx0XHQvLyBsb2dpY1xuXHRcdC8vID09XG5cdFx0dmFyIG5vd1RpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0XHR2YXIgdERlbHRhID0gKG5vd1RpbWUgLSBsYXN0VXBkYXRlKSAvIDEwMDA7XG5cdFx0bGFzdFVwZGF0ZSA9IG5vd1RpbWU7XG5cblx0XHQvLyB1cGRhdGUgZmxhbWUgYW5kIHRpbWVyIGlmIG5lZWRlZFxuXHRcdHZhciBkcmF3RmxhbWUgPSBmYWxzZTtcblx0XHRpZiAoIG5vd1RpbWUgLSB0aGlzLnVwZGF0ZWQuZmxhbWUgPiA1MCApIHtcblx0XHRcdGNyZWF0ZUZsYW1lcygpO1xuXHRcdFx0dGhpcy51cGRhdGVkLmZsYW1lID0gbm93VGltZTtcblx0XHR9XG5cblx0XHR0aGlzLnNjcm9sbFBvcy54ID0gd2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0O1xuXHRcdHRoaXMuc2Nyb2xsUG9zLnkgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblxuXHRcdC8vIHVwZGF0ZSBwbGF5ZXJcblx0XHQvLyBtb3ZlIGZvcndhcmRcblx0XHRpZiAoICh0aGlzLmtleXNQcmVzc2VkW2NvZGUoJ3VwJyldKSB8fCAodGhpcy5rZXlzUHJlc3NlZFtjb2RlKCdXJyldKSApIHtcblx0XHRcdHRoaXMudmVsLmFkZCh0aGlzLmRpci5tdWxOZXcoYWNjICogdERlbHRhKSk7XG5cblx0XHRcdGRyYXdGbGFtZSA9IHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGRlY3JlYXNlIHNwZWVkIG9mIHBsYXllclxuXHRcdFx0dGhpcy52ZWwubXVsKDAuOTYpO1xuXHRcdH1cblxuXHRcdC8vIHJvdGF0ZSBjb3VudGVyLWNsb2Nrd2lzZVxuXHRcdGlmICggKHRoaXMua2V5c1ByZXNzZWRbY29kZSgnbGVmdCcpXSkgfHwgKHRoaXMua2V5c1ByZXNzZWRbY29kZSgnQScpXSkgKSB7XG5cdFx0XHRmb3JjZUNoYW5nZSA9IHRydWU7XG5cdFx0XHR0aGlzLmRpci5yb3RhdGUocmFkaWFucyhyb3RTcGVlZCAqIHREZWx0YSAqIC0xKSk7XG5cdFx0fVxuXG5cdFx0Ly8gcm90YXRlIGNsb2Nrd2lzZVxuXHRcdGlmICggKHRoaXMua2V5c1ByZXNzZWRbY29kZSgncmlnaHQnKV0pIHx8ICh0aGlzLmtleXNQcmVzc2VkW2NvZGUoJ0QnKV0pICkge1xuXHRcdFx0Zm9yY2VDaGFuZ2UgPSB0cnVlO1xuXHRcdFx0dGhpcy5kaXIucm90YXRlKHJhZGlhbnMocm90U3BlZWQgKiB0RGVsdGEpKTtcblx0XHR9XG5cblx0XHQvLyBmaXJlXG5cdFx0aWYgKCB0aGlzLmtleXNQcmVzc2VkW2NvZGUoJyAnKV0gJiYgbm93VGltZSAtIHRoaXMuZmlyZWRBdCA+IHRpbWVCZXR3ZWVuRmlyZSApIHtcblx0XHRcdHRoaXMuYnVsbGV0cy51bnNoaWZ0KHtcblx0XHRcdFx0J2Rpcic6IHRoaXMuZGlyLmNwKCksXG5cdFx0XHRcdCdwb3MnOiB0aGlzLnBvcy5jcCgpLFxuXHRcdFx0XHQnc3RhcnRWZWwnOiB0aGlzLnZlbC5jcCgpLFxuXHRcdFx0XHQnY2FtZUFsaXZlJzogbm93VGltZVxuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuZmlyZWRBdCA9IG5vd1RpbWU7XG5cblx0XHRcdGlmICggdGhpcy5idWxsZXRzLmxlbmd0aCA+IG1heEJ1bGxldHMgKSB7XG5cdFx0XHRcdHRoaXMuYnVsbGV0cy5wb3AoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBhZGQgYmxpbmtcblx0XHRpZiAoIHRoaXMua2V5c1ByZXNzZWRbY29kZSgnQicpXSApIHtcblx0XHRcdGlmICggISB0aGlzLnVwZGF0ZWQuZW5lbWllcyApIHtcblx0XHRcdFx0dXBkYXRlRW5lbXlJbmRleCgpO1xuXHRcdFx0XHR0aGlzLnVwZGF0ZWQuZW5lbWllcyA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGZvcmNlQ2hhbmdlID0gdHJ1ZTtcblxuXHRcdFx0dGhpcy51cGRhdGVkLmJsaW5rLnRpbWUgKz0gdERlbHRhICogMTAwMDtcblx0XHRcdGlmICggdGhpcy51cGRhdGVkLmJsaW5rLnRpbWUgPiB0aW1lQmV0d2VlbkJsaW5rICkge1xuXHRcdFx0XHR0aGlzLnRvZ2dsZUJsaW5rU3R5bGUoKTtcblx0XHRcdFx0dGhpcy51cGRhdGVkLmJsaW5rLnRpbWUgPSAwO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnVwZGF0ZWQuZW5lbWllcyA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5rZXlzUHJlc3NlZFtjb2RlKCdlc2MnKV0gKSB7XG5cdFx0XHRkZXN0cm95LmFwcGx5KHRoaXMpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIGNhcCBzcGVlZFxuXHRcdGlmICggdGhpcy52ZWwubGVuKCkgPiBtYXhTcGVlZCApIHtcblx0XHRcdHRoaXMudmVsLnNldExlbmd0aChtYXhTcGVlZCk7XG5cdFx0fVxuXG5cdFx0Ly8gYWRkIHZlbG9jaXR5IHRvIHBsYXllciAocGh5c2ljcylcblx0XHR0aGlzLnBvcy5hZGQodGhpcy52ZWwubXVsTmV3KHREZWx0YSkpO1xuXG5cdFx0Ly8gY2hlY2sgYm91bmRzIFggb2YgcGxheWVyLCBpZiB3ZSBnbyBvdXRzaWRlIHdlIHNjcm9sbCBhY2NvcmRpbmdseVxuXHRcdGlmICggdGhpcy5wb3MueCA+IHcgKSB7XG5cdFx0XHR3aW5kb3cuc2Nyb2xsVG8odGhpcy5zY3JvbGxQb3MueCArIDUwLCB0aGlzLnNjcm9sbFBvcy55KTtcblx0XHRcdHRoaXMucG9zLnggPSAwO1xuXHRcdH0gZWxzZSBpZiAoIHRoaXMucG9zLnggPCAwICkge1xuXHRcdFx0d2luZG93LnNjcm9sbFRvKHRoaXMuc2Nyb2xsUG9zLnggLSA1MCwgdGhpcy5zY3JvbGxQb3MueSk7XG5cdFx0XHR0aGlzLnBvcy54ID0gdztcblx0XHR9XG5cblx0XHQvLyBjaGVjayBib3VuZHMgWVxuXHRcdGlmICggdGhpcy5wb3MueSA+IGggKSB7XG5cdFx0XHR3aW5kb3cuc2Nyb2xsVG8odGhpcy5zY3JvbGxQb3MueCwgdGhpcy5zY3JvbGxQb3MueSArIGggKiAwLjc1KTtcblx0XHRcdHRoaXMucG9zLnkgPSAwO1xuXHRcdH0gZWxzZSBpZiAoIHRoaXMucG9zLnkgPCAwICkge1xuXHRcdFx0d2luZG93LnNjcm9sbFRvKHRoaXMuc2Nyb2xsUG9zLngsIHRoaXMuc2Nyb2xsUG9zLnkgLSBoICogMC43NSk7XG5cdFx0XHR0aGlzLnBvcy55ID0gaDtcblx0XHR9XG5cblx0XHQvLyB1cGRhdGUgcG9zaXRpb25zIG9mIGJ1bGxldHNcblx0XHRmb3IgKCB2YXIgaSA9IHRoaXMuYnVsbGV0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcblx0XHRcdC8vIGJ1bGxldHMgc2hvdWxkIG9ubHkgbGl2ZSBmb3IgMiBzZWNvbmRzXG5cdFx0XHRpZiAoIG5vd1RpbWUgLSB0aGlzLmJ1bGxldHNbaV0uY2FtZUFsaXZlID4gMjAwMCApIHtcblx0XHRcdFx0dGhpcy5idWxsZXRzLnNwbGljZShpLCAxKTtcblx0XHRcdFx0Zm9yY2VDaGFuZ2UgPSB0cnVlO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGJ1bGxldFZlbCA9IHRoaXMuYnVsbGV0c1tpXS5kaXIuc2V0TGVuZ3RoTmV3KGJ1bGxldFNwZWVkICogdERlbHRhKS5hZGQodGhpcy5idWxsZXRzW2ldLnN0YXJ0VmVsLm11bE5ldyh0RGVsdGEpKTtcblxuXHRcdFx0dGhpcy5idWxsZXRzW2ldLnBvcy5hZGQoYnVsbGV0VmVsKTtcblx0XHRcdGJvdW5kc0NoZWNrKHRoaXMuYnVsbGV0c1tpXS5wb3MpO1xuXG5cdFx0XHQvLyBjaGVjayBjb2xsaXNpb25zXG5cdFx0XHR2YXIgbXVyZGVyZWQgPSBnZXRFbGVtZW50RnJvbVBvaW50KHRoaXMuYnVsbGV0c1tpXS5wb3MueCwgdGhpcy5idWxsZXRzW2ldLnBvcy55KTtcblx0XHRcdGlmIChcblx0XHRcdFx0bXVyZGVyZWQgJiYgbXVyZGVyZWQudGFnTmFtZSAmJlxuXHRcdFx0XHRpbmRleE9mKGlnbm9yZWRUeXBlcywgbXVyZGVyZWQudGFnTmFtZS50b1VwcGVyQ2FzZSgpKSA9PSAtMSAmJlxuXHRcdFx0XHRoYXNPbmx5VGV4dHVhbENoaWxkcmVuKG11cmRlcmVkKSAmJiBtdXJkZXJlZC5jbGFzc05hbWUgIT0gXCJBU1RFUk9JRFNZRUFIXCJcblx0XHRcdCkge1xuXHRcdFx0XHRkaWRLaWxsID0gdHJ1ZTtcblx0XHRcdFx0YWRkUGFydGljbGVzKHRoaXMuYnVsbGV0c1tpXS5wb3MpO1xuXHRcdFx0XHR0aGlzLmR5aW5nLnB1c2gobXVyZGVyZWQpO1xuXG5cdFx0XHRcdHRoaXMuYnVsbGV0cy5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLmR5aW5nLmxlbmd0aCkge1xuXHRcdFx0Zm9yICggdmFyIGkgPSB0aGlzLmR5aW5nLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdC8vIElmIHdlIGhhdmUgbXVsdGlwbGUgc3BhY2VzaGlwcyBpdCBtaWdodCBoYXZlIGFscmVhZHkgYmVlbiByZW1vdmVkXG5cdFx0XHRcdFx0aWYgKCB0aGlzLmR5aW5nW2ldLnBhcmVudE5vZGUgKVxuXHRcdFx0XHRcdFx0d2luZG93LkFTVEVST0lEUy5lbmVtaWVzS2lsbGVkKys7XG5cblx0XHRcdFx0XHR0aGlzLmR5aW5nW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5keWluZ1tpXSk7XG5cdFx0XHRcdH0gY2F0Y2ggKCBlICkge31cblx0XHRcdH1cblxuXHRcdFx0dGhpcy5keWluZyA9IFtdO1xuXHRcdH1cblxuXHRcdC8vIHVwZGF0ZSBwYXJ0aWNsZXMgcG9zaXRpb25cblx0XHRmb3IgKCB2YXIgaSA9IHRoaXMucGFydGljbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuXHRcdFx0dGhpcy5wYXJ0aWNsZXNbaV0ucG9zLmFkZCh0aGlzLnBhcnRpY2xlc1tpXS5kaXIubXVsTmV3KHBhcnRpY2xlU3BlZWQgKiB0RGVsdGEgKiBNYXRoLnJhbmRvbSgpKSk7XG5cblx0XHRcdGlmICggbm93VGltZSAtIHRoaXMucGFydGljbGVzW2ldLmNhbWVBbGl2ZSA+IDEwMDAgKSB7XG5cdFx0XHRcdHRoaXMucGFydGljbGVzLnNwbGljZShpLCAxKTtcblx0XHRcdFx0Zm9yY2VDaGFuZ2UgPSB0cnVlO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyA9PVxuXHRcdC8vIGRyYXdpbmdcblx0XHQvLyA9PVxuXG5cdFx0Ly8gY2xlYXJcblx0XHRpZiAoIGZvcmNlQ2hhbmdlIHx8IHRoaXMuYnVsbGV0cy5sZW5ndGggIT0gMCB8fCB0aGlzLnBhcnRpY2xlcy5sZW5ndGggIT0gMCB8fCAhIHRoaXMucG9zLmlzKHRoaXMubGFzdFBvcykgfHwgdGhpcy52ZWwubGVuKCkgPiAwICkge1xuXHRcdFx0dGhpcy5jdHguY2xlYXIoKTtcblxuXHRcdFx0Ly8gZHJhdyBwbGF5ZXJcblx0XHRcdHRoaXMuY3R4LmRyYXdQbGF5ZXIoKTtcblxuXHRcdFx0Ly8gZHJhdyBmbGFtZXNcblx0XHRcdGlmICggZHJhd0ZsYW1lIClcblx0XHRcdFx0dGhpcy5jdHguZHJhd0ZsYW1lcyh0aGF0LmZsYW1lKTtcblxuXHRcdFx0Ly8gZHJhdyBidWxsZXRzXG5cdFx0XHRpZiAodGhpcy5idWxsZXRzLmxlbmd0aCkge1xuXHRcdFx0XHR0aGlzLmN0eC5kcmF3QnVsbGV0cyh0aGlzLmJ1bGxldHMpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBkcmF3IHBhcnRpY2xlc1xuXHRcdFx0aWYgKHRoaXMucGFydGljbGVzLmxlbmd0aCkge1xuXHRcdFx0XHR0aGlzLmN0eC5kcmF3UGFydGljbGVzKHRoaXMucGFydGljbGVzKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5sYXN0UG9zID0gdGhpcy5wb3M7XG5cdFx0Zm9yY2VDaGFuZ2UgPSBmYWxzZTtcblx0fTtcblxuXHQvLyBTdGFydCB0aW1lclxuXHR2YXIgdXBkYXRlRnVuYyA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoYXQudXBkYXRlLmNhbGwodGhhdCk7XG5cdH07XG5cdHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKHVwZGF0ZUZ1bmMsIDEwMDAgLyBGUFMpO1xuXG5cdGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG5cdFx0Y2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG5cdFx0cmVtb3ZlRXZlbnQoZG9jdW1lbnQsICdrZXlkb3duJywgZXZlbnRLZXlkb3duKTtcblx0XHRyZW1vdmVFdmVudChkb2N1bWVudCwgJ2tleXByZXNzJywgZXZlbnRLZXlwcmVzcyk7XG5cdFx0cmVtb3ZlRXZlbnQoZG9jdW1lbnQsICdrZXl1cCcsIGV2ZW50S2V5dXApO1xuXHRcdHJlbW92ZUV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScsIGV2ZW50UmVzaXplKTtcblx0XHRpc1J1bm5pbmcgPSBmYWxzZTtcblx0XHRyZW1vdmVTdHlsZXNoZWV0KFwiQVNURVJPSURTWUVBSFNUWUxFU1wiKTtcblx0XHRyZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCAnQVNURVJPSURTWUVBSCcpO1xuXHRcdHRoaXMuZ2FtZUNvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZ2FtZUNvbnRhaW5lcik7XG5cdH07XG59XG5cbmlmICggISB3aW5kb3cuQVNURVJPSURTUExBWUVSUyApXG5cdHdpbmRvdy5BU1RFUk9JRFNQTEFZRVJTID0gW107XG5cbndpbmRvdy5BU1RFUk9JRFNQTEFZRVJTW3dpbmRvdy5BU1RFUk9JRFNQTEFZRVJTLmxlbmd0aF0gPSBuZXcgQXN0ZXJvaWRzKCk7XG5cbn07XG4iXX0=