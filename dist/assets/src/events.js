import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { scale_meter_px, scene } from './configurations';
import { ThreeDContainer } from './ThreeD_container';
import { camera } from '../main';

import Pack from './pack';

const rayCaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//boxes on click, find the box and change the opacity and fill the update/delete form
function clickBoxes(event) {

    mouse.x = ((event.clientX - ThreeDContainer.offsetLeft) / (window.innerWidth - ThreeDContainer.offsetLeft)) * 2 - 1;
    mouse.y = - ((event.clientY - ThreeDContainer.offsetTop) / (window.innerHeight - ThreeDContainer.offsetTop)) * 2 + 1;

    rayCaster.setFromCamera(mouse, camera);
    var found;
    if (scene.getObjectByName("pack_shower")) {
        found = rayCaster.intersectObjects(scene.getObjectByName("pack_shower").children);

        if (found.length > 0 && found[0].object.userData.clickable) {
            let id = found[0].object.userData.id
            changeTransparencyOfObject(id);
            fillFormWithData(id);
        }
    }
}

//change the transparency of the boxes for better view of the result
function changeTransparencyOfObject(id) {
    var boxStat;

    scene.traverse((obj) => {
        if ((obj.userData.name === 'Pack' || obj.userData.name == "Line") && obj.userData.id == id) {
            boxStat = obj.userData.actif;
        }
    });

    scene.traverse((obj) => {
        if (obj.userData.name === 'Pack' || obj.userData.name == "Line") {
            if (boxStat) {
                obj.material.transparent = false;
                obj.material.opacity = 1;
                obj.userData.actif = false;
                obj.castShadow = true;
            }
            else {
                if (obj.userData.id == id) {
                    obj.userData.actif = true;
                    obj.material.transparent = false;
                    obj.material.opacity = 1;
                    obj.castShadow = true;
                }
                if (obj.userData.id != id) {
                    obj.userData.actif = false;
                    obj.material.transparent = true;
                    obj.material.opacity = 0.2;
                    obj.castShadow = false;
                }
            }
        }
    }
    );
}

//fill the detail form of the pack
function fillFormWithData(id) {

    //unchek all the checkboxes
    ["base", "right-side", "front-side"].forEach(dir => {
        $(`#pack_Detail_${dir}`).prop("checked", false);
    });

    //find the pack from the instances with the specific id
    var pack = Pack.allInstances.find((pack) => pack.id == id);

    $("#pack_Detail_Id").val(pack.id);
    $("#pack_Detail_Label").val(pack.label);
    $("#pack_Detail_Width").val(pack.w / scale_meter_px);
    $("#pack_Detail_Height").val(pack.h / scale_meter_px);
    $("#pack_Detail_Lenght").val(pack.l / scale_meter_px);
    $("#pack_Detail_Quantity").val(pack.q);
    $("#pack_Detail_StackingCapacity").val(pack.stackC);
    $("#pack_Detail_Priority").val(pack.priority);

    pack.rotateDirections.forEach(dir => {
        $(`#pack_Detail_${dir}`).prop("checked", true);
    });

    if (pack.loaded != undefined && pack.unloaded != undefined)
        $("#packStatut").html(" (" + pack.loaded + " / " + (pack.loaded + pack.unloaded) + ") ")
}



export { clickBoxes }