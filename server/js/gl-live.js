

// configuration constants
var viewSwapTimeout			= 1 * 60 * 1000;
var newsSlideTimeout 		= 1000;
var newsBkPadding				= 10;
var feedPadding					= 5;


//calcDims();
//window.addEventListener( 'resize', resize, false );

init();

function calcDims() {
	width = $(window).width();
	height = $(window).height();
	//
	var magic_size = 14 * height / 707; 
  $('body').css('font-size', magic_size + 'px');
	//
  $('#news-p1').css({
		left: 0,
		top: 0,
    width: width / 2,
    height: height 
	});
  $('#news-b1').css({
    height: height-2*newsBkPadding 
	});
  $('#news-p2').css({
		left: width / 2,
		top: 0,
    width: width / 2,
    height: height / 2
	});
  $('#news-b2').css({
    height: height/2-2*newsBkPadding 
	});
  $('#news-p3').css({
		left: width / 2,
		top: height / 2,
    width: width / 4,
    height: height / 2 
	});
  $('#news-b3').css({
    height: height/2-2*newsBkPadding 
	});
  $('#feed-facebook').css({
    height: height/2-2 * ( newsBkPadding + feedPadding )
	});
  $('#news-p4').css({
		left: 3 * width / 4,
		top: height / 2,
    width: width / 4,
    height: height / 2 
	});
  $('#news-b4').css({
    height: height/2-2*newsBkPadding 
	});
  $('#feed-twitter').css({
    height: height/2-2 * ( newsBkPadding + feedPadding )
	});
}


function init() {
	//
	calcDims();
	//
	toggleBreakNews();
	swapTimerId = setInterval( function() { toggleBreakNews(); }, viewSwapTimeout );
	//
	// EVENTS
	window.addEventListener( 'resize', resize, false );
	//
	$( window ).mousedown(function() {
		toggleBreakNews();
	});
}


function toggleBreakNews() {
	$( "#news-p1" ).toggle( "slide", { direction: "left" }, newsSlideTimeout );
	$( "#news-p2" ).toggle( "slide", { direction: "up" }, newsSlideTimeout );
	$( "#news-p3" ).toggle( "slide", { direction: "down" }, newsSlideTimeout );
	$( "#news-p4" ).toggle( "slide", { direction: "right" }, newsSlideTimeout );
}

function resize( event ) {
	calcDims();
}

/*
twitter
vladyslav.kurmaz@globallogic.com
a
GloballogicLive
*/