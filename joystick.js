/*
	Joystick-HTML5 - 2.0.0
	https://github.com/Mr21/joystick-html5
*/

"use strict";

(function() {

	var
		joystickCurrent,
		jqWindow = $( window ),
		isTactile = window.ontouchstart === null
	;

	function winMove( e ) {
		var joy, t;
		if ( joystickCurrent ) {
			e.preventDefault();
			if ( !isTactile ) {
				joystickCurrent.move( e.pageX, e.pageY );
			} else {
				e = e.changedTouches;
				while ( t = e[ i++ ] ) {
					if ( joy = joystickCurrent[ t.identifier ] ) {
						joy.move( t.pageX, t.pageY );
					}
				}
			}
		}
	}

	function winRelease( e ) {
		var joy, t;
		if ( joystickCurrent ) {
			e.preventDefault();
			if ( !isTactile ) {
				joystickCurrent.release();
				joystickCurrent = null;
			} else {
				e = e.changedTouches;
				while ( t = e[ i++ ] ) {
					if ( joy = joystickCurrent[ t.identifier ] ) {
						joy.release();
						delete joystickCurrent[ t.identifier ];
					}
				}
				if ( $.isEmptyObject( joystickCurrent ) ) {
					joystickCurrent = null;
				}
			}
		}
	}

	jqWindow
		.on( isTactile ? "touchmove" : "mousemove", winMove )
		.on( isTactile ? "touchend" : "mouseup", winRelease )
	;

	window.joystick = function( p ) {

		// User's callbacks
		this.cbMove    = p.move    || $.noop;
		this.cbHold    = p.hold    || $.noop;
		this.cbRelease = p.release || $.noop;

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

		var that = this;

		this.jqCtn
			.append( this.jqBtn )
			.on( isTactile ? "touchstart" : "mousedown", function( e ) {
				var t, i = 0, pos = e;
				if ( !isTactile ) {
					joystickCurrent = that;
				} else {
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
					joystickCurrent[ t.identifier ] = that;
				}
				e.preventDefault();
				that.click(
					pos.pageX,
					pos.pageY
				);
			})
		;
	};

	window.joystick.prototype = {
		click: function( x, y ) {
			this.isHolding = true;
			this.btnCoordX =
			this.btnCoordY = 0;
			this.coordX = x;
			this.coordY = y;
			this.jqCtn
				.removeClass( "joystick-reset" )
				.addClass( "joystick-show" )
			;
			this.cbHold.call( this.jqCtn[ 0 ] );
		},
		moveBtn: function( x, y, rx, ry ) {
			this.jqBtn.css({
				marginLeft: x,
				marginTop: y,
			});
			this.cbMove.call(
				this.jqCtn[ 0 ],
				x / this.radius,
				y / this.radius,
				rx, ry
			);
		},
		move: function( x, y ) {
			var a, d, rx, ry;
			rx = x - this.coordX;
			ry = y - this.coordY;
			this.coordX = x;
			this.coordY = y;
			x = this.btnCoordX += rx;
			y = this.btnCoordY += ry;
			d = Math.min( Math.sqrt( x * x + y * y ), this.radius );
			a = Math.atan2( y, x );
			this.moveBtn(
				Math.cos( a ) * d,
				Math.sin( a ) * d,
				rx, ry
			);
		},
		release: function() {
			this.isHolding = false;
			this.jqCtn
				.removeClass( "joystick-show" )
				.addClass( "joystick-reset" )
			;
			this.moveBtn(
				0, 0,
				-this.btnCoordX,
				-this.btnCoordY
			);
			this.cbRelease.call( this.jqCtn[ 0 ] );
		}
	};

})();
