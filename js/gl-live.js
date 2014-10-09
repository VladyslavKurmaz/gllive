// TODO
// define two different timeouts for globe and feed
// add lines between locations
// implement facebook and tweeter
// read news from json file
// find news sources / parsing
// add color gradient to the bars
// change casousel direction


// configuration constants
var viewSwapTimeout				= 1000 * 60;
var newsUpdateTimeout			= 1000 * 60 * 60;
var socialsUpdateTimeout	= 1000 * 60 * 30;
var statsUpdateTimeout		= 1000 * 60 * 60 * 24;
var carouselTimeout 			= 1000 * 5;
var pointsSlideTimeout		= 1000 * 0.5;
var newsSlideTimeout 			= 1000 * 2;

var newsBkPadding					= 10;
var feedPadding						= 5;
var globeRotationSpeed 		= 0.00025;
var globeRadius						= 1.0;
var globeGlowScale				= 1.1;


// globals
var container							=	null;
var renderer							= null;
var	scene									=	null;
var	camera								=	null;
var	controls							=	null;
var globe									= null;
var atmo									= null;
var group									= null;
var points								= [];
var prevValues						= [];
var nextValues						= [];
var stats									= [];

var prevTime							= null;
var width									=	0;
var height								=	0;
var bkColor 							= 0x000000;
var fov										= 30;
var nearPlane							=	0.1;
var farPlane							=	1000;
var texName								= 'img/world.png';//jpg';
var pointsSlideTime				= 0.0;

var pointSize							= 0.015;
var pointMinHeight				= 0.01;
var pointMaxHeight				= 50;
var	pointColor						=	0xE46736;//0xf3a137;//0xf6d50e;//0xf15738;

var Shaders = {
    'earth' : {
      uniforms: {
        'diff': { type: 't', value: null }
      },
      vertexShader: [
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
          'vNormal = normalize( normalMatrix * normal );',
          'vUv = uv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D diff;',
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'vec3 diffuse = texture2D( diff, vUv ).xyz;',
          'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
          'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
          'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
        '}'
      ].join('\n')
    },
    'atmosphere' : {
      uniforms: {},
      vertexShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'vNormal = normalize( normalMatrix * normal );',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, -0.05, 1.0 ) ), 8.0 );',
          'gl_FragColor = vec4( 1.0, 1.0, 1.0, 0.7 ) * intensity;',
        '}'
      ].join('\n')
    }
  };

init();

function init() {
	container = document.getElementById( 'viewport' );
	calcDims();
	//
	// RENDER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	//
  renderer.setSize( width, height );
  renderer.autoClear = false;
	renderer.setClearColor( bkColor, 1 );
	container.appendChild( renderer.domElement );
	//
	scene = new THREE.Scene();
	//
	// CAMERA
	camera = new THREE.PerspectiveCamera( fov, width / height, nearPlane, farPlane );
  camera.position.z = 6.0 * globeRadius;
  camera.position.y = -globeRadius/5.0;
	camera.lookAt( new THREE.Vector3( 0.0, -globeRadius/5.0, 0.0 ) );
  scene.add( camera );
	//
	var tex1 = THREE.ImageUtils.loadTexture( texName, new THREE.UVMapping(), function() {
		//
		var geometry = new THREE.SphereGeometry( globeRadius, 40, 30 );
		//
		group = new THREE.Object3D();
		//
		var shader = Shaders['earth'];
		var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
		uniforms['diff'].value = tex1;
		//
		var material = new THREE.ShaderMaterial({
				transparency:true,
				uniforms: uniforms,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader});
		var mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.y = Math.PI;
		globe = mesh;
		group.add( mesh );
		//
		var shader = Shaders['atmosphere'];
 		var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
     
 		var materiala = new THREE.ShaderMaterial({
         uniforms: uniforms,
         vertexShader: shader.vertexShader,
         fragmentShader: shader.fragmentShader,
		    side: THREE.BackSide,
         blending: THREE.AdditiveBlending,
         transparent: true
       });
		var mesh = new THREE.Mesh( geometry, materiala );
		mesh.scale.set( globeGlowScale, globeGlowScale, globeGlowScale );
		atmo = mesh;
		group.add( mesh );
		//
		scene.add( group );
		//
		// background
		var bg = new THREE.Mesh(
		  new THREE.PlaneGeometry(6.4, 3.6, 0),
//		  new THREE.MeshBasicMaterial({color: 0xFFFFFF})
		  new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("img/bk.png")})
		);
		bg.position.z = -1;
		scene.add( bg );
		//
		$.getJSON( 'locations.php', function( data ) {
			//
			prevValues = new Array( data.location.length );
			nextValues = new Array( data.location.length );
			for( var i = 0; i < data.location.length; i++ ) {
				prevValues[i] = 0.0;
				nextValues[i] = 0.0;
				//var g = new THREE.CubeGeometry(pointSize, pointSize, pointMinHeight);
				//var mtx = new THREE.Matrix4().makeTranslation( 0,0,-pointMinHeight/2 );
 				var g = new THREE.CylinderGeometry(pointSize, pointSize, pointMinHeight);
				var mtx = new THREE.Matrix4().makeRotationX( Math.PI/2 );
				mtx.setPosition( new THREE.Vector3( 0,0,-pointMinHeight/2 ) );
				//
    		g.applyMatrix( mtx );
				//
   			var point = new THREE.Mesh( g, new THREE.MeshBasicMaterial( { transparent: false, opacity: 0.75, color: pointColor } ) );
				point.position = latlng2sph( data.location[i].lat, data.location[i].lng, globeRadius );
   			point.lookAt(globe.position);
    		point.updateMatrix();
				points.push( point );
				group.add( point );
			}
			//
			$.getJSON( 'stats.json', function( data ) {
				stats = data;
				for( var i = 0; i < stats.stat.length; i++ ) {
					// normalize data
					var mi = stats.stat[i].data[0];
					var ma = stats.stat[i].data[0];
  					var c = stats.stat[i].data.length; 
					while (c--) {
						if ( mi > stats.stat[i].data[c] ) {
							mi = stats.stat[i].data[c];
						}
						if ( ma < stats.stat[i].data[c] ) {
							ma = stats.stat[i].data[c];
						}
					}
					//
	  				c = stats.stat[i].data.length; 
					if ( mi == ma ) {
						while (c--){
		 					stats.stat[i].data[c] = mi;
						}
					} else {
						while (c--){
		 					stats.stat[i].data[c] = ( stats.stat[i].data[c] - mi ) / ( ma - mi);
						}
					}
	  				c = stats.stat[i].data.length; 
					while (c--) {
						stats.stat[i].data[c] = Math.max( stats.stat[i].data[c] * pointMaxHeight, pointMinHeight );
					}
					//
					var a ='';
					if ( !i ) {
						a = ' active';
					}
					$('.carousel-inner').append('<div class="item'+a+'">'+stats.stat[i].title+'</div>');
				}
				//
				$('.carousel').carousel( { interval: carouselTimeout } );
				$('#carousel-globe').on('slide.bs.carousel', function () {
					var index = $('#carousel-globe .active').index('#carousel-globe .item');
					for( var i = 0; i < points.length; i++ ) {
						prevValues[i] = points[i].scale.z;
					}
				});
				$('#carousel-globe').on('slid.bs.carousel', function () {
					var index = $('#carousel-globe .active').index('#carousel-globe .item');
					//alert( index );
					slidePoints( index );
				})
				// start points sliding
				slidePoints( 0 );
				//
				//toggleBreakNews();
				updateNews();
				updateSocials();
				updateStats();
				//
				// EVENTS
				window.addEventListener( 'resize', resize, false );
				//
				$( window ).mousedown(function() {
					slideBreakNews();
					$("div[id='progress-bk']").css("visibility", "hidden");
				});
				//
				requestAnimationFrame( animate );
				//
				$("div[id='progress-bk']").css("visibility", "hidden");
			});
		});
	});
}


function toggleBreakNews() {
	slideBreakNews();
	setTimeout( toggleBreakNews, viewSwapTimeout );
}

function slideBreakNews() {
	$( "#news-p1" ).toggle( "slide", { direction: "left" }, newsSlideTimeout );
	$( "#news-p2" ).toggle( "slide", { direction: "up" }, newsSlideTimeout );
	$( "#news-p3" ).toggle( "slide", { direction: "down" }, newsSlideTimeout );
	$( "#news-p4" ).toggle( "slide", { direction: "right" }, newsSlideTimeout );
}

function updateNews() {
	$.getJSON( 'news.php', function( data ) {
		//alert( JSON.stringify( data ) );
		setTimeout( updateNews, newsUpdateTimeout );
	} );
}

function updateSocials() {
	$.getJSON( 'socials.php', function( data ) {
		//alert( JSON.stringify( data ) );
		setTimeout( updateSocials, socialsUpdateTimeout );
	} );
}

function updateStats() {
	$.getJSON( 'stats.php', function( data ) {
		//alert( JSON.stringify( data ) );
		setTimeout( updateStats, statsUpdateTimeout );
	} );
}

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

function slidePoints( n ) {
	for( var i = 0; i < stats.stat[n].data.length; i++ ) {
		nextValues[i] = stats.stat[n].data[i];
	}
	pointsSlideTime = pointsSlideTimeout;
	//window.console.log("slide");
}

function latlng2sph( lat, lng, r ) {
	var phi = (90 - lat) * Math.PI / 180;
	var theta = (180 - lng) * Math.PI / 180;
	return new THREE.Vector3( r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta) );
}

function resize( event ) {
	calcDims();
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize( width, height );
}

function animate( timestamp ) {
	render( timestamp );
	requestAnimationFrame( animate );
}

function render( timestamp ) {
  if ( prevTime === null ) prevTime = timestamp;
	var dt = timestamp - prevTime;
	prevTime = timestamp;
	// slide points
	if ( pointsSlideTime > 0 ) {
		pointsSlideTime -= dt;
		if ( pointsSlideTime < 0 ) {
			pointsSlideTime = 0;
		}
		//
		var mlt = ( pointsSlideTimeout - pointsSlideTime ) / pointsSlideTimeout;
		//window.console.log(dt, pointsSlideTime, mlt);
		for( var i = 0; i < points.length; i++ ) {
			var v = prevValues[i] + ( nextValues[i] - prevValues[i] ) * mlt;
 			points[i].scale.z = v;
 			points[i].updateMatrix();
		}
	}
	//
	var x = 0.0;//23.439281 * Math.PI / 180.0;
	var y = dt * globeRotationSpeed;
	var z = 0.0;
	//
	renderer.clear();
	if ( ( scene != null ) && ( group != null ) ) {
		group.rotation.x = x;
		group.rotation.y += y;
		group.rotation.z = z;
		renderer.render( scene, camera );
	}
}

/*
twitter
vladyslav.kurmaz@globallogic.com
a
GloballogicLive
*/