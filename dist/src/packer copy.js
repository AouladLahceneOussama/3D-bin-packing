import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import Pack from './pack.js';

class Packer {

    constructor(algorithm) {
        this.algorithm = algorithm;
        // this.packagesToLoad = [];
        this.packagesLoaded = [];
        // this.slices = [];
        this.openPoints = [];
        this.boxes = [];
    }

    //create sub container above the big boxes added to the container
    // createSubContainer(container, pack) {
    //     subContainer = {};

    //     subContainer.w = pack.w;
    //     subContainer.h = container.h - pack.h;
    //     subContainer.l = pack.l;
    //     subContainer.coords = {
    //         x: pack.x,
    //         y: pack.y + pack.h,
    //         z: pack.z
    //     };
    //     subContainer.priority = pack.p;

    //     return subContainer;
    // }

    //create slices with the height and lenght of the container and the width of the first box
    // createSlice(container, pack) {
    //     if (this.slices.length == 0) {
    //         this.slices.push({
    //             w: pack.w,
    //             h: container.h,
    //             l: container.l,
    //             coords: {
    //                 x: configurations.extra_margin,
    //                 y: configurations.extra_margin,
    //                 z: configurations.extra_margin,
    //             }
    //         });
    //     }
    //     else {
    //         let lastSLice = this.slices[thi.slices.length - 1];
    //         this.slices.push({
    //             w: pack.w,
    //             h: container.h,
    //             l: container.l,
    //             coords: {
    //                 x: lastSLice.x + lastSLice.w,
    //                 y: configurations.extra_margin,
    //                 z: configurations.extra_margin,
    //             }
    //         });
    //     }
    // }

    //change the pack rotations
    // changePackRotation(pack, axis) {
    //     var newPack = {}
    //     if (axis == "y") {
    //         newPack = {
    //             ...pack,
    //             w: pack.l,
    //             h: pack.h,
    //             l: pack.w
    //         }
    //     }

    //     if (axis == "x") {
    //         newPack = {
    //             ...pack,
    //             w: pack.w,
    //             h: pack.l,
    //             l: pack.h
    //         }
    //     }

    //     if (axis == "z") {
    //         newPack = {
    //             ...pack,
    //             w: pack.h,
    //             h: pack.w,
    //             l: pack.l
    //         }
    //     }

    //     return newPack;
    // }

    //add the pack to the sub container 
    // check if he is with the same priority and small or equal in size
    // addPackToSubContainer(subContainer, packagesToLoad) {
    //     for (var i = 0; i < packagesToLoad.length; i++) {
    //         var pack = packages[i];
    //         if (!(pack.id in this.packagesLoadedId) && pack.p === subContainer.priority) {
    //             if (this.canFit(subContainer, pack)) {
    //                 this.packagesLoaded.push({
    //                     ...pack,

    //                 });
    //                 this.packagesLoadedId.push(pack.id);
    //                 this.createSubContainer(subContainer, pack)
    //             }
    //         }
    //     }
    // }

    //check if the pack can fit in the left space or not
    //integrate the rotation later



    // canFitInSlice(pack) {
    //     this.slices.forEach(slice => {
    //         slice.packages.forEach( pack => {

    //         })
    //     })
    // }

    //return the left spaces from all the possible sides
    // leftSpaces(container, coords) {
    //     return {
    //         w: container.w - coords.x,
    //         h: container.h - coords.y,
    //         l: container.l - coords.z
    //     }
    // }

    //check if the box can be inserted in the top of the other one
    // canFitAboveBox(pack, point) {
    //     if (pack.w <= point.max.maxX.x && pack.l <= point.max.maxZ.z)
    //         return true;

    //     return false
    // }

    // accumulateDistance(onLoadPack, type) {
    //     let result = this.packagesLoaded.filter(pack => {
    //         if (type == "F")
    //             return pack.z == onLoadPack.z && pack.y == onLoadPack.y && onLoadPack.h == pack.h;

    //         if (type == "R")
    //             return pack.x == onLoadPack.x && pack.y == onLoadPack.y && onLoadPack.h == pack.h;
    //     })

    //     let dis = result.reduce((distance, pack) => {
    //         if (type == "F")
    //             return distance + pack.w

    //         if (type == "R")
    //             return distance + pack.l

    //     }, 1);

    //     console.log(onLoadPack, result)

    //     return dis;
    // }

    // canFitAboveTheBox(pack, coords) {
    //     if (coords.type !== "T") return;
    //     let groundPack = this.getPackByOpenPoint(coords);

    //     if the package is not on the ground we get the pack under of the pack who have that open point
    //     if (groundPack.onTopOf !== "G")
    //         groundPack = this.getPackById(groundPack.onTopOf);

    //     this.accumulateDistance(groundPack, "F")
    //     this.accumulateDistance(groundPack, "R")

    //     let fd = distancePointLine(coords.x, this.accumulateDistance(groundPack, "F"));
    //     let rd = distancePointLine(coords.z, this.accumulateDistance(groundPack, "R"));

    //     let fd = distancePointLine(coords.x, 1 * (groundPack.x + groundPack.w));
    //     let rd = distancePointLine(coords.z, 1 * (groundPack.z + groundPack.l));

    //     console.log(pack, fd, rd)
    //     console.log(this.openPoints)
    //     console.log("groundPack", groundPack, "coords", coords, "pack", pack, "rd ", rd, "fd ", fd)
    //     if (pack.w <= fd && pack.l <= rd) return true;

    //     return false
    // }



    //original without rotations
    // ok1(container, pack) {
    //     for (let i = 0; i < this.openPoints.length; i++) {
    //         let point = this.openPoints[i];

    //         if (pack.l + point.z <= container.l && pack.h + point.y <= container.h && pack.w + point.x <= container.w) {
    //             let tmpBox = this.createTemperoryBox(pack, point);
    //             let isThereCollision = this.checkCollision(tmpBox);

    //             if (isThereCollision) continue;
    //             // if (point.y > 1 && !this.canFitAboveTheBox(pack, point)) continue;
    //             if (point.y > 1 && !this.canFitAboveTheBoxNewVersion(pack, point)) continue;
    //             // if ('max' in point && !this.canFitAboveBox(pack, point)) continue;

    //             return [point, i];
    //         }
    //         if (i == this.openPoints.length - 1) return false;
    //     }
    // }

    // ok(container, pack) {
    //     const space = {
    //         x: configurations.extra_margin,
    //         y: configurations.extra_margin,
    //         z: configurations.extra_margin
    //     }

    //     for (let i = 0; i < this.packagesLoaded.length; i++) {

    //         if (space.x >= container.w) space.x = configurations.extra_margin;
    //         if (space.y >= container.h) space.y = configurations.extra_margin;
    //         if (space.z >= container.l) space.z = configurations.extra_margin;

    //         if (this.packagesLoaded[i].z + this.packagesLoaded[i].l + pack.l < container.l) {
    //             space.z += this.packagesLoaded[i].z + this.packagesLoaded[i].l;
    //             space.x = configurations.extra_margin;
    //             space.y = configurations.extra_margin;

    //             if (i == this.packagesLoaded.length - 1) return space;
    //         }
    //         else if (this.packagesLoaded[i].y + this.packagesLoaded[i].h + pack.h < container.h) {
    //             space.y += this.packagesLoaded[i].y + this.packagesLoaded[i].h;
    //             space.x = configurations.extra_margin;
    //             space.z = configurations.extra_margin;

    //             if (i == this.packagesLoaded.length - 1) return space;
    //         }
    //         else if (this.packagesLoaded[i].x + this.packagesLoaded[i].w + pack.w < container.w) {
    //             space.x += this.packagesLoaded[i].x + this.packagesLoaded[i].w;
    //             space.y = configurations.extra_margin;
    //             space.z = configurations.extra_margin;

    //             if (i == this.packagesLoaded.length - 1) return space;
    //         }
    //         else {
    //             return false
    //         }

    //     }
    // }

    /*initialise the packagesToLoad array from the array given from the user*/
    initialisePackagesToLoad() {
        var newPack;
        var packagesToLoad = [];
        // this.packagesToLoad = Pack.allInstances;

        Pack.allInstances.map((pack) => {
            for (var i = 0; i < pack.q; i++) {
                newPack = {
                    ...pack,
                    id: pack.id + "-" + i,
                    parent_id: pack.id
                };
                delete newPack.q;
                packagesToLoad.push(newPack)
            }
        });

        //sort using volumes
        packagesToLoad.sort((a, b) => {
            return ( b.v - a.v && b.priority - a.priority)
        });

        return packagesToLoad;
    }

    canFit(space, pack) {
        if (pack.w <= space.w && pack.l <= space.l && pack.h <= space.h) return true;
        return false;
    }

    //recursive method that runs unltil it find the last element with same id on top of each other
    getDownPack(downPack, count, id) {
        if (downPack == -1 || downPack.parent_id != id) return count;
        else {
            downPack = this.getPackByTopCoords({ x: downPack.x, y: downPack.y, z: downPack.z });
            count++;
            return this.getDownPack(downPack, count, id);
        }
    }

    getPackByTopCoords(coords) {
        //find the open point
        let pack = this.packagesLoaded.filter((packLoaded) => {
            return packLoaded.openPoint.T.x == coords.x && packLoaded.openPoint.T.y == coords.y && packLoaded.openPoint.T.z == coords.z
        });
        return pack[0] || -1;
    }

    //check if the box can be stacked on top of another one ( condition the same pack not different one)
    canBeStacked(pack, openPoint) {
        let downPack = this.getPackByOpenPoint(openPoint);
        if (downPack.parent_id == pack.parent_id) {
            let countOfStacks = this.getDownPack(downPack, 0, pack.parent_id);
            if (countOfStacks <= pack.stackC) return true;
            else return false
        }
        return true;
    }

    //create a 2d space on top of boxes
    create2dSpace(coords) {
        //find the boxes that will create our 2d space
        let packs = this.packagesLoaded.filter(p => {
            let upperPoint = p.y + p.h;
            return upperPoint == coords.y;
        });

        //fill the space with the coordinates of each box
        let space = [];
        packs.forEach(p => {
            space[p.id] = [];
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

    // Each box have 4 point in his base face
    // I check if the 4 points are contained inside that surface
    // Return true or false
    canFitAboveTheBoxNewVersion(pack, coords) {

        //create the four point of our pack
        let packPoints = [
            {
                x: coords.x,
                z: coords.z,
            },
            {
                x: coords.x + pack.w,
                z: coords.z,
            },
            {
                x: coords.x,
                z: coords.z + pack.l,
            },
            {
                x: coords.x + pack.w,
                z: coords.z + pack.l,
            }
        ];

        //create the 2d space using the packs that have the same height from a certain coords
        let twoDimensionSpace = this.create2dSpace(coords);
        let packs = twoDimensionSpace[0];
        let space = twoDimensionSpace[1];

        //check if the four point of the pack are contained inside our 2D space
        let check = 0;
        for (let i = 0; i < packPoints.length; i++) {
            for (let j = 0; j < packs.length; j++) {
                let p = packs[j];
                let pointToTrait = packPoints[i];
                let packSpace = space[p.id];

                if (this.isPointContainedInSpace(packSpace, pointToTrait, false)) {
                    check++;
                    break;
                }
            }
        }

        return check == 4;
    }

    //checks if the points is contained in a certain space
    isPointContainedInSpace = (packSpace, point, restrected) => {
        return restrected ?
            point.x >= packSpace[0].x && point.x < packSpace[3].x && point.z >= packSpace[0].z && point.z < packSpace[3].z
            :
            point.x >= packSpace[0].x && point.x <= packSpace[3].x && point.z >= packSpace[0].z && point.z <= packSpace[3].z;
    }

    okRotation(container, pack) {
        for (let i = 0; i < this.openPoints.length; i++) {
            let point = this.openPoints[i];
            let newPack = { ...pack }

            if (point.y > 0 && point.type == "T" && pack.stackC != -1 && !this.canBeStacked(pack, point)) continue;

            for (let j = 0; j < pack.rotations.length; j++) {
                let p = pack.rotations[j];
                if (p.l + point.z <= container.l && p.h + point.y <= container.h && p.w + point.x <= container.w) {
                    let tmpBox = this.createTemperoryBox(p, point);
                    let isThereCollision = this.checkCollision(tmpBox);

                    if (isThereCollision) continue;
                    if (point.y > 0 && !this.canFitAboveTheBoxNewVersion(p, point)) continue;
                    newPack.w = p.w;
                    newPack.l = p.l;
                    newPack.h = p.h;
                    newPack.validRotation = p.type;
                    return [point, i, newPack];
                }
            }

            if (i == this.openPoints.length - 1) return false;
        }
    }

    //remove non eligible points
    //fixes two axes and searching for the smallest one on each axe
    //storing the new elligible points
    removeNonWorkingOpenPoints(container) {

        for (let i = 0; i < this.openPoints.length; i++) {
            let point1 = this.openPoints[i];
            let pack1 = point1.pointOwner.split("-")[0];

            for (let j = i + 1; j < this.openPoints.length; j++) {
                let point2 = this.openPoints[j];
                let pack2 = point2.pointOwner.split("-")[0];

                //delete the z point on the same axe
                if (point1.x == point2.x && point1.y == point2.y && pack1 == pack2)
                    this.openPoints.splice(j, 1);

                //delete the y point on the same axe
                if (point1.x == point2.x && point1.z == point2.z && pack1 == pack2)
                    this.openPoints.splice(j, 1);

                //delete the x point on the same axe
                if (point1.y == point2.y && point1.z == point2.z && pack1 == pack2)
                    this.openPoints.splice(j, 1);

            }
        }

        //remove the point on the edges
        for (let i = 0; i < this.openPoints.length; i++) {
            let point = this.openPoints[i];

            if (container.w == point.x || container.h == point.y || container.l == point.z)
                this.openPoints.splice(i, 1)

        }

    }

    //remove the point where the box is added then sort the other points into the right order
    refreshOpenPoints(idItemToRemove, container) {
        //remove the filled points
        // this.removeOpenPointOnSameAxis(idItemToRemove, pack);
        this.openPoints.splice(idItemToRemove, 1);


        //remove duplicates points
        this.openPoints = this.removeDuplicatesObjectFromArray(this.openPoints);
        //sort the points by the closets to the origins
        this.openPoints.sort((a, b) => {
            return ((a.x - b.x || a.y - b.y) || a.z - b.z)
        });

        //remove non eligible points
        this.removeNonWorkingOpenPoints(container);

    }

    //removes the duplicates objects or points exist in a certain array
    removeDuplicatesObjectFromArray(array) {
        return array.filter((elem, index, self) =>
            self.findIndex(
                (t) => {
                    return (t.x === elem.x && t.y === elem.y && t.z === elem.z)
                }) === index
        )
    }

    getDifference(array1, array2) {
        return array1.filter(obj1 => {
            return !array2.some(obj2 => {
                return obj1.id === obj2.parent_id;
            });
        });
    }

    solve(container, packages) {

        let coords = {
            x: 0,
            y: 0,
            z: 0
        }

        for (let packIndex = 0; packIndex < packages.length; packIndex++) {

            let pack = packages[packIndex];

            if (packIndex == 0) {

                if (this.canFit(container, pack)) {
                    this.createPack(pack, coords);
                }

            }
            else {
                let exist = this.packagesLoaded.filter(p => p.id == pack.id);
                if (exist.length > 0) continue;
                else {
                    let space = this.okRotation(container, pack);
                    if (space !== false) {
                        this.createPack(space[2], space[0]);
                        this.refreshOpenPoints(space[1], container);
                    }
                }
            }

        }

        // this.loadPacks();
        // this.loadResult();
        console.log("packagesLoaded => ");
        console.log(this.packagesLoaded)

        console.log("openPoints => ");
        console.log(this.openPoints)

        return [this.openPoints, this.packagesLoaded];
    }

    checkCollision(box) {
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

        for (let i = 0; i < this.boxes.length; i++) {
            let loadedBox = this.boxes[i];
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
    createTemperoryBox(pack, coords) {
        let normalMateriel = new THREE.MeshLambertMaterial({ color: pack.color * 0xFF0FFF, side: THREE.DoubleSide })

        let boxGeometry = new THREE.BoxGeometry(pack.w, pack.h, pack.l);
        let box = new THREE.Mesh(boxGeometry, normalMateriel);
        let vec3 = new THREE.Vector3(coords.x, coords.y, coords.z);

        box.position.copy(vec3);
        boxGeometry.translate(pack.w / 2, pack.h / 2, pack.l / 2);

        return box;
    }

    //find the box or the pack that have the specific open point
    getPackByOpenPoint(coords) {
        //find the open point
        let pack = this.packagesLoaded.filter((packLoaded) => {
            return packLoaded.id === coords.pointOwner
        });
        return pack[0];
    }

    //find the box or the pack that have the specific id
    getPackById(id) {
        //find the open point
        let pack = this.packagesLoaded.filter((packLoaded) => {
            return packLoaded.id === id
        });
        return pack[0];
    }

    createOpenPoints(coords) {
        let lastPack = this.packagesLoaded[this.packagesLoaded.length - 1];

        let validOpenPoint = [
            {
                pointOwner: lastPack.id,
                x: coords.x,
                y: coords.y + lastPack.h,
                z: coords.z,
                type: "T"
            },
        ];

        let openPoints = [
            {
                pointOwner: lastPack.id,
                x: coords.x,
                y: coords.y,
                z: coords.z + lastPack.l,
                type: "R"

            },
            {
                pointOwner: lastPack.id,
                x: coords.x + lastPack.w,
                y: coords.y,
                z: coords.z,
                type: "F"
            }
        ];

        //create the 2d space using the packs that have the same height from a certain coords
        let twoDimensionSpace = this.create2dSpace(coords);
        let packs = twoDimensionSpace[0];
        let space = twoDimensionSpace[1];

        if (coords.y == 0) return [...validOpenPoint, ...openPoints];

        for (let i = 0; i < openPoints.length; i++) {
            for (let j = 0; j < packs.length; j++) {
                let p = packs[j];
                let pointToTrait = openPoints[i];
                let packSpace = space[p.id];

                if (this.isPointContainedInSpace(packSpace, pointToTrait, true)) {
                    validOpenPoint.push(pointToTrait);
                    break;
                }
            }
        }

        return validOpenPoint;

    }

    //create the pack and added it to the scene
    createPack(pack, coords) {

        let groundedPack = this.getPackByOpenPoint(coords);

        //add the box to the scene and to loadedPackages array
        this.packagesLoaded.push({
            ...pack,
            ...coords,
            onTopOf: coords.y != 0 ? (groundedPack.onTopOf == "G" ? groundedPack.id : groundedPack.onTopOf) : "G",
            openPoint: {
                R: {
                    x: coords.x,
                    y: coords.y,
                    z: coords.z + pack.l,
                },
                T: {
                    x: coords.x,
                    y: coords.y + pack.h,
                    z: coords.z,
                },
                F: {
                    x: coords.x + pack.w,
                    y: coords.y,
                    z: coords.z,
                }
            }
        });

        // if (coords.y != 0) {
        // this.openPoints.push(
        // // {
        // //     pointOwner: pack.id,
        // //     x: coords.x,
        // //     y: coords.y,
        // //     z: coords.z + pack.l,
        // //     type: "R"
        // // }, 
        // {
        //     pointOwner: pack.id,
        //     x: coords.x,
        //     y: coords.y + pack.h,
        //     z: coords.z,
        //     type: "T"
        // }, 
        // // {
        // //     pointOwner: pack.id,
        // //     x: coords.x + pack.w,
        // //     y: coords.y,
        // //     z: coords.z,
        // //     type: "F"
        // // }
        // );
        // }
        // else{
        // this.openPoints.push(
        //     {
        //         pointOwner: pack.id,
        //         x: coords.x,
        //         y: coords.y,
        //         z: coords.z + pack.l,
        //         type: "R"
        //     },
        //     {
        //         pointOwner: pack.id,
        //         x: coords.x,
        //         y: coords.y + pack.h,
        //         z: coords.z,
        //         type: "T"
        //     },
        //     {
        //         pointOwner: pack.id,
        //         x: coords.x + pack.w,
        //         y: coords.y,
        //         z: coords.z,
        //         type: "F"
        //     }
        // );
        // }

        this.openPoints.push(...this.createOpenPoints(coords))
        // console.log()

        //add the boxes to the list
        this.boxes.push(this.createTemperoryBox(pack, coords));
    }
}

export default Packer;