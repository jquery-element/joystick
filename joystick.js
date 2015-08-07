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

		var that = this;

		this.jqCtn
			.append( this.jqBtn )
			.on( isTactile ? "touchstart" : "mousedown", function( e ) { that.ev_hold( e ); } )
		;

		jqWindow
			.on( isTactile ? "touchend" : "mouseup", function( e ) { that.ev_release( e ); } )
			.on( isTactile ? "touchmove" : "mousemove", function( e ) { that.ev_move( e ); } )
		;

	};

	window.joystick.prototype = {
		searchTouch: function( e ) {
			var t, i = 0;
			e = e.changedTouches;
			for ( ; t = e[ i ]; ++i ) {
				if ( t.identifier === this.identifier ) {
					return t;
				}
			}
		},
		ev_hold: function( e ) {
			var t, i = 0, pos = e;
			if ( isTactile ) {
				while ( t = e.changedTouches[ i++ ] ) {
					if ( t.target === this.jqCtn[ 0 ] || t.target === this.jqBtn[ 0 ] ) {
						break;
					}
				}
				if ( !t ) {
					return;
				}
				pos = t;
				this.identifier = t.identifier;
			}
			this.btnCoordX = 0;
			this.btnCoordY = 0;
			e.preventDefault();
			this.coordX = pos.pageX;
			this.coordY = pos.pageY;
			this.isHolding = true;
			this.jqCtn
				.removeClass( "joystick-reset" )
				.addClass( "joystick-show" )
			;
			this.hold.call( this.jqCtn[ 0 ] );
		},
		moveBtn: function( x, y, rx, ry ) {
			this.jqBtn.css({
				marginLeft: x,
				marginTop: y,
			});
			this.move.call(
				this.jqCtn[ 0 ],
				x / this.radius,
				y / this.radius,
				rx,
				ry
			);
		},
		ev_release: function( e ) {
			if ( this.isHolding && ( !isTactile || searchTouch( e ) ) ) {
				e.preventDefault();
				this.isHolding = false;
				this.jqCtn
					.removeClass( "joystick-show" )
					.addClass( "joystick-reset" )
				;
				this.jqBtn.css({
					marginLeft: 0,
					marginTop: 0
				});
				this.moveBtn(
					0,
					0,
					-this.btnCoordX,
					-this.btnCoordY
				);
				this.release.call( this.jqCtn[ 0 ] );
			}
		},
		ev_move: function( e ) {
			if ( this.isHolding ) {
				var
					x, y, a, d, rx, ry,
					pos = e
				;
				if ( isTactile && !( pos = searchTouch( e ) ) ) {
					return;
				}
				e.preventDefault();
				rx = pos.pageX - this.coordX;
				ry = pos.pageY - this.coordY;
				this.coordX = pos.pageX;
				this.coordY = pos.pageY;
				x = this.btnCoordX += rx;
				y = this.btnCoordY += ry;
				d = Math.sqrt( x * x + y * y );
				if ( d > this.radius ) {
					d = this.radius;
				}
				a = Math.atan2( y, x );
				this.moveBtn(
					Math.cos( a ) * d,
					Math.sin( a ) * d,
					rx,
					ry
				);
			}
		}
	};

})();
