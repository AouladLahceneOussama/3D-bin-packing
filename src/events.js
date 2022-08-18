import * as THREE from "../threeJsLib/three.js.r122.js"
import { scale_meter_px, scene } from './configurations.js';
import { ThreeDContainer } from './ThreeD_container.js';
import { camera } from '../sceneConfig';

import Pack from './pack';
import Route from './routes';
import Dragger from './dragAndDrop/dragger.js';
import DragSurface from './dragAndDrop/dragSurface.js';

const rayCaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//function return the pack if he is founded
//if not return false
function findPackShower(event) {
    mouse.x = ((event.clientX - ThreeDContainer.offsetLeft) / (ThreeDContainer.offsetWidth)) * 2 - 1;
    mouse.y = - ((event.clientY - ThreeDContainer.offsetTop) / (ThreeDContainer.offsetHeight)) * 2 + 1;

    // var rect = renderer.domElement.getBoundingClientRect();
    // mouse.x = ( ( event.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
    // mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;

    rayCaster.setFromCamera(mouse, camera);
    var found;
    if (scene.getObjectByName("pack_shower")) {
        found = rayCaster.intersectObjects(scene.getObjectByName("pack_shower").children);
        if (found.length > 0 && found[0].object.userData.clickable) {
            return found;
        }
    }

    return false;
}

function boxEvent(event) {
    if (DragSurface.draggerStat)
        dragBox(event);
    else
        clickBoxes(event);
}

//boxes on click, find the box and change the opacity and fill the update/delete form
function clickBoxes(event) {
    // console.log("clicked")
    let found = findPackShower(event);
    if (found != false) {
        let obj = found[0].object;
        let id = obj.userData.id
        changeTransparencyOfObject(id);
        fillFormWithData(id);
    }
}

function dragBox(event) {
    // console.log("mousePressed")
    let found = findPackShower(event);
    if (found != false) {
        let obj = found[0].object;
        let id = obj.userData.id;

        if (obj.userData.dragDrop)
            new Dragger().start(obj, id);
    }
}

//show the detail of the boxes
function hoverBoxes(event) {
    let found = findPackShower(event);
    if (found != false) {
        let obj = found[0].object;
        if (obj.userData.hover)
            document.body.style.cursor = 'pointer';
    } else
        document.body.style.cursor = '';

}

//change the transparency of the boxes for better view of the result
function changeTransparencyOfObject(id) {
    var boxStat;
    console.log("changing")
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

    // remove the disabled class
    if (pack.subQuantities.length == 0)
        $("#pack_Detail_Priority").removeClass("disabled")
    else
        $("#pack_Detail_Priority").addClass("disabled")


    $("#pack_Detail_Id").val(pack.id);
    $("#pack_Detail_Label").val(pack.label);
    $("#pack_Detail_Width").val(pack.w / scale_meter_px);
    $("#pack_Detail_Height").val(pack.h / scale_meter_px);
    $("#pack_Detail_Lenght").val(pack.l / scale_meter_px);
    $("#pack_Detail_Quantity").val(pack.q);
    $("#pack_Detail_StackingCapacity").val(pack.stackC);
    

    pack.rotateDirections.forEach(dir => {
        $(`#pack_Detail_${dir}`).prop("checked", true);
    });

    $("#multiple-prio div").remove();

    for (let i = 0; i < pack.subQuantities.length; i++) {
        let data = pack.subQuantities[i];

        $("#multiple-prio").append(`
        <div class="sub-content" id="advOptionsPrio${i}">
            <div class="sub-content-inputs">
                <div>
                    <p class="inputLabel">Quantity</p>
                    <input type="number" min="1" value="${data.n}" class="sub-q input">
                </div>
                <div>
                    <p class="inputLabel">Priority</p>
                    <select class="pack_priorities sub-prio input sub-prio-val${i}" data-value="${data.p}" required></select>
                </div>
            </div>
            <div>
                <i class="fa-solid fa-trash removePrioInput" data="${i}"></i>
            </div>
        </div>`)
    }

    Route.initialisePriorityFields();

    let multiPrioVal = $(".sub-prio");
    console.log(multiPrioVal)

    for (let i = 0; i < multiPrioVal.length; i++) {
        let val = parseInt($(`.sub-prio-val${i}`).attr("data-value"));
        console.log($(`.sub-prio-val${i}`).attr("data-value"), val)
        $(`.sub-prio-val${i}`).val(val).change();
    }

    $("#pack_Detail_Priority").val(pack.priority).change();

    if (pack.loaded != undefined && pack.unloaded != undefined)
        $("#packStatut").html(" (" + pack.loaded + " / " + (pack.loaded + pack.unloaded) + ") ")
}



export { clickBoxes, hoverBoxes, boxEvent }

