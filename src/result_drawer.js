import * as THREE from "../threeJsLib/three.js.r122.js"
import { scale_meter_px, scene } from "./configurations.js";
import { renderer, camera } from "../sceneConfig.js";
import Pack from './pack.js';
import { ThreeDContainer } from './ThreeD_container';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import Container from "./container.js";

var boxInstances = [];
var breakPoints = [];

const PositionMatrix = function () {

    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    return function (matrix, pos) {

        position.x = pos.x;
        position.y = pos.y;
        position.z = pos.z;

        rotation.x = 0;
        rotation.y = 0;
        rotation.z = 0;

        quaternion.setFromEuler(rotation);

        scale.x = scale.y = scale.z = 1;

        matrix.compose(position, quaternion, scale);

    };

}();

//generate the pdf 
async function generatePDF() {

    let today = new Date().toLocaleDateString()

    console.log(today)

    const images = await takeScreenShots()
    const doc = new jsPDF();

    doc.setFontSize(10)
    doc.text(12, 10, 'Packer solver')

    doc.setFontSize(10)
    doc.text(180, 10, today)

    // draw grey lines
    doc.setDrawColor(176, 176, 176)
    doc.setLineWidth(0.5)
    doc.line(10, 12, 200, 12)


    //project notes

    doc.setFontSize(12)
    doc.text(14, 20, "Project notes")

    doc.setDrawColor(176, 176, 176)
    doc.rect(14, 22, 180, 15)

    doc.setFontSize(10)
    doc.setTextColor(176, 176, 176)
    doc.text(18, 31, "Please follow the structure down. Any issues contact your manager")

    // add images of the loading 
    // need some extra work ????????
    // front right image ????

    // front-view
    doc.addImage(images[0], 'PNG', 30, 55, 80, 80)
    doc.setFontSize(10)
    doc.setTextColor(0)
    doc.text(40, 80, 'Front side')

    doc.setDrawColor(176, 176, 176) // draw red lines
    doc.setLineWidth(0.1)
    doc.line(110, 80, 110, 110) // vertical line

    //backSide-view
    doc.addImage(images[2], 'PNG', 110, 61, 80, 80)
    doc.setFontSize(10)
    doc.setTextColor(0)
    doc.text(165, 80, 'Back side')

    // top-view
    doc.addImage(images[1], 'PNG', 55, -30, 160, 160)
    // doc.setFontSize(10)
    // doc.text(105, 40, 'Top side')

    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text(14, 118, 'Details of the container')
    autoTable(doc, {
        html: '#myContainerTable',
        startY: 120,
        styles: { halign: 'center' },
    })

    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text(14, 148, 'Details of the packages')
    // add the table containing all the info about the packs and they status
    autoTable(doc, {
        html: '#myTable',
        startY: 150,
        // bodyStyles: { minCellHeight: 15 },
        styles: { halign: 'center' },
        didDrawCell: function (data) {
            // console.log(data)
            if (data.column.index === 0 && data.cell.section === 'body') {
                var color = data.cell.raw.attributes.data.value;
                var x = data.cell.x;
                var y = data.cell.y;

                data.cell.text = []
                // var dim = data.cell.height - data.cell.padding('vertical');
                // var textPos = data.cell.textPos;

                // console.log(color)
                doc.setDrawColor(255, 255, 255)
                doc.setFillColor(Math.floor(color / (256 * 256)), Math.floor(color / 256) % 256, color % 256)
                doc.rect(x + 2, y + 1.5, 5, 5, 'FD')
            }
        }
    })

    doc.save("packer_result.pdf");
}


function fillTableWithPacksDetails() {

    //empty the body of the tables
    $("#myContainerTable tbody tr").remove()
    $("#myTable tbody tr").remove()

    //fill again the tables with data
    Pack.allInstances.forEach(pack => {
        $("#myTable tbody").append(`
            <tr>
                <td data="${pack.color * 0xFF0FFF}"></td>
                <td>${pack.label}</td>
                <td>${pack.w / scale_meter_px} x ${pack.h / scale_meter_px} x ${pack.l / scale_meter_px}</td>
                <td>${pack.v / Math.pow(scale_meter_px, 3)}</td>
                <td>${pack.q}</td>
                <td>${pack.loaded}</td>
            </tr>
        `)
    })

    let vTotal = Pack.allInstances.reduce((volumeTotal, pack) => {
        return volumeTotal + ((pack.v / Math.pow(scale_meter_px, 3)) * pack.loaded)
    }, 0);

    console.log(vTotal, (vTotal * 100) / Container.instances.capacity / Math.pow(scale_meter_px, 3))
    $("#myContainerTable tbody").append(`
        <tr>
            <td>${Container.instances.w / scale_meter_px} x ${Container.instances.h / scale_meter_px} x ${Container.instances.l / scale_meter_px}</td>
            <td>${Container.instances.capacity / Math.pow(scale_meter_px, 3)}</td>
            <td>${((vTotal * 100) / (Container.instances.capacity / Math.pow(scale_meter_px, 3))).toFixed(2)} %</td>
        </tr>
    `)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// take screenshot of the result
async function takeScreenShots() {
    $(".threeD-container-loader").toggleClass("threeD-container-loader--show threeD-container-loader--hide")

    let images = [];

    let newScene = new THREE.Scene();
    // newScene.background = new THREE.Color(0x00000);
    renderer.setClearColor(0xffffff, 0);
    // scene.traverse( function(obj){
    //     if (obj.name == "All_Packs" || obj.name == "hemisphereLight" || obj.name == "directionalLight" || obj.name == "base")
    //         newScene.add(obj)
    // })

    let packsToScreen = scene.getObjectByName("All_Packs").clone()
    let containerToScreen = scene.getObjectByName("base").clone()
    let directionalLightToScreen = scene.getObjectByName("directionalLight").clone()
    let hemisphereLight = scene.getObjectByName("hemisphereLight").clone()

    newScene.add(packsToScreen);
    newScene.add(containerToScreen)
    newScene.add(directionalLightToScreen)
    newScene.add(hemisphereLight)

    // renderer.render(newScene, newCam)

    let pos = [
        { x: 0, y: 500, z: 1100 },
        { x: 0, y: 1165, z: 320 },
        { x: 0, y: 500, z: -1000 }
    ]

    // console.log(camera)

    newScene.traverse(function (obj) {
        console.log(obj)
        if (obj.name == "Pack" || obj.name == "Line" || obj.name == "base")
            obj.geometry.translate(-1000, 0, 0);
    });

    // boucle on the camera positions
    // store the base64 code of the images inside an array
    for (let i = 0; i < pos.length; i++) {
        let newPos = pos[i];

        camera.position.set(newPos.x, newPos.y, newPos.z)
        await sleep(1);

        renderer.render(newScene, camera)
        images.push(renderer.domElement.toDataURL())
    }
    // var w = window.open('', '');
    // w.document.title = "Screenshot";
    // var img = new Image();
    // img.src = renderer.domElement.toDataURL()
    // w.document.body.appendChild(img);

    //reset the scene to its original form

    camera.position.set(2000, 1000, 1200)
    // scene.add(packsToScreen);
    // scene.add(containerToScreen)
    // scene.add(directionalLightToScreen)
    // scene.add(hemisphereLight)

    scene.traverse(function (obj) {
        if (obj.name == "Pack" || obj.name == "Line" || obj.name == "base")
            obj.geometry.translate(1000, 0, 0);
    })
    // "front-view : 0, 255, 1100"
    // "top-view : 0, 1165, 320"
    // "back-view : 0, 1165, 320"
    renderer.render(scene, camera);


    $(".threeD-container-loader").toggleClass("threeD-container-loader--show threeD-container-loader--hide")
    return images;
}

// loaded infinite number of boxes without making the scene lags
// need to fix the scene reader ????
function loadPacksInstanced(openPoints, packagesLoaded) {
    let meshesCount = [];

    let loadedPacks = packagesLoaded.reduce((groupedPack, pack) => {

        let id = pack.parent_id.toString()+'.';
        console.log(id)
        if (groupedPack[id] == null) groupedPack[id] = []
        groupedPack[id].push(pack);

        return groupedPack;
    }, {});

    console.log(packagesLoaded, loadedPacks)
    let allPacks = new THREE.Group();
    allPacks.name = "All_Packs";

    for (const pack in loadedPacks) {
        const matrix = new THREE.Matrix4();

        let packLoadedLength = loadedPacks[pack].length;

        let packSpecs = {
            parent_id: loadedPacks[pack][0].parent_id,
            w: loadedPacks[pack][0].w,
            h: loadedPacks[pack][0].h,
            l: loadedPacks[pack][0].l,
            color: loadedPacks[pack][0].color
        }

        let boxGeometry = new THREE.BoxGeometry(packSpecs.w, packSpecs.h, packSpecs.l);
        boxGeometry.translate(packSpecs.w / 2, packSpecs.h / 2, packSpecs.l / 2)

        let boxMateriel = new THREE.MeshLambertMaterial({ color: packSpecs.color * 0xFF0FFF, side: THREE.DoubleSide })
        const mesh = new THREE.InstancedMesh(boxGeometry, boxMateriel, packLoadedLength);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = "Pack"
        mesh.userData.id = packSpecs.parent_id;
        mesh.userData.clickable = false;
        mesh.userData.actif = false;
        mesh.userData.name = "Pack";
        mesh.userData.count = packLoadedLength

        //creating the edges
        var boxEdges = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(packSpecs.w, packSpecs.h, packSpecs.l));
        boxEdges.translate(packSpecs.w / 2, packSpecs.h / 2, packSpecs.l / 2)

        var instGeom = new THREE.InstancedBufferGeometry().copy(boxEdges);
        var instOffset = [];

        for (let i = 0; i < packLoadedLength; i++) {
            let position = {
                x: loadedPacks[pack][i].x,
                y: loadedPacks[pack][i].y,
                z: loadedPacks[pack][i].z
            }

            instOffset.push(position.x, position.y, position.z);
            PositionMatrix(matrix, position);
            mesh.setMatrixAt(i, matrix);
        }

        instGeom.setAttribute("offset", new THREE.InstancedBufferAttribute(new Float32Array(instOffset), 3));
        instGeom.instanceCount = packLoadedLength;

        var instMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            onBeforeCompile: shader => {
                shader.vertexShader = `
                attribute vec3 offset;
                ${shader.vertexShader}
                `.replace(
                    `#include <begin_vertex>`,
                    `
                        #include <begin_vertex>
                        transformed += offset;
                    `
                );
            }
        });

        boxInstances.push(mesh, instGeom)
        meshesCount.push(mesh.count)

        allPacks.add(mesh);

        var instLines = new THREE.LineSegments(instGeom, instMat);
        instLines.name = "Line"
        instLines.userData.id = packSpecs.parent_id;
        instLines.userData.name = "Line";
        allPacks.add(instLines);
    }

    scene.add(allPacks)
    breakPoints = generateBreakPoints(meshesCount)

    // let pointGroup = new THREE.Group();
    // pointGroup.name = "sphere";

    // openPoints.forEach(p => {
    //     const geometry = new THREE.SphereGeometry(3, 32, 16);
    //     const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    //     const sphere = new THREE.Mesh(geometry, material);
    //     sphere.position.set(p.x, p.y, p.z)
    //     pointGroup.add(sphere);

    // })

    // scene.add(pointGroup)
    // console.log(boxInstances)
}

// this function will calcul the break points for each pass from a pack to another pack
// it will be used in range bar to show hide packages
function generateBreakPoints(meshesCount) {
    const total = meshesCount.reduce((partialSum, a) => partialSum + a, 0);

    let breakPoints = [];
    for (let i = meshesCount.length - 1; i > 0; i--) {

        if (breakPoints[breakPoints.length - 1] != null)
            breakPoints.push(breakPoints[breakPoints.length - 1] - meshesCount[i])

        else
            breakPoints.push(total - meshesCount[i])
    }

    return breakPoints;
}

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
    $("#files").empty();

    //create the csv file
    csvResult(packagesLoaded)
    jsonResult(packagesLoaded)
    let loaded = packagesLoaded.reduce((groupedPack, pack) => {
        let id = pack.parent_id;
        let quantity = packagesToLoad.filter(pack => pack.id == id)[0].q;

        if (groupedPack[id] == null) groupedPack[id] = {
            id: pack.parent_id,
            label: pack.label,
            loaded: 0,
            unloaded: 0,
        };
        groupedPack[id].loaded = groupedPack[id].loaded + 1;
        groupedPack[id].unloaded = quantity - groupedPack[id].loaded;

        return groupedPack;
    }, {});

    //get the unloaded packs
    let difference = getDifference(packagesToLoad, packagesLoaded);

    let unloaded = difference.reduce((groupedPack, pack) => {
        if (groupedPack[pack.id] == null) groupedPack[pack.id] = {
            id: pack.id,
            label: pack.label,
            loaded: 0,
            unloaded: pack.q
        };
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

    fillTableWithPacksDetails()
}

//export the result as a json
function jsonResult(packagesLoaded) {
    let json = {};
    json["packs"] = []

    packagesLoaded.map(pack => {
        json["packs"].push({
            label: pack.label,
            w: pack.w,
            h: pack.h,
            l: pack.l,
            p: pack.priority,
            x: pack.x,
            y: pack.y,
            z: pack.z,
            rotation: pack.validRotation,
        })
    })

    var encodedUri = encodeURI("data:text/json;charset=utf-8," + JSON.stringify(json));

    // let fileName = "result_" + new Date().getTime() + ".json";
    $("#files").append(`
        <div class="export-result">
            <i class="fa-solid fa-file"></i>
            <a class='download-result' 
                href="${encodedUri}"
                download="packer_result.json"><b>packer_result.json</b> 
            </a>
        </div>
        `)

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
    // let fileName = "result_" + new Date().getTime() + ".csv";
    $("#files").append(`
    <div class="export-result">
        <i class="fa-solid fa-file-csv"></i>
        <a class='download-result' 
            href="${encodedUri}"
            download="packer_result.csv"><b>packer_result.csv</b> 
        </a>
    </div>
    `)

    $("#files").append(`
    <div class="export-result">
        <i class="fa-solid fa-file-pdf"></i>
        <div class='download-result' id="exportPdf"><b>packer_result.pdf</b></div>
    </div>
    `)
}

export {
    loadPacks, loadResult, loadPacksInstanced, generatePDF, boxInstances, breakPoints
}