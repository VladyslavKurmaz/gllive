// globals
var clock 			= new THREE.Clock();
var container		=	null;
var renderer		= null;
var	scene				=	null;
var	camera			=	null;
var	controls		=	null;
var globe				= null;
var atmo				= null;
var group				= null;

var play				= 1;
var width				=	0;
var width				=	0;
var bk_color 		= 0x000000;
var fov					= 30;
var near_plane	=	0.1;
var far_plane		=	1000;
var tex_name		= 'img/world.jpg';

var earth_radius= 1.0;
var glow_scale	= 1.1;

var Shaders = {
    'earth' : {
      uniforms: {
        'diff': { type: 't', value: null },
        'decal': { type: 't', value: null }
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
        'uniform sampler2D decal;',
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
animate();

function calc_dims() {
	width = window.innerWidth;
	height = window.innerHeight;
}

function latlng2sph( lat, lng, r ) {
	var phi = (90 - lat) * Math.PI / 180;
	var theta = (180 - lng) * Math.PI / 180;
	return new THREE.Vector3( r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta) );
}



function init() {
	//
	container = document.getElementById( 'viewport' );
	calc_dims();
	//
	scene = new THREE.Scene();
	//
	camera = new THREE.PerspectiveCamera( fov, width / height, near_plane, far_plane );
  camera.position.z = 6.0 * earth_radius;
  camera.position.y = -earth_radius/5.0;
	camera.lookAt( new THREE.Vector3( 0.0, -earth_radius/5.0, 0.0 ) );
  scene.add( camera );
	//
	var geometry = new THREE.SphereGeometry( earth_radius, 40, 30 );

	var tex1 = THREE.ImageUtils.loadTexture( tex_name, new THREE.UVMapping(), function() {
		var tex2 = THREE.ImageUtils.loadTexture( 'img/checker.gif', new THREE.UVMapping(), function() {

			group = new THREE.Object3D();
	
			var shader = Shaders['earth'];
			var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
			uniforms['diff'].value = tex1;
			uniforms['decal'].value = tex2;
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
			mesh.scale.set( glow_scale, glow_scale, glow_scale );
			atmo = mesh;
//  mesh.flipSided = true;
//  mesh.matrixAutoUpdate = false;
//  mesh.updateMatrix();
		group.add( mesh );
		//

		var r = $.getJSON( 'gl-live-items.json', function( data ) {
			for( var i = 0; i < data.location.length; i++ ) {
				var size = 50;

 				var g = new THREE.CubeGeometry(0.025, 0.025, 0.01);
    		g.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-0.005));

    		var point = new THREE.Mesh( g, new THREE.MeshBasicMaterial( { color: 0xFF0000 } ) );
				point.position = latlng2sph( data.location[i].lat, data.location[i].lng, earth_radius );
    		point.lookAt(globe.position);
    		point.scale.z = Math.max( Math.random() * size, 0.1 ); // avoid non-invertible matrix
    		point.updateMatrix();
				group.add( point );
			}
		} );


		//
		var lmaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
		var lgeometry = new THREE.Geometry();
    lgeometry.vertices.push( latlng2sph( 49, 32, 1.1 * earth_radius ) );
    lgeometry.vertices.push( latlng2sph( 52.5, 5.75, 1.1 * earth_radius ) );
    lgeometry.vertices.push( latlng2sph( 0, 0, 1.1 * earth_radius ) );
		var line = new THREE.Line(lgeometry, lmaterial);
		group.add( line );

		//
		scene.add( group );
		$("img[id='progress']").css("visibility", "hidden");
		});
	});
	//
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	//
  renderer.setSize( width, height );
  renderer.autoClear = false;
	renderer.setClearColor( bk_color, 1 );
	container.appendChild( renderer.domElement );
	//
	window.addEventListener( 'resize', resize, false );
	//
	$( "#viewport" ).mousedown(function() {
		play = (play)?(0):(1);
		clock.getDelta();
		animate();
	});
	animate();
}

function resize( event ) {
	calc_dims();
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize( width, height );
	animate();
}

function animate() {
	render();
	if ( play ) {
		requestAnimationFrame( animate );
	}
}

function render() {
	var mult = mult = clock.getDelta() / 3.0;
	//
	if ( group != null ) {
		group.rotation.x = 0.0;//23.439281 * Math.PI / 180.0;
		group.rotation.y += mult;
		group.rotation.z = 0.0;
	}
	renderer.clear();
	renderer.render(scene, camera);
}