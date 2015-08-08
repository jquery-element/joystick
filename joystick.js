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
			.on( isTactile ? "touchstart" : "mousedown", function( e ) { that.ev_hold( e ); } )
		;

		jqWindow
			.on( isTactile ? "touchend" : "mouseup", function( e ) { that.ev_release( e ); } )
			.on( isTactile ? "touchmove" : "mousemove", function( e ) { that.ev_move( e ); } )
		;

	};

	window.joystick.prototype = {
		click: function( x, y ) {
			this.btnCoordX =
			this.btnCoordY = 0;
			this.coordX = x;
			this.coordY = y;
			this.isHolding = true;
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
		},



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
			e.preventDefault();
			this.click(
				pos.pageX,
				pos.pageY
			);
		},
		ev_release: function( e ) {
			if ( this.isHolding && ( !isTactile || searchTouch( e ) ) ) {
				e.preventDefault();
				this.release();
			}
		},
		ev_move: function( e ) {
			if ( this.isHolding ) {
				var pos = e;
				if ( isTactile && !( pos = searchTouch( e ) ) ) {
					return;
				}
				e.preventDefault();
				this.move(
					pos.pageX,
					pos.pageY
				);
			}
		}
	};

})();
