import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { TransformControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/TransformControls.js';
import { camera, renderer, controls } from '../../main.js';
import { scene } from '../configurations.js';
import DragItem from "./dragItems";
import DragSurface from "./dragSurface";

class Dragger {

    static loadedPack = [];
    static openPoints = [{ x: 0, y: 0, z: 0 }];
    static specificOpenPoints = [];

    static currentPos = null;
    static currentRotation = { face: "base", yAxis: 0 }
    static item = {}
    static lastKeyPressed;

    constructor() {
        this.transformControl;
    }

    start(obj, parent_id) {
        this.transformControl = new TransformControls(camera, renderer.domElement);
        this.transformControl.setSpace('local');
        this.transformControl.setRotationSnap(Math.PI / 2);
        scene.add(this.transformControl);

        // add event to the elements
        // when click on the ui helper to make the mouvemenet of the box
        // toggle the state of the controls
        this.transformControl.addEventListener('dragging-changed', function (event) {
            controls.enabled = !event.value;
        });

        // create new box i
        let dragItem = new DragItem(obj, parent_id);
        Dragger.item = dragItem.getItem;
        let box = dragItem.createDragItem(this.transformControl);

        if (box != false) {
            this.dragging(box);
            Dragger.specificOpenPoints = [];
            Dragger.currentPos = Dragger.item.stat.position;
            Dragger.filterOpenPointByPackage()
        }
    }

    // when dragging the item
    // check if the dragged number of items is equal to the quantity 
    // entered by the user
    dragging(box) {

        let transformControl = this.transformControl;

        //reset the box to the initial state inserted with it in the container
        function reset() {
            if (transformControl != null) {
                let initialDim = Dragger.item.stat.dimensions;
                let initPos = Dragger.item.stat.position;

                let new_box_geometry = new THREE.BoxGeometry(initialDim.w, initialDim.h, initialDim.l);
                let new_edge_geometry = new THREE.EdgesGeometry(new_box_geometry);

                new_box_geometry.translate(initialDim.w / 2, initialDim.h / 2, initialDim.l / 2);
                new_edge_geometry.translate(initialDim.w / 2, initialDim.h / 2, initialDim.l / 2);

                transformControl.object.children[0].geometry = new_box_geometry;
                transformControl.object.children[1].geometry = new_edge_geometry;

                let obj = transformControl.object;
                obj.position.set(initPos.x, initPos.y, initPos.z);
            }
        }

        function createDraggingPoint() {
            if (transformControl != null) {
                let obj = transformControl.object.children[0];
                let dimension = obj.geometry.parameters;
                let pointOwner = obj.userData.id;

                Dragger.loadedPack.push({
                    id: box.userData.id,
                    parent_id: box.userData.parent_id,
                    w: dimension.width,
                    h: dimension.height,
                    l: dimension.depth,
                    x: Dragger.currentPos.x,
                    y: Dragger.currentPos.y,
                    z: Dragger.currentPos.z,
                    box: box,
                });

                Dragger.openPoints.push(
                    {
                        pointOwner: pointOwner,
                        x: Dragger.currentPos.x,
                        y: Dragger.currentPos.y,
                        z: Dragger.currentPos.z + dimension.depth,
                        type: "R"
                    },
                    {
                        pointOwner: pointOwner,
                        x: Dragger.currentPos.x,
                        y: Dragger.currentPos.y + dimension.height,
                        z: Dragger.currentPos.z,
                        type: "T"
                    },
                    {
                        pointOwner: pointOwner,
                        x: Dragger.currentPos.x + dimension.width,
                        y: Dragger.currentPos.y,
                        z: Dragger.currentPos.z,
                        type: "F"
                    }
                );

                let indexObjToRemove = Dragger.openPoints.findIndex(p =>
                    p.x == Dragger.currentPos.x
                    && p.y == Dragger.currentPos.y
                    && p.z == Dragger.currentPos.z);

                // console.log(indexObjToRemove)
                refreshOpenPoints(indexObjToRemove);

                //sort the point created
                Dragger.openPoints.sort((a, b) => {
                    return ((a.x - b.x || a.z - b.z) || a.y - b.y);
                });

                scene.remove(scene.getObjectByName("sphere"));

                let pointGroup = new THREE.Group();
                pointGroup.name = "sphere";

                Dragger.openPoints.forEach(p => {
                    const geometry = new THREE.SphereGeometry(3, 32, 16);
                    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
                    const sphere = new THREE.Mesh(geometry, material);
                    sphere.position.set(p.x, p.y, p.z)
                    pointGroup.add(sphere);
                })

                scene.add(pointGroup)

                let pointGroup1 = new THREE.Group();
                pointGroup1.name = "sphere";
                Dragger.specificOpenPoints.forEach(p => {
                    const geometry = new THREE.SphereGeometry(3, 32, 16);
                    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
                    const sphere = new THREE.Mesh(geometry, material);
                    sphere.position.set(p.x, p.y, p.z)
                    pointGroup1.add(sphere);
                });

                scene.add(pointGroup1)

                transformControl.detach();
                transformControl = null;

                // change the stat of the box 
                changePackStat(box.userData.parent_id);
            }
        }

        // if the quantity of the pack is 0
        // minimize the opacity and make it not clickable
        function changePackStat(parent_id) {
            let items = Dragger.loadedPack.filter(item => {
                return item.box.userData.parent_id == parent_id
            });

            if (Dragger.item.q - items.length == 0) {
                console.log(items)
                let packShower = scene.getObjectByName("pack_shower");
                let found = packShower.children.find(p => {
                    return p.userData.id == items[0].box.userData.parent_id;
                })

                found.material.transparent = true;
                found.material.opacity = 0.6;
                found.userData.dragDrop = false;
            }
        }

        function updateRotationFaces() {
            let pos = Dragger.currentPos;
            let possibleR = Dragger.specificOpenPoints.find(p => {
                return p.x == pos.x && p.y == pos.y && p.z == pos.z
            });
            console.log(possibleR)

            let index = possibleR.rotations.findIndex(r => {
                return r.type[0] == Dragger.currentRotation.face
                    && r.type[1] == Dragger.currentRotation.yAxis
            });
            console.log(index)

            if (index != -1) {
                let newDim = possibleR.rotations[index];
                let new_box_geometry = new THREE.BoxGeometry(newDim.w, newDim.h, newDim.l);
                let new_edge_geometry = new THREE.EdgesGeometry(new_box_geometry);

                new_box_geometry.translate(newDim.w / 2, newDim.h / 2, newDim.l / 2);
                new_edge_geometry.translate(newDim.w / 2, newDim.h / 2, newDim.l / 2);

                if (transformControl != null) {
                    transformControl.object.children[0].geometry = new_box_geometry;
                    transformControl.object.children[1].geometry = new_edge_geometry;

                    Dragger.currentRotation = {
                        face: possibleR.rotations[++index % possibleR.rotations.length].type[0],
                        yAxis: possibleR.rotations[index % possibleR.rotations.length].type[1]
                    }
                }
            }
        }

        function adaptBoxToTheSpecificationOfOpenPoint(openPoint) {
            let possibleR = Dragger.specificOpenPoints.find(p => {
                return p.x == openPoint.x && p.y == openPoint.y && p.z == openPoint.z
            });

            let newDim = possibleR.rotations[0];
            let new_box_geometry = new THREE.BoxGeometry(newDim.w, newDim.h, newDim.l);
            let new_edge_geometry = new THREE.EdgesGeometry(new_box_geometry);

            new_box_geometry.translate(newDim.w / 2, newDim.h / 2, newDim.l / 2);
            new_edge_geometry.translate(newDim.w / 2, newDim.h / 2, newDim.l / 2);

            if (transformControl != null) {
                transformControl.object.children[0].geometry = new_box_geometry;
                transformControl.object.children[1].geometry = new_edge_geometry;

                Dragger.currentRotation = {
                    face: possibleR.rotations[0].type[0],
                    yAxis: possibleR.rotations[0].type[1]
                }
            }

        }

        // function updateRotationYaxis(rotationDeg) {
        //     // 0 means rotate by 0 deg
        //     // Math.PI/2 means rotate by 90 deg
        //     function newDimensions(userRotation, yAxis) {
        //         let newDimensions = {};
        //         if (userRotation == "base") {
        //             if (yAxis == 0)
        //                 newDimensions = { w: initialDim.w, h: initialDim.h, l: initialDim.l };
        //             if (yAxis == Math.PI / 2)
        //                 newDimensions = { w: initialDim.l, h: initialDim.h, l: initialDim.w };
        //         }
        //         if (userRotation == "right-side") {
        //             if (yAxis == 0)
        //                 newDimensions = { w: initialDim.h, h: initialDim.l, l: initialDim.w };
        //             if (yAxis == Math.PI / 2)
        //                 newDimensions = { w: initialDim.w, h: initialDim.l, l: initialDim.h };

        //         }
        //         if (userRotation == "front-side") {
        //             if (yAxis == 0)
        //                 newDimensions = { w: initialDim.h, h: initialDim.w, l: initialDim.l };
        //             if (yAxis == Math.PI / 2)
        //                 newDimensions = { w: initialDim.l, h: initialDim.w, l: initialDim.h };
        //         }

        //         return newDimensions;
        //     }

        //     let initialDim = Dragger.item.stat.dimensions;
        //     Dragger.currentRotation.yAxis = rotationDeg

        //     console.log(Dragger.currentRotation)
        //     let newDim = newDimensions(Dragger.currentRotation.face, Dragger.currentRotation.yAxis)
        //     let new_box_geometry = new THREE.BoxGeometry(newDim.w, newDim.h, newDim.l);
        //     let new_edge_geometry = new THREE.EdgesGeometry(new_box_geometry);

        //     new_box_geometry.translate(newDim.w / 2, newDim.h / 2, newDim.l / 2);
        //     new_edge_geometry.translate(newDim.w / 2, newDim.h / 2, newDim.l / 2);

        //     transformControl.object.children[0].geometry = new_box_geometry;
        //     transformControl.object.children[1].geometry = new_edge_geometry;
        // }

        // apply the magnetic effect
        // find the close point
        // if there is collision or the user mouseup, put the box directly on the point

        function findClosePoint(point) {
            const dist = (a, b) => Math.sqrt(
                (b.x - a.x) ** 2 +
                (b.y - a.y) ** 2 +
                (b.z - a.z) ** 2);

            const closest = (target, points, eps = 0.00001) => {
                const distances = points.map(e => dist(target, e));
                const closest = Math.min(...distances);
                return points.find((e, i) => distances[i] - closest < eps);
            };

            return Dragger.openPoints.length == 1 ? closest(point, Dragger.openPoints) : closest(point, Dragger.specificOpenPoints)
        }

        //remove the point where the box is added then sort the other points into the right order
        function refreshOpenPoints(idItemToRemove) {
            //removes the duplicates objects or points exist in a certain array
            function removeDuplicatesObjectFromArray(array) {
                return array.filter((elem, index, self) =>
                    self.findIndex(
                        (t) => {
                            return (t.x === elem.x && t.y === elem.y && t.z === elem.z)
                        }) === index
                )
            }

            //remove non eligible points
            //fixes two axes and searching for the smallest one on each axe
            //storing the new elligible points
            function removeNonWorkingOpenPoints() {

                let pack = Dragger.loadedPack[Dragger.loadedPack.length - 1];

                //remove the point on the edges
                for (let i = Dragger.openPoints.length - 1; i >= 0; i--) {
                    let point = Dragger.openPoints[i];

                    if (DragSurface.width == point.x || DragSurface.height == point.y || DragSurface.lenght == point.z)
                        Dragger.openPoints.splice(i, 1)
                }


                // console.log(pack)
                //remove the points dont have acces
                //that mean the point that i pass on them while positioning the boxes
                let idPointToRemove = [];
                Dragger.openPoints.map((p, index) => {
                    if (p.x + 1 >= pack.x && p.x + 1 <= pack.x + pack.w
                        && p.z + 1 >= pack.z && p.z + 1 <= pack.z + pack.l
                        // && p.y > 0 
                        && p.y == pack.y
                        && p.pointOwner != pack.id
                    ) {
                        idPointToRemove.push(index);
                    }
                });

                idPointToRemove.sort((a, b) => {
                    return b - a;
                });

                for (let i = 0; i < idPointToRemove.length; i++) {
                    console.log(Dragger.openPoints[idPointToRemove[i]])
                    Dragger.openPoints.splice(idPointToRemove[i], 1);
                }

                //remove the points that are on the same line
                for (let i = 0; i < Dragger.openPoints.length; i++) {
                    let point1 = Dragger.openPoints[i];
                    let pack1 = point1.pointOwner.split("-")[0];

                    for (let j = i + 1; j < Dragger.openPoints.length; j++) {
                        let point2 = Dragger.openPoints[j];
                        let pack2 = point2.pointOwner.split("-")[0];

                        //delete the z point on the same axe
                        //check if the points cover the same space
                        //remove only the point that cover the same space
                        //keep the points that have a different surface to cover
                        if (point1.x == point2.x && point1.y == point2.y && point1.type != "S" && pack1 == pack2) {
                            // console.log(point1.y)
                            let check = Dragger.loadedPack.filter(pack => {
                                if (point1.y == 0) {
                                    return pack.y == point1.y
                                        && pack.x > point1.x
                                        && pack.z <= point1.z
                                        && pack.z + pack.l >= point1.z;
                                } else {
                                    // console.log(pack, point1)
                                    return pack.y + pack.h == point1.y
                                        && pack.x <= point1.x + 1
                                        && pack.x + pack.w >= point1.x + 1
                                        && pack.z <= point1.z + 1
                                        && pack.z + pack.l >= point1.z + 1;
                                }
                            });

                            let check1 = Dragger.loadedPack.filter(pack => {
                                if (point2.y == 0) {
                                    return pack.y == point2.y
                                        && pack.x > point2.x
                                        && pack.z <= point2.z
                                        && pack.z + pack.l >= point2.z;
                                } else {
                                    // console.log(pack, point2)
                                    return pack.y + pack.h == point2.y
                                        && pack.x <= point2.x + 1
                                        && pack.x + pack.w >= point2.x + 1
                                        && pack.z <= point2.z + 1
                                        && pack.z + pack.l >= point2.z + 1;
                                }
                            });

                            // console.log(pack1, check, check1);

                            if (check.length != 0 && check1.length != 0) {
                                // console.log(Math.abs(check[0].x - point1.x), Math.abs(check1[0].x - point2.x), point1.x, point2.x);
                                if (Math.abs(check[0].x - point1.x) == Math.abs(check1[0].x - point2.x)) {
                                    // console.log(this.openPoints[j])
                                    Dragger.openPoints.splice(j, 1);
                                }
                            }
                            if (check.length == 0 && check1.length == 0) {
                                // console.log(this.openPoints[j])
                                Dragger.openPoints.splice(j, 1);
                            }
                        }

                        //delete the y point on the same axe
                        if (point1.x == point2.x && point1.z == point2.z && pack1 == pack2) {
                            // console.log(this.openPoints[j])
                            Dragger.openPoints.splice(j, 1);
                        }

                        //delete the z point on the same axe
                        if (point1.y == point2.y && point1.z == point2.z && !point1.ignored && pack1 == pack2) {
                            if (point2.type != "S") {
                                // console.log(this.openPoints[j])
                                Dragger.openPoints.splice(j, 1);
                            }
                        }
                    }
                }
            }

            //remove the filled points
            if (idItemToRemove != -1)
                Dragger.openPoints.splice(idItemToRemove, 1);

            //remove duplicates points
            Dragger.openPoints = removeDuplicatesObjectFromArray(Dragger.openPoints);

            //sort the points by the closets to the origins
            Dragger.openPoints.sort((a, b) => {
                return ((a.x - b.x || a.z - b.z) || a.y - b.y);
            });

            //remove non eligible points
            removeNonWorkingOpenPoints();
        }

        // transformControl.addEventListener('objectChange', (event) => {
        //     // console.log(event.target.children[0].pointStart, event.target.children[0].pointEnd)
        //     // console.log(transformControl, transformControl.axis, box);
        //     // console.log(e,vent.target.children[1].position, event.target.children[1].rotation)
        //     var quaternion = new THREE.Quaternion()
        //     var vec3 = new THREE.Vector3();
        //     let rotation = new THREE.Euler();
        //     // rotation.setFromQuaternion(quaternion)
        //     // console.log(rotation.setFromQuaternion(transformControl.object.getWorldQuaternion(quaternion)), transformControl.object.getWorldPosition(vec3));
        //     transformControl.showX = true
        //     transformControl.showY = true
        //     transformControl.showZ = true

        //     transformControl.dragging = true;



        // });

        transformControl.addEventListener('mouseUp', function (event) {
            let obj = transformControl.object;
            let pos = event.target.children[1].position;
            let closePoint = findClosePoint(pos);

            obj.position.set(closePoint.x, closePoint.y, closePoint.z);
            adaptBoxToTheSpecificationOfOpenPoint(closePoint)
            Dragger.currentPos = closePoint;
        });

        document.addEventListener('keydown', function (event) {
            switch (event.key.toUpperCase()) {
                case "DELETE": // Delete
                    scene.remove(transformControl.object)
                    transformControl.detach();
                    transformControl = null;
                    break;

                case "SHIFT": // Shift
                    transformControl.setTranslationSnap(100);
                    transformControl.setRotationSnap(Math.PI / 2);
                    transformControl.setScaleSnap(0.25);
                    break;

                case "W": // W
                    transformControl.setMode('translate');
                    break;

                case "E": // E
                    transformControl.setMode('rotate');
                    break;

                case "R": // R
                    transformControl.setMode('scale');
                    break;

                case "+":
                case "=": // +, =, num+
                    transformControl.setSize(transformControl.size + 0.1);
                    break;

                case "-":
                case "_": // -, _, num-
                    transformControl.setSize(Math.max(transformControl.size - 0.1, 0.1));
                    break;

                case "X": // X
                    transformControl.showX = !transformControl.showX;
                    break;

                case "Y": // Y
                    transformControl.showY = !transformControl.showY;
                    break;

                case "Z": // Z
                    transformControl.showZ = !transformControl.showZ;
                    break;

                case " ": // Spacebar
                    transformControl.enabled = !transformControl.enabled;
                    break;

                case "ESCAPE": // Esc
                    reset();
                    break;

                case "ENTER": // Enter
                    createDraggingPoint()
                    break;

                case "F": // F
                    updateRotationFaces()
                    break;

                // case "ARROWRIGHT":
                //     if (Dragger.lastKeyPressed == "F") {
                //         console.log("rotate 0")
                //         updateRotationYaxis(0)
                //     }
                //     break;

                // case "ARROWLEFT":
                //     if (Dragger.lastKeyPressed == "F") {
                //         console.log("rotate PI/2")
                //         updateRotationYaxis(Math.PI / 2)
                //     }
                //     break;

                default:
                    console.log("this key don't support any action");
            }
        });

        // document.addEventListener('keyup', function (event) {
        //     if (event.key.toUpperCase() != "ARROWRIGHT" && event.key.toUpperCase() != "ARROWLEFT")
        //         Dragger.lastKeyPressed = event.key.toUpperCase();
        // });
    }

    //check if the pack fit into the box
    //check the possible rotations that the box stills in the container
    //each point have its specification: possible rotations
    static filterOpenPointByPackage() {

        //check the colllisions with the container and the box
        function checkCollision(box) {
            box.geometry.computeBoundingBox();
            box.updateMatrixWorld();

            let newBox = box.geometry.boundingBox.clone();
            newBox.applyMatrix4(box.matrixWorld);

            newBox.max.x = newBox.max.x - 1;
            newBox.max.y = newBox.max.y - 1;
            newBox.max.z = newBox.max.z - 1;

            newBox.min.x = newBox.min.x + 1;
            newBox.min.y = newBox.min.y + 1;
            newBox.min.z = newBox.min.z + 1;

            for (let i = 0; i < Dragger.loadedPack.length; i++) {
                let loadedBox = Dragger.loadedPack[i].box;

                loadedBox.geometry.computeBoundingBox();
                loadedBox.updateMatrixWorld();

                let newBox1 = loadedBox.geometry.boundingBox.clone();
                newBox1.applyMatrix4(loadedBox.matrixWorld);

                console.log(newBox, newBox1, newBox.intersectsBox(newBox1))

                // newBox1.max.x = newBox1.max.x - 1;
                // newBox1.max.y = newBox1.max.y - 1;
                // newBox1.max.z = newBox1.max.z - 1;

                // newBox1.min.x = newBox1.min.x + 1;
                // newBox1.min.y = newBox1.min.y + 1;
                // newBox1.min.z = newBox1.min.z + 1;

                // if (newBox.intersectsBox(newBox1)) {
                //     return newBox.intersectsBox(newBox1);
                // }
            }

            return false
        }

        let specificOpenPoints = [];
        let limits = DragSurface.dragSurface;
        let specificRotations;

        if (Dragger.openPoints.length == 1) {
            let possibleRotations = Dragger.item.packDetails.rotations;
            //empty the array to insert new elements in it.
            specificRotations = [];

            for (let j = 0; j < possibleRotations.length; j++) {
                let rotation = possibleRotations[j];
                if (
                    rotation.w <= limits.width
                    && rotation.h <= limits.height
                    && rotation.l <= limits.lenght
                    && !checkCollision(Dragger.item.object)
                ) {
                    specificRotations.push({
                        ...rotation,
                        type: [rotation.type[0], rotation.type[1] * (Math.PI / 180)]
                    });
                }
            }

            //insert the specification for that point in the array
            if (specificRotations.length > 0) {
                specificOpenPoints.push({
                    id: "c-0",
                    type: "O",
                    x: 0,
                    y: 0,
                    z: 0,
                    rotations: specificRotations
                });
            }
        }

        for (let i = 0; i < Dragger.openPoints.length; i++) {
            let p = Dragger.openPoints[i];
            let possibleRotations = Dragger.item.packDetails.rotations;

            //empty the array to insert new elements in it.
            specificRotations = [];

            for (let j = 0; j < possibleRotations.length; j++) {
                let rotation = possibleRotations[j];
                if (
                    rotation.w + p.x <= limits.width
                    && rotation.h + p.y <= limits.height
                    && rotation.l + p.z <= limits.lenght
                    && !checkCollision(Dragger.item.object)
                ) {
                    specificRotations.push({
                        ...rotation,
                        type: [rotation.type[0], rotation.type[1] * (Math.PI / 180)]
                    });
                }
            }

            //insert the specification for that point in the array
            if (specificRotations.length > 0) {
                specificOpenPoints.push({
                    id: p.pointOwner,
                    type: p.type,
                    x: p.x,
                    y: p.y,
                    z: p.z,
                    rotations: specificRotations
                });
            }
        }

        Dragger.specificOpenPoints = specificOpenPoints;
        console.log(Dragger.specificOpenPoints);
    }
}

export default Dragger;