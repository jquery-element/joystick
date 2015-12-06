# joystick

``` html
<script src="//code.jquery.com/jquery-3.0.0-alpha1.min.js"></script>
<script src="//jquery-element.github.io/jquery-element-1.7.0.js"></script>
<script src="//jquery-element.github.io/joystick-2.0.0.js"></script>
<script>
$( function() {

		$( ".joystick" ).element().init({
			move:    function( x, y, rx, ry ) {},
			hold:    function() {},
			release: function() {}
		});

});
</script>

<div data-jquery-element="joystick"></div>

```
