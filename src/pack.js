import * as THREE from "../threeJsLib/three.js.r122.js"
import { scale_meter_px, scene } from "./configurations.js";
import Logger from './logger.js';

let Id = 0;

class Pack {

    static allInstances = [];

    constructor(label, width, height, lenght, quantity, stackingCapacity, rotations, priority, subQuantities = []) {
        this.id = Id++;
        this.label = label;
        this.w = parseInt(width * scale_meter_px);
        this.h = parseInt(height * scale_meter_px);
        this.l = parseInt(lenght * scale_meter_px);
        this.q = parseInt(quantity);
        this.v = this.w * this.h * this.l;
        this.stackingCapacity = parseInt(stackingCapacity);
        this.rotations = rotations;
        this.dimensions = this.setDimensions(rotations);
        this.priority = parseInt(priority);
        this.color = Math.random();
        this.multiplePrio = subQuantities.length > 0 ? true : false;
        this.subQuantities = subQuantities;

        //store the instances created
        Pack.allInstances.push(this.getPack);
    }

    //return the data pack that is stored in the instances
    get getPack() {

        return {
            id: this.id,
            label: this.label,
            w: this.w,
            h: this.h,
            l: this.l,
            q: this.q,
            v: this.v,
            priority: this.priority,
            stackC: this.stackingCapacity,
            rotations: this.dimensions,
            rotateDirections: this.rotations,
            multiplePrio: this.multiplePrio,
            subQuantities: this.subQuantities,
            color: this.color,
        }
    }

    //return the data pack to store in the localstorage
    get getPackToLocalStorage() {

        return {
            label: this.label,
            w: this.w / scale_meter_px,
            h: this.h / scale_meter_px,
            l: this.l / scale_meter_px,
            q: this.q,
            priority: this.priority,
            stackC: this.stackingCapacity,
            rotations: this.rotations,
            subQuantities: this.subQuantities,
        }

    }

    //set the orientations of the packs depending on the rotation given by the user
    setDimensions(orientations) {
        // console.log(orientations)
        let d = [];
        for (let i = 0; i < orientations.length; i++) {
            let availableRotation = orientations[i];

            //The base rotation and with 90 deg
            if (availableRotation == "base") {
                d.push({
                    w: this.w,
                    h: this.h,
                    l: this.l,
                    type: [availableRotation, 0],
                    surface: this.w * this.l
                }, {
                    w: this.l,
                    h: this.h,
                    l: this.w,
                    type: [availableRotation, 90],
                    surface: this.w * this.l
                })
            }

            //The right-side rotation and with 90 deg
            if (availableRotation == "right-side") {
                d.push({
                    w: this.w,
                    h: this.l,
                    l: this.h,
                    type: [availableRotation, 0],
                    surface: this.w * this.h
                }, {
                    w: this.h,
                    h: this.l,
                    l: this.w,
                    type: [availableRotation, 90],
                    surface: this.w * this.h
                })
            }

            //The front-side rotation and with 90 deg
            if (availableRotation == "front-side") {
                d.push({
                    w: this.h,
                    h: this.w,
                    l: this.l,
                    type: [availableRotation, 0],
                    surface: this.h * this.l
                }, {
                    w: this.l,
                    h: this.w,
                    l: this.h,
                    type: [availableRotation, 90],
                    surface: this.h * this.l
                })
            }
        }

        //sort the possible rotations with the one that have the biggest surface
        d.sort((a, b) => {
            return (b.surface - a.surface);
        });

        //choose the best orientation for the box
        for (let i = 0; i < d.length; i += 2) {
            if (d[i].l > d[i].w) {
                var tmp = d[i + 1];
                d[i + 1] = d[i];
                d[i] = tmp;
            }
        }

        return d;
    }

    static init() {
        if (localStorage.getItem("packages") !== null) {
            let packages = JSON.parse(localStorage.getItem("packages"));

            packages.forEach(p => {
                new Pack(p.label, p.w, p.h, p.l, p.q, p.stackC, p.rotations, p.priority, p.subQuantities);
            });

            Pack.allInstances.forEach(pack => {
                var packDim = pack.w / scale_meter_px + " , " + pack.h / scale_meter_px + " , " + pack.l / scale_meter_px + " ( " + pack.q + " ) ";
                $("#packageDetails").append('<div class="packInfo"><div>' + pack.label + '</div><div class="packInfo-numbers">' + packDim + ' </div></div>');
            });
        }
    }

    //add the pack to the localstorage
    add() {
        var packages = [];
        if (localStorage.getItem("packages") !== null) {
            packages = JSON.parse(localStorage.getItem("packages"));
        }

        packages.push(this.getPackToLocalStorage)
        localStorage.setItem("packages", JSON.stringify(packages));

        Pack.loadPacks();
        let logger = new Logger("Adding Pack", 0.01);
        logger.dispatchMessage();
    }

    static updatePackLocalstorage() {
        //remove the old stored packages in the localstorage
        localStorage.removeItem("packages");

        //add new data the new list to the localstorage
        let packagesLocalStorage = [];
        Pack.allInstances.map(pack => {
            // console.log(pack)
            packagesLocalStorage.push({
                label: pack.label,
                w: parseFloat(pack.w / scale_meter_px),
                h: parseFloat(pack.h / scale_meter_px),
                l: parseFloat(pack.l / scale_meter_px),
                q: parseInt(pack.q),
                priority: pack.priority,
                stackC: parseInt(pack.stackC),
                rotations: pack.rotateDirections,
                multiplePrio: pack.subQuantities.length > 0 ? true : false,
                subQuantities: pack.subQuantities
            });
        });

        localStorage.setItem("packages", JSON.stringify(packagesLocalStorage));
    };

    //update the pack
    static update(updatedData, packIdToUpdate) {

        function setDimensions(orientations, w, h, l) {
            // console.log(orientations)
            let d = [];
            for (let i = 0; i < orientations.length; i++) {
                let availableRotation = orientations[i];

                //The base rotation and with 90 deg
                if (availableRotation == "base") {
                    d.push({
                        w: w,
                        h: h,
                        l: l,
                        type: [availableRotation, 0],
                        surface: w * l
                    }, {
                        w: l,
                        h: h,
                        l: w,
                        type: [availableRotation, 90],
                        surface: w * l
                    })
                }

                //The right-side rotation and with 90 deg
                if (availableRotation == "right-side") {
                    d.push({
                        w: w,
                        h: l,
                        l: h,
                        type: [availableRotation, 0],
                        surface: w * h
                    }, {
                        w: h,
                        h: l,
                        l: w,
                        type: [availableRotation, 90],
                        surface: w * h
                    })
                }

                //The front-side rotation and with 90 deg
                if (availableRotation == "front-side") {
                    d.push({
                        w: h,
                        h: w,
                        l: l,
                        type: [availableRotation, 0],
                        surface: h * l
                    }, {
                        w: l,
                        h: w,
                        l: h,
                        type: [availableRotation, 90],
                        surface: h * l
                    })
                }
            }

            d.sort((a, b) => {
                return b.surface - a.surface;
            });

            //choose the best orientation for the box
            for (let i = 0; i < d.length; i += 2) {
                // console.log(i, d[i], d[i + 1]);
                if (d[i].l > d[i].w) {
                    var tmp = d[i + 1];
                    d[i + 1] = d[i];
                    d[i] = tmp;
                }
            }

            return d;
        };

        let packIndex = Pack.allInstances.findIndex((pack => pack.id == parseInt(packIdToUpdate)));

        let oldPack = Pack.allInstances[packIndex];

        let updatedPack = {
            label: updatedData.label,
            w: parseInt(updatedData.w),
            h: parseInt(updatedData.h),
            l: parseInt(updatedData.l),
            q: parseInt(updatedData.q),
            priority: parseInt(updatedData.priority),
            v: updatedData.w * updatedData.h * updatedData.l,
            stackC: parseInt(updatedData.stack),
            rotateDirections: updatedData.r,
            rotations: setDimensions(updatedData.r, parseInt(updatedData.w), parseInt(updatedData.h), parseInt(updatedData.l)),
            multiplePrio: updatedData.subQuantities.length > 0 ? true : false,
            subQuantities: updatedData.subQuantities
        }

        let newPack = {
            ...oldPack,
            ...updatedPack
        }

        Pack.allInstances[packIndex] = newPack;
        Pack.removePacksFromTheScene();
        Pack.updatePackLocalstorage();

        $("#packageDetails").empty();
        Pack.allInstances.forEach(pack => {
            var packDim = pack.w / scale_meter_px + " , " + pack.h / scale_meter_px + " , " + pack.l / scale_meter_px + " ( " + pack.q + " ) ";
            $("#packageDetails").append('<div class="packInfo"><div>' + pack.label + '</div><div class="packInfo-numbers">' + packDim + ' </div></div>');
        });

        let logger = new Logger("Updating Pack", 0.01);
        logger.dispatchMessage();
    }

    //remove the pack
    static remove(packIdToRemove) {
        let packIndex = Pack.allInstances.findIndex((pack => pack.id == parseInt(packIdToRemove)));
        Pack.allInstances.splice(packIndex, 1);
        Pack.removePacksFromTheScene();
        Pack.updatePackLocalstorage();

        $("#packageDetails").empty();
        Pack.allInstances.forEach(pack => {
            var packDim = pack.w / scale_meter_px + " , " + pack.h / scale_meter_px + " , " + pack.l / scale_meter_px + " ( " + pack.q + " ) ";
            $("#packageDetails").append('<div class="packInfo"><div>' + pack.label + '</div><div class="packInfo-numbers">' + packDim + ' </div></div>');
        });

        let logger = new Logger("Remove Pack", 0.01);
        logger.dispatchMessage();
    }

    //load the packs created
    static loadPacks() {

        function showData(pack) {
            var packDim = pack.w / scale_meter_px + " , " + pack.h / scale_meter_px + " , " + pack.l / scale_meter_px + " ( " + pack.q + " ) ";
            $("#packageDetails").append('<div class="packInfo"><div>' + pack.label + '</div><div class="packInfo-numbers">' + packDim + ' </div></div>');
        }

        Pack.removeBoxesFromTheScene()
        $("#packageDetails div").remove();
        
        let packages = Pack.allInstances;
        let boxes = new THREE.Group();
        boxes.name = "pack_shower";

        //sort the packages by volume
        packages.sort((a, b) => {
            return b.v - a.v;
        });

        var box, boxGeometry, materiel;
        let xJump = -300;
        let zJump = 400;

        for (let i = 0; i < packages.length; i++) {

            let p = packages[i];

            boxGeometry = new THREE.BoxGeometry(p.w, p.h, p.l)
            materiel = new THREE.MeshLambertMaterial({ color: p.color * 0xFF0FFF, side: THREE.DoubleSide })

            box = new THREE.Mesh(boxGeometry, materiel)
            box.castShadow = true;
            box.receiveShadow = true;
            box.userData.id = p.id;
            box.userData.hover = true;
            box.userData.dragDrop = true;
            box.userData.clickable = true;
            box.userData.actif = false;
            box.userData.name = "Pack";

            if (i != 0)
                box.position.set(xJump, - 110 - 0.1, zJump)

            else
                box.position.set(xJump, - 65, zJump)

            xJump += p.w + 20
            if (xJump > 800) {
                zJump += 400
                xJump = -300;
            }

            boxGeometry.translate(p.w / 2, p.h / 2, p.l / 2);
            boxes.add(box)

            showData(p);
        }

        scene.add(boxes)
    }

    //load the packs from localstorage
    static loadPacksFromLocalStorage() {
        // Route.init();
        Pack.init();
        Pack.loadPacks();
    }

    //remove all the packs added to the screen
    static removePacksFromTheScene() {
        scene.remove(scene.getObjectByName("All_Packs"))
    }

    //remove the clicked boxes ( packs shower )
    static removeBoxesFromTheScene() {
        scene.remove(scene.getObjectByName("pack_shower"))
    }

    static reloadShowPacker(){
        Pack.removeBoxesFromTheScene();
        Pack.loadPacks();
    }

}

export default Pack;