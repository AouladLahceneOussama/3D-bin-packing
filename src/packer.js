import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import Pack from './pack.js';

class Packer {

    constructor(algorithm) {
        this.algorithm = algorithm;
        this.packagesLoaded = [];
        this.openPoints = [{ x: 0, y: 0, z: 0 }];
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

    // packTakeToMuchSpace(point, pack) {
    //     let tmpOpenPoints = this.openPoints;

    //     let p = tmpOpenPoints.filter(p => {
    //         return p.y == 0 && p.z == 0;
    //     });

    //     p.sort((a, b) => {
    //         return b.x - a.x;
    //     });

    //     // console.log(point.x + pack.w, point.x, p[0].x);
    //     if (point.x != p[0].x && point.x + pack.w > p[0].x) {
    //         // console.log(false)
    //         return false;
    //     }

    //     // console.log(true)
    //     return true;
    // }

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

        let pack = this.packagesLoaded[this.packagesLoaded.length - 1];

        //remove the point on the edges
        for (let i = this.openPoints.length - 1; i >= 0; i--) {
            let point = this.openPoints[i];

            if (container.w == point.x || container.h == point.y || container.l == point.z)
                this.openPoints.splice(i, 1)
        }


        // console.log(pack)
        //remove the points dont have acces
        //that mean the point that i pass on them while positioning the boxes
        let idPointToRemove = [];
        this.openPoints.map((p, index) => {
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
            // console.log(this.openPoints[idPointToRemove[i]])
            this.openPoints.splice(idPointToRemove[i], 1);
        }

        //remove the points that are on the same line
        for (let i = 0; i < this.openPoints.length; i++) {
            let point1 = this.openPoints[i];
            let pack1 = point1.pointOwner.split("-")[0];

            for (let j = i + 1; j < this.openPoints.length; j++) {
                let point2 = this.openPoints[j];
                let pack2 = point2.pointOwner.split("-")[0];

                //delete the z point on the same axe
                //check if the points cover the same space
                //remove only the point that cover the same space
                //keep the points that have a different surface to cover
                if (point1.x == point2.x && point1.y == point2.y && point1.type != "S" && pack1 == pack2) {
                    // console.log(point1.y)
                    let check = this.packagesLoaded.filter(pack => {
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

                    let check1 = this.packagesLoaded.filter(pack => {
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
                            this.openPoints.splice(j, 1);
                        }
                    }
                    if (check.length == 0 && check1.length == 0) {
                        // console.log(this.openPoints[j])
                        this.openPoints.splice(j, 1);
                    }
                }

                //delete the y point on the same axe
                if (point1.x == point2.x && point1.z == point2.z && pack1 == pack2) {
                    // console.log(this.openPoints[j])
                    this.openPoints.splice(j, 1);
                }

                //delete the z point on the same axe
                if (point1.y == point2.y && point1.z == point2.z && !point1.ignored && pack1 == pack2) {
                    if (point2.type != "S") {
                        // console.log(this.openPoints[j])
                        this.openPoints.splice(j, 1);
                    }
                }
            }
        }
    }

    //remove the point where the box is added then sort the other points into the right order
    refreshOpenPoints(idItemToRemove, container) {
        //remove the filled points
        this.openPoints.splice(idItemToRemove, 1);

        //remove duplicates points
        this.openPoints = this.removeDuplicatesObjectFromArray(this.openPoints);

        //sort the points by the closets to the origins
        this.sortOpenPoints();

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

    //remove the point to give the ability to the next priority to be distributed in the container
    //?????????????????????? need to be fixed ?????????????????????
    removeOpenPointForNextPriority() {
        let topPoints = [];

        this.openPoints.map((p, i) => {
            if (p.type == "T")
                topPoints.push({
                    data: p,
                    index: i
                });
        })

        if (topPoints.length > 0) {
            topPoints.sort((a, b) => {
                return b.data.y - a.data.y;
            });

            // console.log(topPoints)

            //get the max height
            let maxHeight = topPoints[0].data.y;

            topPoints.sort((a, b) => {
                return b.index - a.index;
            });

            for (let i = topPoints.length - 1; i >= 0; i--) {
                let point = topPoints[i]
                // console.log(point, maxHeight)
                if (point.data.y == maxHeight) {
                    console.log(this.openPoints[point.index])
                    this.openPoints.splice(point.index, 1)
                }
            }
        }
    }

    //get the indexes of the packs that meet certain condition
    getIndexes(packGroup) {
        let pointAndIndex = [];

        this.openPoints.map((p, index) => {
            if (parseInt(p.type != undefined && p.type == "T" && p.pointOwner.split("-")[0]) == packGroup.parent_id) {
                pointAndIndex.push({
                    index: index,
                    data: p
                });
            }
        });

        return pointAndIndex;
    }

    //remove the diagonal points on top of a loaded pack
    removeDiagonalPoints(packGroup) {

        let pointAndIndex = this.getIndexes(packGroup);
        let remove = [];

        if (pointAndIndex.length >= 2) {

            for (let i = 0; i < pointAndIndex.length; i++) {
                let p = pointAndIndex[i];

                for (let j = i + 1; j < pointAndIndex.length; j++) {
                    let p1 = pointAndIndex[j];
                    let cdt = 
                        Math.abs(p1.data.z - p.data.z) % packGroup.l == 0
                        && Math.abs(p1.data.x - p.data.x) % packGroup.w == 0
                        && p.data.y == p1.data.y
                        && p1.data.z > p.data.z
                        && p1.data.x > p.data.x;

                    if (cdt) 
                        remove.push(p1.index);
                }
            }

            let uniqIds = [...new Set(remove)];
            uniqIds.sort((a, b) => {
                return b - a;
            })

            uniqIds.map(id => {
                // console.log(this.openPoints[id])
                this.openPoints.splice(id, 1);
            });
        }
    }

    //sort the open points
    sortOpenPoints() {
        this.openPoints.sort((a, b) => {
            return ((a.x - b.x || a.z - b.z) || a.y - b.y);
        });
    }

    //?????????????????????????????????????
    //take of the part of fitting the first box
    //make only one logic to treat all the packages
    //trait the case if the pack is bigger than the container then it should be ignored
    solve(container, packages, priorities) {
        for (let groupIndex = 0; groupIndex < priorities.length; groupIndex++) {
            let packs = packages[priorities[groupIndex]];

            for (let packIndex = 0; packIndex < packs.length; packIndex++) {

                let pack = packs[packIndex];
                let space = this.okRotation(container, pack);

                if (space !== false) {
                    this.createPack(space[2], space[0]);
                    this.refreshOpenPoints(space[1], container);
                    this.openPoints.push(...this.createSidePoints());
                    this.sortOpenPoints();

                    if (this.packagesLoaded.length >= 2
                        && this.packagesLoaded[this.packagesLoaded.length - 1].parent_id != this.packagesLoaded[this.packagesLoaded.length - 2].parent_id)
                        this.removeDiagonalPoints(this.packagesLoaded[this.packagesLoaded.length - 2]);
                }
            }
            this.removeOpenPointForNextPriority();
        }

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

    //create the side point when some spaces cant anything be fit inside of it
    //optimise the space inside the container by creating other point to ignore
    //the spaces that cant hold boxes inside it
    createSidePoints() {
        let pack = this.packagesLoaded[this.packagesLoaded.length - 1];

        let sideOpenPoint = [];

        let sidePoint = this.openPoints.filter(point => {
            return point.y == pack.y
                && point.x < pack.x + pack.w
                && point.pointOwner != pack.id
                && point.type != "S"
                && !point.ignored;
        });

        sidePoint.sort((a, b) => {
            return a.z - b.z;
        });

        // console.log(pack, sidePoint);

        var index = null;
        if (sidePoint.length > 0) {

            if (pack.z + pack.l - sidePoint[0].z > 0) {
                let p1 = pack.openPoint.F;
                let p2 = sidePoint[0];

                let isTherePack = this.packagesLoaded.filter(p => {
                    return p.x > p1.x && p.x <= p2.x && p.z > p1.z && p.z <= p2.z && p.y == p1.y;
                });

                // console.log(isTherePack);
                if (isTherePack.length == 0) {
                    let tmpSidePoint = {
                        pointOwner: pack.id,
                        x: pack.x + pack.w,
                        y: pack.y,
                        z: sidePoint[0].z,
                        type: "S",
                        ignored: false
                    }

                    let check = this.packagesLoaded.filter(pack => {
                        if (tmpSidePoint.y > 0) {
                            return pack.y + pack.h == tmpSidePoint.y
                                && pack.x <= tmpSidePoint.x + 1
                                && pack.x + pack.w >= tmpSidePoint.x + 1
                                && pack.z <= tmpSidePoint.z + 1
                                && pack.z + pack.l >= tmpSidePoint.z + 1;
                        }
                    });

                    if (pack.y == 0) {
                        let isPointInPack = this.packagesLoaded.filter(p => {
                            return p.x <= tmpSidePoint.x
                                && p.x + p.w >= tmpSidePoint.x
                                && p.z <= tmpSidePoint.z
                                && p.z + p.l >= tmpSidePoint.z;
                        });

                        if (tmpSidePoint.z == 0 || isPointInPack.length != 0) {
                            sideOpenPoint.push(tmpSidePoint);

                            index = this.openPoints.findIndex(p => {
                                return p.x == sidePoint[0].x && p.y == pack.y && p.z == sidePoint[0].z;
                            });
                        }

                    }
                    else {
                        if (check.length > 0) {
                            sideOpenPoint.push(tmpSidePoint);

                            index = this.openPoints.findIndex(p => {
                                return p.x == sidePoint[0].x && p.y == pack.y && p.z == sidePoint[0].z;
                            });
                        }
                    }


                }
            }

            if (pack.z + pack.l - sidePoint[0].z < 0) {
                let p1 = pack.openPoint.F;
                let p2 = sidePoint[0];

                let isTherePack = this.packagesLoaded.filter(p => {
                    return p.x >= p2.x && p.x <= p1.x && p.z + 1 > p1.z && p.z + 1 <= p2.z && p.y == p1.y;
                });

                // console.log(isTherePack);
                if (isTherePack.length == 0) {
                    let tmpSidePoint = {
                        pointOwner: pack.id,
                        x: sidePoint[0].x,
                        y: pack.y,
                        z: pack.z + pack.l,
                        type: "S",
                        ignored: false
                    };

                    let check = this.packagesLoaded.filter(pack => {
                        if (tmpSidePoint.y > 0) {
                            return pack.y + pack.h == tmpSidePoint.y
                                && pack.x <= tmpSidePoint.x + 1
                                && pack.x + pack.w >= tmpSidePoint.x + 1
                                && pack.z <= tmpSidePoint.z + 1
                                && pack.z + pack.l >= tmpSidePoint.z + 1;
                        }
                    });

                    if (pack.y == 0) {
                        let isPointInPack = this.packagesLoaded.filter(p => {
                            return p.x <= tmpSidePoint.x
                                && p.x + p.w >= tmpSidePoint.x
                                && p.z <= tmpSidePoint.z
                                && p.z + p.l >= tmpSidePoint.z;
                        });

                        if (tmpSidePoint.z == 0 || isPointInPack.length != 0) {
                            sideOpenPoint.push(tmpSidePoint);

                            index = this.openPoints.findIndex(p => {
                                return p.x == pack.x && p.y == pack.y && p.z == pack.z + pack.l;
                            });
                        }
                    }

                    else {
                        if (check.length > 0) {
                            sideOpenPoint.push(tmpSidePoint);

                            index = this.openPoints.findIndex(p => {
                                return p.x == pack.x && p.y == pack.y && p.z == pack.z + pack.l;
                            });
                        }
                    }


                }
            }

            if (index != -1 && index != null) {
                this.openPoints[index].ignored = true;
            }
        }

        return sideOpenPoint;
    }
    //create the open point ???????????????????? this function need to be traited
    createOpenPoints(coords, pack) {

        let validOpenPoint = [
            {
                pointOwner: pack.id,
                x: coords.x,
                y: coords.y + pack.h,
                z: coords.z,
                type: "T",
                ignored: false
            },
        ];

        let openPoints = [
            {
                pointOwner: pack.id,
                x: coords.x,
                y: coords.y,
                z: coords.z + pack.l,
                type: "R",
                ignored: false
            },
            {
                pointOwner: pack.id,
                x: coords.x + pack.w,
                y: coords.y,
                z: coords.z,
                type: "F",
                ignored: false
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
            ...coords,
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

        this.openPoints.push(...this.createOpenPoints(coords, pack))

        //add the boxes to the list
        this.boxes.push(this.createTemperoryBox(pack, coords));
    }
}

export default Packer;