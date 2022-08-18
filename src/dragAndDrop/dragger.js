import * as THREE from "../../threeJsLib/three.js.r122"
import { TransformControls } from '../../threeJsLib/transformControls';
import { camera, renderer, controls } from '../../sceneConfig.js';
import { scene } from '../configurations.js';
import DragDropLogger from './dragDropLogger.js';
import DragItem from "./dragItems";
import DragSurface from "./dragSurface";
import { changeOpacityUnvailableRotations, currentRotationUpdate, initializeClasses } from "./dragDropMenu"

class Dragger {
    // this variable for saving the steps done by the user
    // move forward and backward on the steps done
    static steps = [{
        stepNumber: 0,
        loadedPacks: [],
        openPoint: [{ x: 0, y: 0, z: 0 }]
    }];
    static currentStep = 0;
    
    static allLoadedPacks = [];
    static loadedPack = [];
    static openPoints = [{ x: 0, y: 0, z: 0 }];
    static specificOpenPoints = [];

    static currentPos = null;
    static currentRotation = { face: "base", yAxis: 0 }
    static item = {}
    static mouseOnAction = false;

    constructor() {
        this.transformControl;
    }

    start(obj, parent_id) {
        console.log(renderer, camera, controls)
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
        console.log(Dragger.item)
        if (Object.keys(Dragger.item).length == 0) {
            let dragItem = new DragItem(obj, parent_id);
            Dragger.item = dragItem.getItem;
            Dragger.filterOpenPointByPackage();
            let box = dragItem.createDragItem(this.transformControl);

            if (box != false) {
                Dragger.currentPos = Dragger.item.stat.position;
                this.dragging(box);
            }
            else {
                Dragger.item = {}
            }
        } else {
            console.log("Please confirm the position of the current dragged pack [press enter]")
        }

    }

    static getNbLoadedPacksById(id, quantity) {
        console.log(id, quantity)
        let items = Dragger.loadedPack.filter(item => {
            return item.box.userData.parent_id == id
        });

        if (Dragger.loadedPack.length == 0) return 0;
        return quantity - items.length >= 0 ? items.length : -1;
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

        //create a 2d space on top of boxes
        function create2dSpace(coords) {
            //find the boxes that will create our 2d space
            let packs = Dragger.loadedPack.filter(p => {
                let upperPoint = coords.y > 0 ? p.y + p.h : p.y;
                // console.log(upperPoint)
                // let upperPoint = p.y;
                return upperPoint == coords.y
            });

            // console.log(packs);

            //fill the space with the coordinates of each box
            let space = [];
            packs.forEach(p => {
                if (space[p.id] == null) space[p.id] = [];
                space[p.id].push(
                    {
                        x: p.x,
                        z: p.z
                    },
                    {
                        x: p.x + p.w,
                        z: p.z
                    },
                    {
                        x: p.x,
                        z: p.z + p.l
                    },
                    {
                        x: p.x + p.w,
                        z: p.z + p.l
                    }
                );
            });

            return [packs, space];
        }

        //checks if the points is contained in a certain space
        function isPointContainedInSpace(packSpace, point, restrected) {
            // console.log(point.x, point.z, packSpace[0], packSpace[3])
            return restrected ?
                point.x > packSpace[0].x && point.x <= packSpace[3].x && point.z > packSpace[0].z && point.z <= packSpace[3].z
                :
                point.x >= packSpace[0].x && point.x <= packSpace[3].x && point.z >= packSpace[0].z && point.z <= packSpace[3].z;
        }

        function saveStep() {
            let steps = JSON.parse(localStorage.getItem("steps"));
            if (steps != null) {
                steps.push({
                    stepNumber: ++Dragger.currentStep,
                    loadedPacks: Dragger.loadedPack,
                    openPoint: Dragger.openPoints
                })

                localStorage.setItem("steps", JSON.stringify(steps))
            }
        }

        function createDraggingPoint() {

            //create the open point
            function createOpenPoints(coords, pack) {

                let validOpenPoint = [
                    {
                        pointOwner: pack.id,
                        x: coords.x,
                        y: coords.y + pack.h,
                        z: coords.z,
                        type: "T",
                        ignored: false,
                    },
                ];

                let openPoints = [
                    {
                        pointOwner: pack.id,
                        x: coords.x,
                        y: coords.y,
                        z: coords.z + pack.l,
                        type: "R",
                        ignored: false,
                    },
                    {
                        pointOwner: pack.id,
                        x: coords.x + pack.w,
                        y: coords.y,
                        z: coords.z,
                        type: "F",
                        ignored: false,
                    }
                ];

                if (coords.x == 0 && coords.y == 0 && coords.z == 0)
                    return [...validOpenPoint, ...openPoints];

                let twoDimensionSpace = create2dSpace(coords);
                let packs = twoDimensionSpace[0];
                let space = twoDimensionSpace[1];

                if (packs.length != 0 && Object.keys(space).length != 0) {

                    for (let i = 0; i < openPoints.length; i++) {
                        let point = openPoints[i];

                        let check = 0;
                        for (let j = 0; j < packs.length; j++) {
                            let p = packs[j];
                            let packSpace = space[p.id];

                            let testPoint = {
                                x: point.x + 1,
                                z: point.z + 1
                            }

                            if (point.y == 0) {
                                if (!isPointContainedInSpace(packSpace, testPoint, false))
                                    check++;
                            }

                            else {
                                if (isPointContainedInSpace(packSpace, testPoint, false)) {
                                    let loadedPackInSpace = Dragger.loadedPack.filter(p => {
                                        // console.log(p.id, point);
                                        return p.x <= point.x + 1
                                            && p.x + p.w > point.x + 1
                                            && p.z <= point.z + 1
                                            && p.z + p.l > point.z + 1
                                            && p.y == coords.y
                                            && p.id != point.pointOwner
                                    });

                                    let dis;
                                    if (point.type == "R") dis = packSpace[3].z - point.z;
                                    if (point.type == "F") dis = packSpace[3].x - point.x;

                                    // console.log(point.type, pack, pack.id, dis);

                                    // console.log(loadedPackInSpace);
                                    if (loadedPackInSpace.length == 0) {
                                        if (point.type == "R")
                                            validOpenPoint.push(openPoints[0]);
                                        if (point.type == "F")
                                            validOpenPoint.push(openPoints[1]);
                                    }
                                }
                            }
                        }

                        if (check == packs.length) {
                            if (point.type == "R") {
                                validOpenPoint.push(openPoints[0]);
                            }

                            if (point.type == "F") {
                                validOpenPoint.push(openPoints[1]);
                            }
                        }
                    }
                }

                // console.log(validOpenPoint)
                return validOpenPoint;
            }

            if (transformControl != null) {
                let obj = transformControl.object.children[0];
                let dimension = obj.geometry.parameters;

                console.log(transformControl.object)
                // add the new pack to the loadedpack array
                Dragger.loadedPack.push({
                    id: box.userData.id,
                    parent_id: box.userData.parent_id,
                    w: dimension.width,
                    h: dimension.height,
                    l: dimension.depth,
                    x: Dragger.currentPos.x,
                    y: Dragger.currentPos.y,
                    z: Dragger.currentPos.z,
                    color:Dragger.item.packDetails.color,
                    box: box,
                    fullBox: transformControl.object
                });

                // save all the dragged boxes into the scene
                Dragger.allLoadedPacks.push({
                    id: box.userData.id,
                    parent_id: box.userData.parent_id,
                    w: dimension.width,
                    h: dimension.height,
                    l: dimension.depth,
                    x: Dragger.currentPos.x,
                    y: Dragger.currentPos.y,
                    z: Dragger.currentPos.z,
                    color:Dragger.item.packDetails.color,
                    box: box,
                    fullBox: transformControl.object
                });

                let loaded = Dragger.getNbLoadedPacksById(Dragger.item.parent_id, Dragger.item.q)
                new DragDropLogger(Dragger.item.packDetails, loaded, Dragger.item.q - loaded == 0 ? "All loaded" : "On loading").dispatchMessage()

                // create the new open points
                Dragger.openPoints.push(...createOpenPoints(Dragger.currentPos, Dragger.loadedPack[Dragger.loadedPack.length - 1]));

                // Dragger.openPoints.push(
                //     {
                //         pointOwner: pointOwner,
                //         x: Dragger.currentPos.x,
                //         y: Dragger.currentPos.y,
                //         z: Dragger.currentPos.z + dimension.depth,
                //         type: "R"
                //     },
                //     {
                //         pointOwner: pointOwner,
                //         x: Dragger.currentPos.x,
                //         y: Dragger.currentPos.y + dimension.height,
                //         z: Dragger.currentPos.z,
                //         type: "T"
                //     },
                //     {
                //         pointOwner: pointOwner,
                //         x: Dragger.currentPos.x + dimension.width,
                //         y: Dragger.currentPos.y,
                //         z: Dragger.currentPos.z,
                //         type: "F"
                //     }
                // );

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

                let pointGroup = new THREE.Group();
                pointGroup.name = "sphere";

                Dragger.openPoints.forEach(p => {
                    const geometry = new THREE.SphereGeometry(3, 32, 16);
                    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
                    const sphere = new THREE.Mesh(geometry, material);
                    sphere.position.set(p.x, p.y, p.z)
                    pointGroup.add(sphere);
                })

                // save the current state
                saveStep();
                // remove the old point
                // add the new ones
                scene.remove(scene.getObjectByName("sphere"));
                scene.add(pointGroup)

                transformControl.detach();
                transformControl = null;

                // change the stat of the box 
                changePackStat(box.userData.parent_id);
                initializeClasses("d-less-opacity", true)
                initializeClasses("d-current-rotate", false)
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
                // found.userData.dragDrop = false;
            }

            Dragger.item = {}
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


            if (index != -1) {
                // console.log(index, ++index, possibleR.rotations.length, ++index % possibleR.rotations.length)
                let newDim = possibleR.rotations[++index % possibleR.rotations.length];
                let new_box_geometry = new THREE.BoxGeometry(newDim.w, newDim.h, newDim.l);
                let new_edge_geometry = new THREE.EdgesGeometry(new_box_geometry);

                new_box_geometry.translate(newDim.w / 2, newDim.h / 2, newDim.l / 2);
                new_edge_geometry.translate(newDim.w / 2, newDim.h / 2, newDim.l / 2);

                if (transformControl != null) {
                    transformControl.object.children[0].geometry = new_box_geometry;
                    transformControl.object.children[1].geometry = new_edge_geometry;

                    Dragger.currentRotation = {
                        face: possibleR.rotations[index % possibleR.rotations.length].type[0],
                        yAxis: possibleR.rotations[index % possibleR.rotations.length].type[1]
                    }

                    currentRotationUpdate(Dragger.currentRotation.face, Dragger.currentRotation.yAxis);
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

            return possibleR.rotations;
        }

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

        // remove the point where the box is added 
        // then sort the other points into the right order
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

        transformControl.addEventListener('mouseUp', function (event) {
            let obj = transformControl.object;
            let pos = event.target.children[1].position;
            let closePoint = findClosePoint(pos);
            console.log(closePoint)
            obj.position.set(closePoint.x, closePoint.y, closePoint.z);
            let possibleR = adaptBoxToTheSpecificationOfOpenPoint(closePoint)
            Dragger.currentPos = closePoint;
            Dragger.mouseOnAction = false;

            changeOpacityUnvailableRotations(possibleR)
        });

        transformControl.addEventListener('mouseDown', function (event) {
            Dragger.mouseOnAction = true;
        });

        document.addEventListener('keydown', function (event) {
            switch (event.key.toUpperCase()) {
                case "DELETE": // Delete
                    if (!Dragger.mouseOnAction && transformControl != null) {
                        Dragger.item = {}
                        scene.remove(transformControl.object)
                        transformControl.detach();
                        transformControl = null;
                        initializeClasses("d-less-opacity", true)
                        initializeClasses("d-current-rotate", false)
                    }
                    break;

                case "SHIFT": // Shift
                    transformControl.setTranslationSnap(100);
                    transformControl.setRotationSnap(Math.PI / 2);
                    transformControl.setScaleSnap(0.25);
                    break;

                case "W": // W
                    transformControl.setMode('translate');
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
                    if (!Dragger.mouseOnAction)
                        reset();
                    break;

                case "ENTER": // Enter
                    if (!Dragger.mouseOnAction)
                        createDraggingPoint()
                    break;

                case "R": // R
                    if (!Dragger.mouseOnAction)
                        updateRotationFaces()
                    break;

                default:
                    console.log("this key don't support any action");
            }
        });
    }

    // add the functionalitie to download the result
    // if pdf is working i will do it ??
    static confirmDragDropSolution(){}

    //check if the pack fit into the box
    //check the possible rotations that the box stills in the container
    //each point have its specification: possible rotations
    static filterOpenPointByPackage() {

        //create a 2d space on top of boxes
        function create2dSpace(coords) {
            //find the boxes that will create our 2d space
            let packs = Dragger.loadedPack.filter(p => {
                let upperPoint = coords.y > 0 ? p.y + p.h : p.y;
                // console.log(upperPoint)
                // let upperPoint = p.y;
                return upperPoint == coords.y
            });

            // console.log(packs);

            //fill the space with the coordinates of each box
            let space = [];
            packs.forEach(p => {
                if (space[p.id] == null) space[p.id] = [];
                space[p.id].push(
                    {
                        x: p.x,
                        z: p.z
                    },
                    {
                        x: p.x + p.w,
                        z: p.z
                    },
                    {
                        x: p.x,
                        z: p.z + p.l
                    },
                    {
                        x: p.x + p.w,
                        z: p.z + p.l
                    }
                );
            });

            return [packs, space];
        }

        //checks if the points is contained in a certain space
        function isPointContainedInSpace(packSpace, point, restrected) {
            // console.log(point.x, point.z, packSpace[0], packSpace[3])
            return restrected ?
                point.x > packSpace[0].x && point.x <= packSpace[3].x && point.z > packSpace[0].z && point.z <= packSpace[3].z
                :
                point.x >= packSpace[0].x && point.x <= packSpace[3].x && point.z >= packSpace[0].z && point.z <= packSpace[3].z;
        }

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
            console.log(Dragger.loadedPack)
            for (let i = 0; i < Dragger.loadedPack.length; i++) {
                let loadedBox = Dragger.loadedPack[i].box;

                loadedBox.geometry.computeBoundingBox();
                loadedBox.updateMatrixWorld();

                let newBox1 = loadedBox.geometry.boundingBox.clone();
                newBox1.applyMatrix4(loadedBox.matrixWorld);

                newBox1.max.x = newBox1.max.x - 1;
                newBox1.max.y = newBox1.max.y - 1;
                newBox1.max.z = newBox1.max.z - 1;

                newBox1.min.x = newBox1.min.x + 1;
                newBox1.min.y = newBox1.min.y + 1;
                newBox1.min.z = newBox1.min.z + 1;

                if (newBox.intersectsBox(newBox1)) {
                    return newBox.intersectsBox(newBox1);
                }
            }

            return false
        }

        //create a temperory box to detect collisions
        function createTemperoryBox(pack, coords) {
            let normalMateriel = new THREE.MeshLambertMaterial({ color: 0xFF0FFF, side: THREE.DoubleSide })

            let boxGeometry = new THREE.BoxGeometry(pack.w, pack.h, pack.l);
            let box = new THREE.Mesh(boxGeometry, normalMateriel);
            let vec3 = new THREE.Vector3(coords.x, coords.y, coords.z);

            box.position.copy(vec3);
            boxGeometry.translate(pack.w / 2, pack.h / 2, pack.l / 2);

            return box;
        }

        // Each box have 4 point in his base face
        // I check if the 4 points are contained inside that surface
        // Return true or false
        function canFitAboveTheBoxNewVersion(pack, coords) {

            // create the four point of our pack
            let packPoints = [
                // 1
                {
                    x: coords.x,
                    z: coords.z,
                },
                {
                    x: (3 * coords.x + (coords.x + pack.w)) / 4,
                    z: coords.z,
                },
                {
                    x: (coords.x + (coords.x + pack.w)) / 2,
                    z: coords.z,
                },
                {
                    x: (coords.x + 3 * (coords.x + pack.w)) / 4,
                    z: coords.z,
                },
                {
                    x: coords.x + pack.w,
                    z: coords.z,
                },

                // 2
                {
                    x: coords.x,
                    z: (coords.z + 3 * (coords.z + pack.l)) / 4,
                },
                {
                    x: coords.x,
                    z: (coords.z + (coords.z + pack.l)) / 2,
                },
                {
                    x: coords.x,
                    z: (3 * coords.z + (coords.z + pack.l)) / 4,
                },
                {
                    x: coords.x,
                    z: coords.z + pack.l,
                },


                // 3
                {
                    x: (coords.x + 3 * (coords.x + pack.w)) / 4,
                    z: coords.z + pack.l,
                },
                {
                    x: (coords.x + (coords.x + pack.w)) / 2,
                    z: coords.z + pack.l,
                },
                {
                    x: (3 * coords.x + (coords.x + pack.w)) / 4,
                    z: coords.z + pack.l,
                },
                {
                    x: coords.x + pack.w,
                    z: coords.z + pack.l,
                },

                // 4
                {
                    x: coords.x + pack.w,
                    z: (coords.z + 3 * (coords.z + pack.l)) / 4,
                },
                {
                    x: coords.x + pack.w,
                    z: (coords.z + (coords.z + pack.l)) / 2,
                },
                {
                    x: coords.x + pack.w,
                    z: (3 * coords.z + (coords.z + pack.l)) / 4,
                },
            ];

            // create the 2d space using the packs that have the same height 
            // from a certain coords
            let twoDimensionSpace = create2dSpace(coords);
            let packs = twoDimensionSpace[0];
            let space = twoDimensionSpace[1];

            // check if the four point of the pack are contained inside our 2D space
            let check = 0;
            for (let i = 0; i < packPoints.length; i++) {
                for (let j = 0; j < packs.length; j++) {
                    let p = packs[j];
                    let pointToTrait = packPoints[i];
                    let packSpace = space[p.id];

                    if (isPointContainedInSpace(packSpace, pointToTrait, false)) {
                        check++;
                        break;
                    }
                }
            }

            return check == 16;
        }

        Dragger.specificOpenPoints = [];

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

        console.log(Dragger.openPoints)
        for (let i = 0; i < Dragger.openPoints.length; i++) {
            let p = Dragger.openPoints[i];
            let possibleRotations = Dragger.item.packDetails.rotations;

            //empty the array to insert new elements in it.
            specificRotations = [];

            for (let j = 0; j < possibleRotations.length; j++) {
                let rotation = possibleRotations[j];
                let tmpBox = createTemperoryBox(rotation, p);

                if (checkCollision(tmpBox)) continue;
                if (p.y > 0 && !canFitAboveTheBoxNewVersion(rotation, p)) continue;

                if (
                    rotation.w + p.x <= limits.width
                    && rotation.h + p.y <= limits.height
                    && rotation.l + p.z <= limits.lenght
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
        changeOpacityUnvailableRotations(specificRotations)


        let specificOpenPointsGroup = new THREE.Group();
        specificOpenPointsGroup.name = "specificOpenPoints";

        Dragger.specificOpenPoints.forEach(p => {
            const geometry = new THREE.SphereGeometry(3, 32, 16);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(p.x, p.y, p.z)
            specificOpenPointsGroup.add(sphere);
        });

        scene.remove(scene.getObjectByName("specificOpenPoints"));
        scene.add(specificOpenPointsGroup)
    }
}

export default Dragger;