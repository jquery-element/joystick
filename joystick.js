/*
	Joystick-HTML5 - 1.0
	https://github.com/Mr21/joystick-html5
*/

"use strict";

function joystick(p) {

	var
		// dom
		el_ctn = p.element.nodeType === Node.ELEMENT_NODE ? p.element : p.element[0],
		el_btn = document.createElement("div"),
		// attr
		identifier,
		radius = el_ctn.offsetWidth / 2,
		isHolding = false,
		coordX,
		coordY,
		btnCoordX = 0,
		btnCoordY = 0,
		// callbacks
		noop = function() {},
		move = p.move || noop,
		hold = p.hold || noop,
		release = p.release || noop,
		attachEvent = function(e, v, f) {
			if (e.attachEvent)
				e.attachEvent("on" + v, f);
			else
				e.addEventListener(v, f, false);
		},
		addClass = function(e, c) {
			e.className += " " + c;
		},
		removeClass = function(e, c) {
			e.className = e.className.replace(new RegExp(" " + c, "g"), "");
		},
		searchTouch = function(touches) {
			var t, i = 0;
			for (; t = touches[i]; ++i)
				if (t.identifier === identifier)
					return t;
		},
		fn_hold = function(e, isTactile) {
			var pos = e;
			if (isTactile) {
				var t, i = 0;
				for (; t = e.changedTouches[i]; ++i)
					if (t.target === el_ctn || t.target === el_btn)
						break;
				if (!t)
					return;
				pos = t;
				identifier = t.identifier;
			}
			e.preventDefault();
			coordX = pos.pageX;
			coordY = pos.pageY;
			isHolding = true;
			removeClass(el_ctn, "joystick-reset");
			addClass(el_ctn, "joystick-show");
			hold.call(el_ctn);
		},
		fn_release = function(e, isTactile) {
			if (isHolding) {
				if (isTactile && !searchTouch(e.changedTouches)) {
					return;
				}
				e.preventDefault();
				isHolding = false;
				removeClass(el_ctn, "joystick-show");
				addClass(el_ctn, "joystick-reset");
				el_btn.style.marginLeft = (btnCoordX = 0) + "px";
				el_btn.style.marginTop  = (btnCoordY = 0) + "px";
				release.call(el_ctn);
			}
		},
		fn_move = function(e, isTactile) {
			if (isHolding) {
				var	pos = e, x, y, a, d, rx, ry;
				if (isTactile) {
					var t = searchTouch(e.changedTouches);
					if (!t)
						return;
					pos = t;
				}
				e.preventDefault();
				rx = pos.pageX - coordX;
				ry = pos.pageY - coordY;
				coordX = pos.pageX;
				coordY = pos.pageY;
				x = (btnCoordX += rx);
				y = (btnCoordY += ry);
				a = Math.atan2(y, x);
				d = Math.sqrt(x * x + y * y);
				if (d > radius)
					d = radius;
				x = Math.cos(a) * d;
				y = Math.sin(a) * d;
				el_btn.style.marginLeft = x + "px";
				el_btn.style.marginTop  = y + "px";
				move.call(
					el_ctn,
					x / radius,
					y / radius,
					rx,
					ry
				);
			}
		}
	;

	el_ctn.appendChild(el_btn);

	attachEvent(el_ctn, "mousedown",  function(e) { fn_hold(e, 0); });
	attachEvent(el_ctn, "touchstart", function(e) { fn_hold(e, 1); });
	attachEvent(window, "mouseup",    function(e) { fn_release(e, 0); });
	attachEvent(window, "touchend",   function(e) { fn_release(e, 1); });
	attachEvent(window, "mousemove",  function(e) { fn_move(e, 0); });
	attachEvent(window, "touchmove",  function(e) { fn_move(e, 1); });

}
