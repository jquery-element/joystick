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

	var
		jqWindow = $( window )
	;

	window.joystick = function( p ) {

		var
			// dom
			jqCtn = $( p.element.nodeType === 1 ? p.element : p.element[ 0 ] ),
			jqBtn = $( "<div>" ),
			// attr
			identifier,
			radius = jqCtn.width() / 2,
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
			move = p.move || $.noop,
			hold = p.hold || $.noop,
			release = p.release || $.noop,
			ev_hold = function( e, isTactile ) {
				var t, i = 0, pos = e;
				if ( isTactile ) {
					while ( t = e.changedTouches[ i++ ] ) {
						if ( t.target === jqCtn[ 0 ] || t.target === jqBtn[ 0 ] ) {
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
				jqCtn
					.removeClass( "joystick-reset" )
					.addClass( "joystick-show" )
				;
				hold.call( jqCtn[ 0 ] );
			},
			moveBtn = function( x, y, rx, ry ) {
				jqBtn.css({
					marginLeft: x,
					marginTop: y,
				});
				move.call(
					jqCtn[ 0 ],
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
					jqCtn
						.removeClass( "joystick-show" )
						.addClass( "joystick-reset" )
					;
					jqBtn.css({
						marginLeft: 0,
						marginTop: 0
					});
					moveBtn(
						0,
						0,
						-btnCoordX,
						-btnCoordY
					);
					release.call( jqCtn[ 0 ] );
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

		jqCtn.append( jqBtn );

		if ( window.ontouchmove === null ) {
			jqCtn.on( "touchstart", function( e ) { ev_hold( e, 1 ); } );
			jqWindow
				.on( "touchend", function( e ) { ev_release( e, 1 ); } )
				.on( "touchmove", function( e ) { ev_move( e, 1 ); } )
			;
		} else {
			jqCtn.mousedown( ev_hold );
			jqWindow
				.mouseup( ev_release )
				.mousemove( ev_move )
			;
		}

	};

})();
