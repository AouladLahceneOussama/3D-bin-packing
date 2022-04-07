import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import Pack from './pack.js';

class Packer {

    constructor(algorithm) {
        this.algorithm = algorithm;
        this.packagesLoaded = [];
        this.openPoints = [];
        this.boxes = [];
    }

    /*initialise the packagesToLoad array from the array given from the user*/
    initialisePackagesToLoad() {
        var newPack;
        var packagesToLoad = [];
        var priorities = [];


        Pack.allInstances.map((pack) => {
            for (var i = 0; i < pack.q; i++) {
                newPack = {
                    ...pack,
                    w: pack.rotations[0].w,
                    h: pack.rotations[0].h,
                    l: pack.rotations[0].l,
                    id: pack.id + "-" + i,
                    parent_id: pack.id
                };
                delete newPack.q;
                packagesToLoad.push(newPack)
            }
        });

        //group the packages with their priorities
        let prioritesedPackagesToLoad = packagesToLoad.reduce((priorityGroup, pack) => {
            const prio = pack.priority;
            if (priorityGroup[prio] == null) priorityGroup[prio] = [];
            priorityGroup[prio].push(pack);

            return priorityGroup;
        }, {});

        //fill in the priorities table and sort the grouped packs with their volume
        Object.entries(prioritesedPackagesToLoad).forEach(([key, packs]) => {
            priorities.push(parseInt(key));

            //sort the grouped packages bu their volume
            packs.sort((a, b) => {
                return (b.v - a.v)
            });

        });

        //sort the priorities table
        priorities.sort((a, b) => {
            return a - b;
        });

        return [prioritesedPackagesToLoad, priorities];
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

    // Each box have 4 point in his base face
    // I check if the 4 points are contained inside that surface
    // Return true or false
    canFitAboveTheBoxNewVersion(pack, coords) {

        //create the four point of our pack
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

        return check == 16;
    }

    //checks if the points is contained in a certain space
    isPointContainedInSpace = (packSpace, point, restrected) => {
        // console.log(point.x, point.z, packSpace[0], packSpace[3])
        return restrected ?
            point.x > packSpace[0].x && point.x <= packSpace[3].x && point.z > packSpace[0].z && point.z <= packSpace[3].z
            :
            point.x >= packSpace[0].x && point.x <= packSpace[3].x && point.z >= packSpace[0].z && point.z <= packSpace[3].z;
    }

    packTakeToMuchSpace(point, pack) {
        let tmpOpenPoints = this.openPoints;

        let p = tmpOpenPoints.filter(p => {
            return p.y == 0 && p.z == 0;
        });

        p.sort((a, b) => {
            return b.x - a.x;
        });

        // console.log(point.x + pack.w, point.x, p[0].x);
        if (point.x != p[0].x && point.x + pack.w > p[0].x) {
            // console.log(false)
            return false;
        }

        // console.log(true)
        return true;
    }

    okRotation(container, pack) {
        for (let i = 0; i < this.openPoints.length; i++) {
            let point = this.openPoints[i];
            let newPack = { ...pack }
            // console.log(point)

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

        let pack = this.packagesLoaded[this.packagesLoaded.length - 1];
        //remove the points that are on the same line
        for (let i = 0; i < this.openPoints.length; i++) {
            let point1 = this.openPoints[i];
            let pack1 = point1.pointOwner.split("-")[0];

            for (let j = i + 1; j < this.openPoints.length; j++) {
                let point2 = this.openPoints[j];
                let pack2 = point2.pointOwner.split("-")[0];

                //delete the z point on the same axe
                if (point1.x == point2.x && point1.y == point2.y && pack1 == pack2) {
                    this.openPoints.splice(j, 1);
                }

                //delete the y point on the same axe
                if (point1.x == point2.x && point1.z == point2.z && pack1 == pack2) {
                    this.openPoints.splice(j, 1);
                }

                //delete the x point on the same axe
                if (point1.y == point2.y && point1.z == point2.z && pack1 == pack2) {
                    this.openPoints.splice(j, 1);
                }
            }
        }

        //remove the point on the edges
        for (let i = this.openPoints.length - 1; i >= 0; i--) {
            let point = this.openPoints[i];

            if (container.w == point.x || container.h == point.y || container.l == point.z)
                this.openPoints.splice(i, 1)
        }

        //remove the points dont have acces
        let idPointToRemove = [];
        this.openPoints.map((p, index) => {
            if (p.x + 1 >= pack.x && p.x + 1 <= pack.x + pack.w
                && p.z + 1 >= pack.z && p.z + 1 <= pack.z + pack.l
                && p.y > 0 && p.y == pack.y
                && p.pointOwner != pack.id) {
                idPointToRemove.push(index);
            }
        });

        idPointToRemove.sort((a, b) => {
            return b - a;
        });

        for (let i = idPointToRemove.length - 1; i >= 0; i--) {
            // console.log(this.openPoints[idPointToRemove[i]])
            this.openPoints.splice(idPointToRemove[i], 1);
        }

    }

    //remove the point where the box is added then sort the other points into the right order
    refreshOpenPoints(idItemToRemove, container) {
        //remove the filled points
        this.openPoints.splice(idItemToRemove, 1);

        //remove duplicates points
        this.openPoints = this.removeDuplicatesObjectFromArray(this.openPoints);

        //sort the points by the closets to the origins
        this.openPoints.sort((a, b) => {
            return ((a.x - b.x || a.z - b.z) || a.y - b.y)
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

    removeOpenPointForNextPriority() {
        for (let i = this.openPoints.length - 1; i >= 0; i--) {
            let point = this.openPoints[i];
            if (point.type == "T" || (point.type == "F" && point.y > 0))
                this.openPoints.splice(i, 1)
        }
    }

    //get the indexes of the packs that meet certain condition
    getIndexes(packGroup) {
        let pointAndIndex = [];

        this.openPoints.map((p, index) => {
            if (parseInt(p.pointOwner.split("-")[0]) == packGroup.parent_id && p.type == "T") {
                pointAndIndex.push({
                    index: index,
                    data: p
                });
            }
        });

        pointAndIndex.sort( (a,b) => {
            return a.index - b.index;
        });
        
        return pointAndIndex;
    }

    //remove the diagonal points that
    removeDiagonalPoints(packGroup) {

        let pointAndIndex = this.getIndexes(packGroup);
        if (pointAndIndex.length >= 2) {

            for (let i = 0; i < pointAndIndex.length; i++) {
                let p = pointAndIndex[i];
                console.log(pointAndIndex);

                for (let j = i + 1; j < pointAndIndex.length; j++) {
                    let p1 = pointAndIndex[j];

                    if (Math.abs(p1.data.z - p.data.z) % 2 == 0 ) {
                        this.openPoints.splice(p1.index, 1);
                        pointAndIndex = this.getIndexes(packGroup);
                        // break;
                    }
                    
                    // if (p.data.z + j * packGroup.l == p1.data.z) {
                    //     this.openPoints.splice(p1.index, 1);
                    //     pointAndIndex = this.getIndexes(packGroup);
                    //     // break;
                    // }
                }
            }

        }

    }

    solve(container, packages, priorities) {

        let packGroup = Object.keys(packages)[0][0];

        for (let groupIndex = 0; groupIndex < priorities.length; groupIndex++) {
            let packs = packages[priorities[groupIndex]];

            for (let packIndex = 0; packIndex < packs.length; packIndex++) {

                let pack = packs[packIndex];
                if (groupIndex == 0 && packIndex == 0) {
                    if (this.canFit(container, pack)) {
                        this.createPack(pack, { x: 0, y: 0, z: 0 });
                    }
                }
                else {
                    // let exist = this.packagesLoaded.filter(p => p.id == pack.id);
                    // if (exist.length > 0) continue;
                    // else {
                    let space = this.okRotation(container, pack);
                    if (space !== false) {
                        this.createPack(space[2], space[0]);
                        this.refreshOpenPoints(space[1], container);

                        if (packGroup.parent_id != pack.parent_id)
                            this.removeDiagonalPoints(packGroup);

                        //change the id of the pack after traitement
                        packGroup = pack;
                    }
                    // }
                }

            }

            // this.removeOpenPointForNextPriority();
        }

        this.removeDiagonalPoints(packGroup);

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
            return packLoaded.parent_id === id
        });
        return pack[0];
    }

    //create the open point ???????????????????? this function need to be traited
    createOpenPoints(coords, pack) {

        let validOpenPoint = [
            {
                pointOwner: pack.id,
                x: coords.x,
                y: coords.y + pack.h,
                z: coords.z,
                type: "T"
            },
        ];

        let openPoints = [
            {
                pointOwner: pack.id,
                x: coords.x,
                y: coords.y,
                z: coords.z + pack.l,
                type: "R"

            },
            {
                pointOwner: pack.id,
                x: coords.x + pack.w,
                y: coords.y,
                z: coords.z,
                type: "F"
            }
        ];

        if (coords.x == 0 && coords.y == 0 && coords.z == 0)
            return [...validOpenPoint, ...openPoints];

        let twoDimensionSpace = this.create2dSpace(coords);
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
                        if (!this.isPointContainedInSpace(packSpace, testPoint, false))
                            check++;
                    }

                    else {
                        if (this.isPointContainedInSpace(packSpace, testPoint, false)) {
                            let loadedPackInSpace = this.packagesLoaded.filter(p => {
                                // console.log(p.id, point);
                                return p.x <= point.x
                                    && p.x + p.w > point.x
                                    && p.z <= point.z
                                    && p.z + p.l > point.z
                                    && p.y == coords.y
                                    && p.id != point.pointOwner
                            });

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

    //create the pack and added it to the scene
    createPack(pack, coords) {
        //add the box to the scene and to loadedPackages array
        this.packagesLoaded.push({
            ...pack,
            ...coords
        });

        this.openPoints.push(...this.createOpenPoints(coords, pack))

        //add the boxes to the list
        this.boxes.push(this.createTemperoryBox(pack, coords));
    }
}

export default Packer;