// globals
var container		=	null;
var renderer		= null;
var	scene				=	null;
var	scenea			=	null;
var	camera			=	null;
var	controls		=	null;
var geometry		= null;
var material		=	null;
var	mesh				=	null;

var play				= 1;
var width				=	0;
var width				=	0;
var bk_color 		= 0x000000;
var fov					= 60;
var near_plane	=	0.1;
var far_plane		=	100;
var last_time		=	0;
var tex_name		= 'img/world.jpg';



init();
animate();

function calc_dims() {
	width = window.innerWidth;
	height = window.innerHeight;
}


function init() {

var Shaders = {
    'earth' : {
      uniforms: {
        'texture': { type: 't', value: 0, texture: null }
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
          'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
          'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
        '}'
      ].join('\n')
    }
};

	last_time = Date.now();
	//
	$( "#viewport" ).mousedown(function() {
		play = (play)?(0):(1);
		last_time = Date.now();
		animate();
	});
	//
	container = document.getElementById( 'viewport' );
	calc_dims();
	//
	scene = new THREE.Scene();
	//
	camera = new THREE.PerspectiveCamera( fov, width / height, near_plane, far_plane );
  camera.position.z = 2.5;
  scene.add( camera );
	//
	geometry = new THREE.SphereGeometry( 1, 20, 15 );

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

	scenea = new THREE.Scene();
	var shader = Shaders['atmosphere'];
  var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
      
  var materiala = new THREE.ShaderMaterial({

          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader

        });


    mesh = new THREE.Mesh( geometry, materiala);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.9;
    mesh.flipSided = true;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    scenea.add(mesh);

	//
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	//
  renderer.setSize( width, height );
  renderer.autoClear = false;
	renderer.setClearColor( bk_color, 1 );
	container.appendChild( renderer.domElement );
	//
	window.addEventListener( 'resize', resize, false );
}

function resize( event ) {
	calc_dims();
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize( width, height );
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
	if ( mesh != null ) {
		mesh.rotation.x = 0.5;
		mesh.rotation.y += mult * 0.0003;
		mesh.rotation.z = 0.0;
	}
	renderer.clear();
	renderer.render(scene, camera);
	renderer.render(scenea, camera);
}