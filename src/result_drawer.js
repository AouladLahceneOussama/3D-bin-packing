import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { scene } from "./configurations.js";
import Pack from './pack.js';

//load the packages in the certain position with certain rotaion into the scene
function loadPacks(openPoints, packagesLoaded) {
    let allPacks = new THREE.Group();
    allPacks.name = "All_Packs";

    packagesLoaded.forEach(pack => {
        let boxGeometry = new THREE.BoxGeometry(pack.w, pack.h, pack.l);
        let colorMateriel = new THREE.MeshLambertMaterial({ color: pack.color * 0xFF0FFF, side: THREE.DoubleSide })
        let vec3 = new THREE.Vector3(pack.x, pack.y, pack.z);

        //create the group of box and border
        let boxAndBorder = new THREE.Group();
        boxAndBorder.name = "Box_Border_" + pack.parent_id

        //create the box
        let box = new THREE.Mesh(boxGeometry, colorMateriel);
        box.castShadow = true;
        box.receiveShadow = true;
        box.name = "Pack"
        box.userData.id = pack.parent_id;
        box.userData.clickable = false;
        box.userData.actif = false;
        box.userData.name = "Pack";

        //create the outlines of the boxes
        let edges = new THREE.EdgesGeometry(boxGeometry);
        let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
        line.name = "Line_" + pack.id;
        line.position.copy(vec3);
        line.userData.id = pack.parent_id;
        line.userData.name = "Line";

        line.translateX(pack.w / 2);
        line.translateY(pack.h / 2);
        line.translateZ(pack.l / 2);

        //position the box
        box.position.copy(vec3);
        boxGeometry.translate(pack.w / 2, pack.h / 2, pack.l / 2);

        boxAndBorder.add(box);
        boxAndBorder.add(line);
        allPacks.add(boxAndBorder)
    });

    var timeLine = gsap.timeline();
    // for (let i = 0; i < allPacks.children.length; i++) {
    //     timeLine.from(allPacks.children[i].position, {
    //         x: 2000,
    //         y: 0,
    //         z: 0,
    //         ease: Bounce.easeOut,
    //         duration: 0.02,
    //         // Make sure to tell it to update
    //         onUpdate: () => allPacks.children[0].position.needsUpdate = true
    //     });
    // }

    let pointGroup = new THREE.Group();
    pointGroup.name = "sphere";

    openPoints.forEach(p => {
        const geometry = new THREE.SphereGeometry(3, 32, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(p.x, p.y, p.z)
        pointGroup.add(sphere);

    })

    scene.add(pointGroup)
    scene.add(allPacks)
}

function getDifference(array1, array2) {
    return array1.filter(obj1 => {
        return !array2.some(obj2 => {
            return obj1.id === obj2.parent_id;
        });
    });
}

//render the result into the menu
function loadResult(packagesToLoad, packagesLoaded) {
    //empty the result
    $("#result").empty();

    //create the csv file
    csvResult(packagesLoaded);

    let loaded = packagesLoaded.reduce((groupedPack, pack) => {
        let id = pack.parent_id;
        let quantity = packagesToLoad.filter(pack => pack.id == id)[0].q;

        if (groupedPack[id] == null) groupedPack[id] = { id: pack.parent_id, label: pack.label, loaded: 0, unloaded: 0 };
        groupedPack[id].loaded = groupedPack[id].loaded + 1;
        groupedPack[id].unloaded = quantity - groupedPack[id].loaded;

        return groupedPack;
    }, {});

    //get the unloaded packs
    let difference = getDifference(packagesToLoad, packagesLoaded);

    let unloaded = difference.reduce((groupedPack, pack) => {
        if (groupedPack[pack.id] == null) groupedPack[pack.id] = { id: pack.id, label: pack.label, loaded: 0, unloaded: pack.q };
        return groupedPack;
    }, {});

    let result = {
        ...loaded,
        ...unloaded
    }

    //update the allinstances of packages we have with the laoding status
    for (let i = 0; i < Pack.allInstances.length; i++) {
        let id = Pack.allInstances[i].id;
        Pack.allInstances[i] = {
            ...Pack.allInstances[i],
            loaded: result[id].loaded,
            unloaded: result[id].unloaded,
        }
    }

    //fill the result
    for (const obj in result) {
        let id = "<span class='result-text'><b>Id</b><span>" + result[obj].id + "</span></span>";
        let label = "<span class='result-text'><b>Label</b><span>" + result[obj].label + "</span></span>";
        let loaded = "<span class='result-text'><b>Loaded</b><span>" + result[obj].loaded + "</span></span>";
        let unloaded = "<span class='result-text'><b>Unloaded</b><span>" + result[obj].unloaded + "</span></span>";
        $("#result").append("<div class='result-detail'>" + id + label + loaded + unloaded + "</div>")
    }
}

//export csv result
function csvResult(packagesLoaded) {
    const csvString = "data:text/csv;charset=utf-8," + [
        [
            "Id",
            "Label",
            "Width",
            "Height",
            "Lenght",
            "priority",
            "X",
            "Y",
            "Z",
            "RotationFace",
            "RotationAngle",
        ],
        ...packagesLoaded.map(pack => [
            ` ${pack.id}`,
            pack.label,
            pack.w,
            pack.h,
            pack.l,
            pack.priority,
            pack.x,
            pack.y,
            pack.z,
            pack.validRotation,
            //   pack.validRotation[1]
        ])
    ]
        .map(e => e.join(","))
        .join("\n");

    var encodedUri = encodeURI(csvString);
    let fileName = "result_" + new Date().getTime() + ".csv";
    $("#result").append("<a class='download-result' href=" + encodedUri + " download=" + fileName + "> Download <b>" + fileName + "</b> </div>")
}

export {
    loadPacks, loadResult
}