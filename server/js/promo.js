// globals
var container		=	null;
var renderer		= null;
var	scene				=	null;
var	camera			=	null;
var	controls		=	null;
var globe				= null;
var atmo				= null;

var play				= 1;
var width				=	0;
var width				=	0;
var bk_color 		= 0x000000;
var fov					= 30;
var near_plane	=	0.1;
var far_plane		=	1000;
var last_time		=	0;
var tex_name		= 'img/world.jpg';


var Shaders = {
    'earth' : {
      uniforms: {
        'texture': { type: 't', value: null }
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
        'uniform sampler2D texture;',
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'vec3 diffuse = texture2D( texture, vUv ).xyz;',
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


function init() {
	last_time = Date.now();
	//
	container = document.getElementById( 'viewport' );
	calc_dims();
	//
	scene = new THREE.Scene();
	//
	camera = new THREE.PerspectiveCamera( fov, width / height, near_plane, far_plane );
  camera.position.z = 500;
  camera.position.y = -20;
	camera.lookAt( new THREE.Vector3( 0.0, -20.0, 0.0 ) );
  scene.add( camera );
	//
	var geometry = new THREE.SphereGeometry( 100, 40, 30 );

	var shader = Shaders['earth'];
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	uniforms['texture'].value = THREE.ImageUtils.loadTexture( tex_name, new THREE.UVMapping() );
	//
	var material = new THREE.ShaderMaterial({
		transparency:true,
		uniforms: uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});

	$("img[id='progress']").css("visibility", "hidden");
/*
	var material = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( tex_name, new THREE.UVMapping() ), overdraw: true } );
	var material = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( tex_name, new THREE.UVMapping(), function()
		{
			mesh = new THREE.Mesh( geometry, material );
			scene.add( mesh );
			//
			$("img[id='progress']").css("visibility", "hidden");
			//
			animate();
		} ), overdraw: true } );
*/

	var mesh = new THREE.Mesh( geometry, material );
	globe = mesh;
	//mesh.matrixAutoUpdate = false;
	scene.add( mesh );

/*
	material = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( tex_name, new THREE.UVMapping(), function()
		{
			mesh = new THREE.Mesh( geometry, material );
			scene.add( mesh );
			//
			$("img[id='progress']").css("visibility", "hidden");
			//
			animate();
		} ), overdraw: true } );
	//
*/
	var shader = Shaders['atmosphere'];
  var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
      
	var geometry = new THREE.SphereGeometry( 100, 40, 30 );
  var materiala = new THREE.ShaderMaterial({
          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader,
			    side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true
        });
	var mesh = new THREE.Mesh( geometry, materiala );
	mesh.scale.set( 1.1, 1.1, 1.1 );
	atmo = mesh;
//  mesh.flipSided = true;
//  mesh.matrixAutoUpdate = false;
//  mesh.updateMatrix();
  scene.add(mesh);
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
		last_time = Date.now();
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
	if ( play ) {
		requestAnimationFrame( animate );
	}
	render();
}

function render() {
	var c_time = Date.now();
	var mult = c_time - last_time;
	last_time = c_time;
	//
	if ( globe != null ) {
		globe.rotation.x = 23.439281 * Math.PI / 180.0;
		globe.rotation.y += mult * 0.0003;
		globe.rotation.z = 0.0;
	}
	if ( atmo != null ) {
		//atmo.rotation.y += mult * 0.0003;
	}
	renderer.clear();
	renderer.render(scene, camera);
}