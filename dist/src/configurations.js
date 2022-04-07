import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';

//conversion parameters
const scale_meter_px = 100;
const extra_margin = 0.01 * 100;

//the 3d scene (canvas)
const scene = new THREE.Scene();

export {
    scale_meter_px,
    extra_margin,
    scene,
}