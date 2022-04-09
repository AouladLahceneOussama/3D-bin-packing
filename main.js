// Find the latest version by visiting https://cdn.skypack.dev/three.

import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/GLTFLoader.js';
import { clickBoxes } from './src/events';
import { scene } from './src/configurations';
import { ThreeDContainer } from './src/ThreeD_container';

var camera, renderer, controls;
var truck_wheels, truck_support;

init();

animate();

function init() {

  const fov = 60;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 1.0;
  const far = 10000.0;

  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(1000, 400, 800)

  scene.background = new THREE.Color(0xFFFFFF);
  scene.fog = new THREE.FogExp2(0x89b2eb, 0.000002);

  //load the sky to the scene
  loadFloor();
  loadSky();
  loadModels();
  loadContainer();
  cameraController();
  //add light to the scene
  let light = new THREE.DirectionalLight(0xFFFFFF, 0.8);
  light.position.set(120, 1000, -150);
  // light.target.position.set(0, 0, 0);
  light.castShadow = true;
  light.shadow.bias = -0.001;
  light.shadow.mapSize.width = 4096; // default
  light.shadow.mapSize.height = 4096; // default
  light.shadow.camera.near = 0.5; // default
  light.shadow.camera.far = 3000; // default

  light.shadow.camera.left = 3000;
  light.shadow.camera.right = -3000;
  light.shadow.camera.top = 1000;
  light.shadow.camera.bottom = -1000;
  scene.add(light);

  // scene.add(new THREE.CameraHelper(light.shadow.camera));
  // scene.add(new THREE.DirectionalLightHelper(light, 500));

  // //add axis to the scene
  // const axesHelper = new THREE.AxesHelper(300);
  // scene.add(axesHelper);

  // var boxs = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), material)

  // boxs.position.set(100, 100, 100)
  // scene.add(boxs);


  //render the scene
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(ThreeDContainer.clientWidth, ThreeDContainer.clientHeight);
  renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  ThreeDContainer.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 100;
  controls.maxDistance = 3000;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI / 2;
  controls.minPolarAngle = - Math.PI / 2;
  controls.update();

  window.addEventListener('resize', onWindowResize);
  ThreeDContainer.addEventListener('click', clickBoxes);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
}

function render() {
  renderer.render(scene, camera);
}

//load the ground
function loadFloor() {
  // TEXTURES
  const textureLoader = new THREE.TextureLoader();
  const groundBaseColor = textureLoader.load('textures/ground/Concrete_019_BaseColor.jpg');
  const groundNormalMap = textureLoader.load('textures/ground/Concrete_019_Normal.jpg');
  const groundHeightMap = textureLoader.load('textures/ground/Concrete_019_Height.png');
  const groundRoughnessMap = textureLoader.load('textures/ground/Concrete_019_Roughness.jpg');
  const groundAmbientOcclusion = textureLoader.load('textures/ground/Concrete_019_AmbientOcclusion.jpg');

  const WIDTH = 1800
  const LENGTH = 1800
  const NUM_X = 6
  const NUM_Z = 6

  const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 10, 10);
  const material = new THREE.MeshStandardMaterial(
    {
      map: groundBaseColor,
      normalMap: groundNormalMap,
      displacementMap: groundHeightMap,
      displacementScale: 0.3,
      roughnessMap: groundRoughnessMap,
      roughness: 1,
      aoMap: groundAmbientOcclusion,
    })

  for (let i = 0; i < NUM_X; i++) {
    for (let j = 0; j < NUM_Z; j++) {
      const floor = new THREE.Mesh(geometry, material)
      floor.castShadow = false;
      floor.receiveShadow = true;
      floor.rotation.x = - Math.PI / 2
      floor.position.y = - 110

      floor.position.x = i * WIDTH - (NUM_X / 2) * WIDTH
      floor.position.z = j * LENGTH - (NUM_Z / 2) * LENGTH

      scene.add(floor)
    }
  }
}

//load the sky 
function loadSky() {

  const _VS = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`;

  const _FS = `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;
  varying vec3 vWorldPosition;
  void main() {
    float h = normalize( vWorldPosition + offset ).y;
    gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
  }`;

  const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFFF, 0.6);
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  scene.add(hemiLight);

  const uniforms = {
    "topColor": { value: new THREE.Color(0x0077ff) },
    "bottomColor": { value: new THREE.Color(0xffffff) },
    "offset": { value: 33 },
    "exponent": { value: 0.6 }
  };

  uniforms["topColor"].value.copy(hemiLight.color);
  scene.fog.color.copy(uniforms["bottomColor"].value);

  const skyGeo = new THREE.SphereBufferGeometry(4000, 32, 15);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: _VS,
    fragmentShader: _FS,
    side: THREE.BackSide
  });

  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);
}

//load the models
function loadModels() {
  new GLTFLoader().load('models/lift_truck/scene.gltf', function (gltf) {
    const model = gltf.scene;
    if (model) {
      let holders = model.getObjectByName("holders");

      holders.translateZ(10)

      model.scale.set(300, 300, 300)
      model.position.set(-250, -90, 450)
      model.rotation.y = - Math.PI
      model.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(model);
    }
  });

  new GLTFLoader().load('models/pallet_truck/scene.gltf', function (gltf) {
    const model = gltf.scene;
    if (model) {
      model.scale.set(1 / 2, 1 / 2, 1 / 2)
      model.position.set(-450, -25, 700)
      model.rotation.y = Math.PI
      model.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(model);
    }
  });
}

//load the parts of container to use them everywhere
function loadContainer() {
  new GLTFLoader().load('models/truck/truck-wheels.gltf', function (gltf) {
    const model = gltf.scene;
    if (model) {
      model.scale.set(1.5, 2, 1.5)
      model.rotation.y = Math.PI / 2
      model.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      truck_wheels = model;
    }
  });

  new GLTFLoader().load('models/truck/truck-support.gltf', function (gltf) {
    const model = gltf.scene;
    if (model) {
      model.scale.set(2, 2.4, 2)
      model.rotation.y = Math.PI / 2
      model.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      truck_support = model;
    }
  });
}

//control the camera position with animation
function cameraController() {
  $(".cube__face").click(function () {
    let cameraPos = $(this).attr("role");

    //change the camera direction
    if (cameraPos == "front")
      gsap.to(camera.position, {
        duration: 1,
        x: 2000,
        y: 100,
        z: 0,
        ease: "power3.inOut",
      })

    if (cameraPos == "left")
      gsap.to(camera.position, {
        duration: 1,
        x: 0,
        y: 200,
        z: 2000,
        ease: "power3.inOut",
      })

    if (cameraPos == "top")
      gsap.to(camera.position, {
        duration: 1,
        x: 2000,
        y: 1000,
        z: 1200,
        ease: "power3.inOut",
      })

  })
}

//removes the container and the loadedBoxes
function updateScene() {
  scene.remove(scene.getObjectByName("Full_Container"))
  scene.remove(scene.getObjectByName("All_Packs"))
  $("#result").empty();
}

export { camera, truck_wheels, truck_support, updateScene }