/*
	Joystick-HTML5 - 1.1.0
	https://github.com/Mr21/joystick-html5
*/

"use strict";

(function() {

	var
		jqWindow = $( window ),
		isTactile = window.ontouchstart === null
	;

	window.joystick = function( p ) {

		// User's callbacks
		this.move    = p.move    || $.noop;
		this.hold    = p.hold    || $.noop;
		this.release = p.release || $.noop;

		// jQuery elements
		this.jqCtn = $( p.element.nodeType === 1 ? p.element : p.element[ 0 ] );
		this.jqBtn = $( "<div>" );

		// Attributes
		this.radius = this.jqCtn.width() / 2;
		this.isHolding = false;
		this.identifier;
		this.coordX;
		this.coordY;
		this.btnCoordX =
		this.btnCoordY = 0;

		var
			that = this,
			searchTouch = function( e ) {
				var t, i = 0;
				e = e.changedTouches;
				for ( ; t = e[ i ]; ++i ) {
					if ( t.identifier === that.identifier ) {
						return t;
					}
				}
			},
			ev_hold = function( e ) {
				var t, i = 0, pos = e;
				if ( isTactile ) {
					while ( t = e.changedTouches[ i++ ] ) {
						if ( t.target === that.jqCtn[ 0 ] || t.target === that.jqBtn[ 0 ] ) {
							break;
						}
					}
					if ( !t ) {
						return;
					}
					pos = t;
					that.identifier = t.identifier;
				}
				that.btnCoordX = 0;
				that.btnCoordY = 0;
				e.preventDefault();
				that.coordX = pos.pageX;
				that.coordY = pos.pageY;
				that.isHolding = true;
				that.jqCtn
					.removeClass( "joystick-reset" )
					.addClass( "joystick-show" )
				;
				that.hold.call( that.jqCtn[ 0 ] );
			},
			moveBtn = function( x, y, rx, ry ) {
				that.jqBtn.css({
					marginLeft: x,
					marginTop: y,
				});
				that.move.call(
					that.jqCtn[ 0 ],
					x / that.radius,
					y / that.radius,
					rx,
					ry
				);
			},
			ev_release = function( e ) {
				if ( that.isHolding && ( !isTactile || searchTouch( e ) ) ) {
					e.preventDefault();
					that.isHolding = false;
					that.jqCtn
						.removeClass( "joystick-show" )
						.addClass( "joystick-reset" )
					;
					that.jqBtn.css({
						marginLeft: 0,
						marginTop: 0
					});
					moveBtn(
						0,
						0,
						-that.btnCoordX,
						-that.btnCoordY
					);
					that.release.call( that.jqCtn[ 0 ] );
				}
			},
			ev_move = function( e ) {
				if ( that.isHolding ) {
					var
						x, y, a, d, rx, ry,
						pos = e
					;
					if ( isTactile && !( pos = searchTouch( e ) ) ) {
						return;
					}
					e.preventDefault();
					rx = pos.pageX - that.coordX;
					ry = pos.pageY - that.coordY;
					that.coordX = pos.pageX;
					that.coordY = pos.pageY;
					x = that.btnCoordX += rx;
					y = that.btnCoordY += ry;
					d = Math.sqrt( x * x + y * y );
					if ( d > that.radius ) {
						d = that.radius;
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

		this.jqCtn
			.append( this.jqBtn )
			.on( isTactile ? "touchstart" : "mousedown", ev_hold )
		;

		jqWindow
			.on( isTactile ? "touchend" : "mouseup", ev_release )
			.on( isTactile ? "touchmove" : "mousemove", ev_move )
		;

	};

})();
