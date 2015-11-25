/*
	joystick - 2.1.0
	https://github.com/jquery-element/joystick
*/

( function( $ ) {

"use strict";

var
	currentJoysticks,
	jqWindow = $( window ),
	onDesktop = ( function() {
		try {
			document.createEvent( "TouchEvent" );
			return false;
		} catch ( e ) {
			return true;
		}
	})()
;

function winMove( e ) {
	var joy, t, i = 0;
	if ( currentJoysticks ) {
		if ( onDesktop ) {
			currentJoysticks.move( e.pageX, e.pageY );
		} else {
			e = e.originalEvent.changedTouches;
			while ( t = e[ i++ ] ) {
				if ( joy = currentJoysticks[ t.identifier ] ) {
					joy.move( t.pageX, t.pageY );
				}
			}
		}
		return false;
	}
}

function winRelease( e ) {
	var joy, t, i = 0;
	if ( currentJoysticks ) {
		if ( onDesktop ) {
			currentJoysticks.release();
			currentJoysticks = null;
		} else {
			e = e.originalEvent.changedTouches;
			while ( t = e[ i++ ] ) {
				if ( joy = currentJoysticks[ t.identifier ] ) {
					joy.release();
					delete currentJoysticks[ t.identifier ];
				}
			}
			if ( $.isEmptyObject( currentJoysticks ) ) {
				currentJoysticks = null;
			}
		}
		return false;
	}
}

jqWindow
	.on( onDesktop ? "mousemove" : "touchmove", winMove )
	.on( onDesktop ? "mouseup" : "touchend", winRelease )
;

$.element({
	name: "joystick",
	html: "<div></div>",
	css: "\
		.joystick {\
			display: inline-block;\
			position: relative;\
			width: 100px;\
			height: 100px;\
			border: 1px solid;\
			border-radius: 50%;\
			transition: opacity 1s ease;\
			opacity: .3;\
			cursor: move;\
		}\
		.joystick,\
		.joystick * {\
			box-sizing: border-box;\
		}\
		.joystick.joystick-show {\
			transition-duration: .2s;\
			opacity: 1;\
		}\
		.joystick:before,\
		.joystick * {\
			position: absolute;\
			width: 50%;\
			height: 50%;\
			left: 25%;\
			top: 25%;\
			border-radius: 50%;\
		}\
		.joystick:before {\
			content: '';\
			box-sizing: content-box;\
			margin: -7px;\
			border: 2px dashed;\
			padding: 5px;\
			opacity: .5;\
		}\
		.joystick * {\
			border: 2px solid;\
			background-position: center;\
			transition-property: border-width;\
			transition-duration: inherit;\
			transition-timing-function: inherit;\
		}\
		.joystick.joystick-show * {\
			border-width: 5px;\
		}\
		.joystick.joystick-reset * {\
			transition-property: border-width, margin;\
			transition-duration: .1s;\
		}\
	",
	init: function() {

		// First, initialize all the user's callback.
		this.init( {} );

		// This is the bouton inside the joystick himself.
		// this.jqElement IS the joystick himself (the container).
		this.jqBtn =
		this.jqElement
			.addClass( "joystick" )
			.children()
		;

		// Attributes.
		this.radius = this.jqElement.width() / 2;
		this.isHolding = false;
		this.btnCoordX =
		this.btnCoordY = 0;

		var that = this;

		this.jqElement
			.on( onDesktop ? "mousedown" : "touchstart", function( e ) {
				var
					t, touches,
					i = 0,
					pos = e
				;

				if ( onDesktop ) {
					currentJoysticks = that;
				} else {
					touches = e.originalEvent.changedTouches;
					while ( t = touches[ i++ ] ) {
						if ( t.target === that.jqElement[ 0 ] || t.target === that.jqBtn[ 0 ] ) {
							break;
						}
					}
					if ( !t ) {
						return;
					}
					pos = t;
					currentJoysticks = currentJoysticks || {};
					currentJoysticks[ t.identifier ] = that;
				}
				that.click(
					pos.pageX,
					pos.pageY
				);
				return false;
			})
		;
	},
	prototype: {

		// public:
		init: function( p ) {
			// User's callbacks.
			this.cbMove    = p.move    || $.noop;
			this.cbHold    = p.hold    || $.noop;
			this.cbRelease = p.release || $.noop;
		},

		// private:
		click: function( x, y ) {
			this.isHolding = true;
			this.btnCoordX =
			this.btnCoordY = 0;
			this.coordX = x;
			this.coordY = y;
			this.jqElement
				.removeClass( "joystick-reset" )
				.addClass( "joystick-show" )
			;
			this.cbHold.call( this.jqElement[ 0 ] );
		},
		moveBtn: function( x, y, rx, ry ) {
			this.jqBtn.css({
				marginLeft: x,
				marginTop: y,
			});
			this.cbMove.call(
				this.jqElement[ 0 ],
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
			this.jqElement
				.removeClass( "joystick-show" )
				.addClass( "joystick-reset" )
			;
			this.moveBtn(
				0, 0,
				-this.btnCoordX,
				-this.btnCoordY
			);
			this.cbRelease.call( this.jqElement[ 0 ] );
		}
	}
});

})( jQuery );
