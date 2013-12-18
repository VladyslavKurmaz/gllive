// globals
var container		=	null;
var renderer		= null;
var	scene				=	null;
var	camera			=	null;
var	controls		=	null;
var geometry		= null;
var material		=	null;
var	mesh				=	null;

var play				= 1;
var width				=	0;
var width				=	0;
var bk_color 		= 0x808080;
var fov					= 60;
var near_plane	=	0.1;
var far_plane		=	100;
var last_time		=	0;
var tex_name		= 'img/world.jpg';//'img/earthmap.jpg';



init();
animate();

function init() {
	last_time = Date.now();
	//
	$( "#viewport" ).mousedown(function() {
		play = (play)?(0):(1);
		last_time = Date.now();
		animate();
	});
	//
	container = document.getElementById( 'viewport' );
	width = $('#viewport').innerWidth();
	height = $('#viewport').innerHeight();
	//
	scene = new THREE.Scene();
	//
	camera = new THREE.PerspectiveCamera( fov, width / height, near_plane, far_plane );
  camera.position.z = 2;
  scene.add( camera );
	//

	material = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( tex_name, new THREE.UVMapping(), function()
		{
			geometry = new THREE.SphereGeometry( 1, 32, 32 );
			mesh = new THREE.Mesh(geometry, material);
  		scene.add( mesh );
			animate();
			$("img[id='loader']").css("visibility", "hidden");
		} ), overdraw: true } );
/*
	geometry = new THREE.CubeGeometry( 1, 1, 1 );
	material = new THREE.MeshBasicMaterial( { color:0xFF0000 } );
*/

	//renderer = new THREE.CanvasRenderer( { antialias: true } );
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	//
  renderer.setSize( width, height );
	renderer.setClearColor( bk_color, 1 );
	container.appendChild( renderer.domElement );
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
	renderer.render(scene, camera);
}