/*
	Joystick-HTML5 - 1.1.0
	https://github.com/Mr21/joystick-html5
*/

/*
	This script has not the good conception right now.
	There is a window.ontouchmove for each joystick created...
	I'll change this after, meanwhile it's works.
*/

"use strict";

(function() {

	// utils
	function noop() {}
	function attachEvent( e, v, f ) {
		if ( e.attachEvent ) {
			e.attachEvent( "on" + v, f );
		} else {
			e.addEventListener( v, f, false );
		}
	}
	function addClass( e, c ) {
		e.className += " " + c;
	}
	function removeClass( e, c ) {
		e.className = e.className.replace( new RegExp( " " + c, "g" ), "" );
	}

	window.joystick = function( p ) {

		var
			// dom
			el_ctn = p.element.nodeType === Node.ELEMENT_NODE ? p.element : p.element[ 0 ],
			el_btn = document.createElement( "div" ),
			// attr
			identifier,
			radius = el_ctn.offsetWidth / 2,
			isHolding = false,
			coordX,
			coordY,
			btnCoordX = 0,
			btnCoordY = 0,
			searchTouch = function( e ) {
				var t, i = 0;
				e = e.changedTouches;
				for ( ; t = e[ i ]; ++i ) {
					if ( t.identifier === identifier ) {
						return t;
					}
				}
			},
			// callbacks
			move = p.move || noop,
			hold = p.hold || noop,
			release = p.release || noop,
			ev_hold = function( e, isTactile ) {
				var t, i = 0, pos = e;
				if ( isTactile ) {
					while ( t = e.changedTouches[ i++ ] ) {
						if ( t.target === el_ctn || t.target === el_btn ) {
							break;
						}
					}
					if ( !t ) {
						return;
					}
					pos = t;
					identifier = t.identifier;
				}
				btnCoordX = 0;
				btnCoordY = 0;
				e.preventDefault();
				coordX = pos.pageX;
				coordY = pos.pageY;
				isHolding = true;
				removeClass( el_ctn, "joystick-reset" );
				addClass( el_ctn, "joystick-show" );
				hold.call( el_ctn );
			},
			moveBtn = function( x, y, rx, ry ) {
				el_btn.style.marginLeft = x + "px";
				el_btn.style.marginTop  = y + "px";
				move.call(
					el_ctn,
					x / radius,
					y / radius,
					rx,
					ry
				);
			},
			ev_release = function( e, isTactile ) {
				if ( isHolding && ( !isTactile || searchTouch( e ) ) ) {
					e.preventDefault();
					isHolding = false;
					removeClass( el_ctn, "joystick-show" );
					addClass( el_ctn, "joystick-reset" );
					el_btn.style.marginLeft =
					el_btn.style.marginTop  = "0px";
					moveBtn(
						0,
						0,
						-btnCoordX,
						-btnCoordY
					);
					release.call( el_ctn );
				}
			},
			ev_move = function( e, isTactile ) {
				if ( isHolding ) {
					var
						x, y, a, d, rx, ry,
						pos = e
					;
					if ( isTactile && !( pos = searchTouch( e ) ) ) {
						return;
					}
					e.preventDefault();
					rx = pos.pageX - coordX;
					ry = pos.pageY - coordY;
					coordX = pos.pageX;
					coordY = pos.pageY;
					x = btnCoordX += rx;
					y = btnCoordY += ry;
					d = Math.sqrt( x * x + y * y );
					if ( d > radius ) {
						d = radius;
					}
					a = Math.atan2( y, x );
					moveBtn(
						Math.cos( a ) * d,
						Math.sin( a ) * d,
						rx,
						ry
					);
				}
			}
		;

		el_ctn.appendChild( el_btn );

		if ( window.ontouchmove === null ) {
			attachEvent( el_ctn, "touchstart", function( e ) { ev_hold( e, 1 ); } );
			attachEvent( window, "touchend",   function( e ) { ev_release( e, 1 ); } );
			attachEvent( window, "touchmove",  function( e ) { ev_move( e, 1 ); } );
		} else {
			attachEvent( el_ctn, "mousedown", ev_hold );
			attachEvent( window, "mouseup",   ev_release );
			attachEvent( window, "mousemove", ev_move );
		}

	};

})();
