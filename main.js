import * as THREE from "./threeJsLib/three.js.r122.js"
import { OrbitControls } from './threeJsLib/orbitControls.js';
import { GLTFLoader } from './threeJsLib/gltfLoader.js';
import { boxEvent, hoverBoxes } from './src/events';
import { scene } from './src/configurations';
import { popUp, ThreeDContainer, affectModelsToVar } from './src/ThreeD_container';
import { initSceneConfiguration } from "./sceneConfig.js"
import Logger from './src/logger';
import * as dat from 'dat.gui';

// const gui = new dat.GUI();

var camera, renderer, controls;

const loader = new GLTFLoader();

init();
animate();
appLoader();

function init() {

    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 10000.0;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(1000, 400, 800)
    // gui.add( camera.position , 'x', -3000, 3000 ).step(5)
    // gui.add( camera.position , 'y', 0, 3000 ).step(5)
    // gui.add( camera.position , 'z', -3000, 3000 ).step(5)


    scene.background = new THREE.Color(0xFFFFFF);
    scene.fog = new THREE.FogExp2(0x89b2eb, 0.000002);

    //load the sky to the scene
    loadFloor();
    loadSky();
    cameraController();

    //add light to the scene
    let light = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    light.position.set(120, 1000, -150);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096; // default
    light.shadow.mapSize.height = 4096; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 3000; // default
    light.name = "directionalLight"

    light.shadow.camera.left = 3000;
    light.shadow.camera.right = -3000;
    light.shadow.camera.top = 1000;
    light.shadow.camera.bottom = -1000;
    scene.add(light);

    // add the axis helper to the scene
    // const axesHelper = new THREE.AxesHelper( 1200 );
    // scene.add( axesHelper );

    //render the scene
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
    ThreeDContainer.addEventListener('mousemove', hoverBoxes)
    ThreeDContainer.addEventListener('pointerdown', boxEvent);
    if (popUp != null)
        popUp.addEventListener('mouseenter', onWindowResize);

    initSceneConfiguration(camera, renderer, controls)
}

function onWindowResize() {
    camera.aspect = ThreeDContainer.clientWidth / ThreeDContainer.clientHeight
    camera.updateProjectionMatrix();

    renderer.setSize(ThreeDContainer.clientWidth, ThreeDContainer.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}

//wait loading models to the app
function modelLoader(url) {
    return new Promise((resolve, reject) => {
        loader.load(url, data => resolve(data), null, reject);
    });
}

//async function that take care of loading the models into the app
async function appLoader() {
    const start = new Date().getTime();

    const lift_truck_model = await modelLoader('models/lift_truck/scene.gltf');
    const pallet_truck_model = await modelLoader('models/pallet_truck/scene.gltf');
    const truck_wheels_model = await modelLoader('models/truck/truck-wheels.gltf');
    const truck_support_model = await modelLoader('models/truck/truck-support.gltf');

    traitModels(lift_truck_model.scene, { x: 300, y: 300, z: 300 }, { x: -250, y: -90, z: 450 }, - Math.PI, true);
    traitModels(pallet_truck_model.scene, { x: 1 / 2, y: 1 / 2, z: 1 / 2 }, { x: -450, y: -25, z: 700 }, - Math.PI, true);
    traitModels(truck_wheels_model.scene, { x: 3 / 2, y: 2, z: 3 / 2 }, {}, Math.PI / 2, false);
    traitModels(truck_support_model.scene, { x: 2, y: 2.4, z: 2 }, {}, Math.PI / 2, false);

    affectModelsToVar(truck_wheels_model.scene, truck_support_model.scene)

    const end = new Date().getTime();

    let logger = new Logger("Chargement des models, styles, ...", (end - start) * Math.pow(10, -3));
    logger.dispatchMessage();

    $(".threeD-container-loader").toggleClass("threeD-container-loader--show threeD-container-loader--hide")

}

//trait the models by adding scale\position\rotation and shadows 
function traitModels(model, scale, position, rotation, addToScene) {
    let holders = model.getObjectByName("holders")
    if (holders != null || holders != undefined)
        holders.translateZ(10)

    model.scale.set(scale.x, scale.y, scale.z)
    model.rotation.y = rotation
    model.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    if (addToScene) {
        model.position.set(position.x, position.y, position.z)
        scene.add(model);
    }
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
    hemiLight.name = "hemisphereLight"
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

// export { camera, renderer, controls, transformControl }
