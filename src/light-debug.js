;(function(win, undefined) {
	var w = win,
		d = w.document,
		undef = undefined
		GLOBAL_CONFIG = {
			'horizontal': 50,
			'vertical': 50,
			'gap': 0,
			'ceilLength': 9,
			'trailNum': 40,
			'trailAlpha': 0.3,
			'blurRange': 18,
			'lightVelocity' : [2,4],	
			'interval': 10,
			'delay': [500, 900],
			'color': ['#5D655B', '#3C433D', '#212722', '#2F362F'],
			'lightDirection': ['up', 'down', 'left', 'right'],
			'lightColor': ['#ff0000', '#FFEE00', '#00A8FF', '#00ff00']
		};
		
	
	var Linear = (function() {
		
		var mapCanvas = d.createElement('canvas'),
			lightCanvas = d.createElement('canvas'),	
			mapCtx = mapCanvas.getContext('2d'),
			lightCtx = lightCanvas.getContext('2d'),
			C = GLOBAL_CONFIG;

		function _createMap() {

			var h = C.horizontal,
				v = C.vertical,
				l = C.ceilLength,
				g = C.gap;

			d.body.appendChild(mapCanvas);
			d.body.appendChild(lightCanvas);

			mapCanvas.style.position = lightCanvas.style.position = 'absolute';
			mapCanvas.style.left = lightCanvas.style.left = '0px';
			mapCanvas.style.background = '#333';
			mapCanvas.style.top = lightCanvas.style.top = '0px';

			mapCanvas.width = lightCanvas.width = (l + g) * h;
			mapCanvas.height = lightCanvas.height = (l + g) * v;

		}

		function _bindEvent() {
			lightCanvas.addEventListener('mousedown', Controller.handler, false);
		}

		function init() {
			_createMap();
			Map.init(mapCtx);
			Controller.init(lightCtx);
			_bindEvent();
		}

		return {
			'init' : init
		}

	})();


	var Map = (function(){

		var ctx = null;
	
		function _drawRect(x, y) {
			var c = GLOBAL_CONFIG['color'],
				l = GLOBAL_CONFIG['ceilLength'];

			ctx.moveTo(x, y);
			ctx.fillStyle = c[0];
			ctx.beginPath();
			ctx.lineTo(x + l, y);
			ctx.lineTo(x + l/2, y + l/2);
			ctx.lineTo(x, y);
			ctx.closePath();
			ctx.fill();
			ctx.fillStyle = c[1];
			ctx.beginPath();
			ctx.lineTo(x, y + l);
			ctx.lineTo(x + l/2, y + l/2);
			ctx.lineTo(x, y);
			ctx.closePath();
			ctx.fill();
			ctx.fillStyle = c[2];
			ctx.beginPath();
			ctx.moveTo(x, y + l);
			ctx.lineTo(x + l, y + l);
			ctx.lineTo(x + l/2, y + l/2);
			ctx.lineTo(x, y + l);
			ctx.closePath();
			ctx.fill();
			ctx.fillStyle = c[3];
			ctx.beginPath();
			ctx.moveTo(x + l, y + l);
			ctx.lineTo(x + l/2, y + l/2);
			ctx.lineTo(x + l, y);
			ctx.lineTo(x + l, y + l);
			ctx.closePath();
			ctx.fill();

		}

		function _drawMap() {
			var c = GLOBAL_CONFIG, 
				h = c.horizontal, 
				v = c.vertical,
				l = c.ceilLength,
				g = c.gap;
			for (var i = 0; i < h; i++) {
				for (var j = 0; j < v; j++) {
					_drawRect((i*(g + l)),j * (g + l));  
				}
			}
		}

		function init(context) {
			ctx = context;
			_drawMap();
		}


		return {
			'init' : init
		}

	})();
	

	var Utils = (function() {

		function hexToRgb(hex) {
			var hex = hex.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/).slice(1);
			return hex.map(function(single){
			  return (parseInt(single, 16)).toString(10);
		 }).join();
		}

		function randomArr(arr) {
			var idx = Math.ceil(Math.random() * arr.length) - 1;
			return arr[idx];
		}

		function randomRange(obj) {
			if (obj instanceof Array) {
				var min = obj[0],
					max = obj[1];

				return min + Math.ceil(Math.random() * (max - min)) - 1;
			}

			return obj;		
		}

		function ranArr(arr) {
			return arr.sort(function() {
				return Math.random() > 0.5 ? 1 : -1;
			})
		}


		return {
			'hexToRgb' : hexToRgb,
			'randomArr' : randomArr,
			'randomRange' : randomRange,
			'ranArr' : ranArr
		}

	})();


	var Controller = (function() {
			
		var ctx = null,
			timer = null,
			lights = [],
			C = GLOBAL_CONFIG,
			h = C.horizontal,
			v = C.vertical,
			ran = Utils.randomArr,
			range = Utils.randomRange,
			ranArr = Utils.ranArr,
			dots = {
					'up' : { x : [0, h], y : v },
					'down' : { x : [0, h], y : 0},
					'left' : { x : h, y : [0, v]},
					'right' : {x : 0, y : [0, v]}
			};
	
		function init(context) {
			ctx = context;
			automatic();
		}

			
		function contain(square) {
			if (square.x < -450 || square.x > 900 || square.y < -450 || square.y > 900) {
				return false;
			}
			return true;
		}
		
		function autoGenerate() {
			var	velocity = range(C.lightVelocity),
				dir = ran(C.lightDirection),
				color = ran(C.lightColor),
				x = range(dots[dir].x) * C.ceilLength,
				y = range(dots[dir].y) * C.ceilLength;

			var light = new Light();
			light.init(velocity, dir, color);
			light.generate(x, y);
			lights.push(light);

		}

		function scatter(e) {
			var x = e.clientX,
				y = e.clientY,
				l = C.ceilLength;
			x -= (x % l);
			y -= (y % l);
			diffuse(x, y);
		}

		function automatic() {
			if (!timer) {
				startFlush();
			}
			delay();
		}

		function delay() {
			var period = range(C.delay),
				timer = setTimeout(function() {
					autoGenerate();
					delay();
			}, period);
		}

		function startFlush() {
			timer = setInterval(function() {
				ctx.clearRect(0,0,1000,1000);
				lights.forEach(function(light) {
					step(light);
				}); 
			}, C.interval);
		}


		function handler(e) {
			
			scatter(e);
			//diffuse(e.clientX, e.clientY);
		}


		function diffuse(x, y) {
			ranArr(C.lightColor);
			['up','down','left','right'].forEach(function(dir, i) {
				var light = new Light();
				color = C.lightColor[i];
				light.init(3, dir, color);
				light.generate(x,y);
				lights.push(light);
			});
		}

		function step(square) {
			square.light.x += square.vector.unitX * square.velocity;
			square.light.y += square.vector.unitY * square.velocity;
			square.update();
			square.draw(ctx);
			purge();
		}

		function purge() {
			lights.forEach(function(light, idx) {
				var last = light.trail[light.trail.length - 1];
				if (!contain(last)) {
					lights.splice(idx,1);
				}
			})
		}

		function eliminate(light) {
			light.destroy();
			light = null;
			delete light;
			
		}	

		return {
			'init' : init,
			'handler' : handler
		}
	})();

	
	function Square(color) {
		this.x = 0;
		this.y = 0;
		this.alpha = 1;
		this.length = GLOBAL_CONFIG['ceilLength'];
		this.color = color;
	}

	Square.prototype = {

		'constructor' : Square,

		'draw' : function(ctx) {

			ctx.shadowBlur = 0;
			ctx.shadowColor = 'transparent';

			if (this.head) {
				ctx.shadowBlur = GLOBAL_CONFIG.blurRange;
				ctx.shadowColor = this.color;
			}

			ctx.fillStyle = 'rgba(' + Utils.hexToRgb(this.color) + ',' + this.alpha + ')';
			ctx.fillRect(this.x, this.y, this.length, this.length);
		},

		'destroy' : function() {
		}
	}


	function Light() {
		this.trail = [];
	}

	Light.prototype = {

		'constructor' : Light,
		
		'init' : function(v, dir, color) {
			this.velocity = v;
			this.direction = dir;
			this.color = color
			this.light = new Square(this.color);
			this.light.head = true;
			this.light.alpha = 0.4;
			this.vector = {'unitX' : (dir == 'right' ? 1 : dir == 'left' ? -1 : 0), 'unitY' : (dir == 'up' ? -1 : dir == 'down' ? 1 : 0)};
			this.addTrail();
		},

		'addTrail' : function() {
			var C = GLOBAL_CONFIG;
			for (var i = 0, n = C.trailNum; i < n; i++) {
				var square = new Square(this.color);
				square.alpha = parseFloat(C.trailAlpha * (n - i) / (n + 1));
				this.trail[i] = square;
			}
		},

		'generate' : function(x, y) {
			this.light.x = x;
			this.light.y = y;

		},
		'update' : function() {
			for (var i = 0, l = this.trail.length; i < l; i++) {
				this.trail[i].x = this.light.x - i * this.light.length * this.vector.unitX;
				this.trail[i].y = this.light.y - i * this.light.length * this.vector.unitY;
			}
		},

		'draw' : function(ctx) {
			this.light.draw(ctx);
			this.trail.forEach(function(square, idx) {
				square.draw(ctx);
			})	
		},

		'destroy' : function() {
			this.light = null;
			delete this.light;
			this.trail = null;
			delete this.trail;
		}
	}


	function testCanvas() {
		var elem = d.createElement('canvas');
		return !!(elem.getContext && elem.getContext('2d'));
	}

	window.onload = function() {
		Linear.init();
	}
	
	

})(window);