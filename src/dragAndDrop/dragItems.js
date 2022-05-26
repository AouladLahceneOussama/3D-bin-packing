import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { scene } from "../configurations";
import { camera, renderer, controls, transformControl } from '../../main.js';
import Pack from "../pack";
import Dragger from './dragger';
import DragSurface from './dragSurface';

class DragItem {

    static allDraggableItems = [];

    constructor(object, parent_id) {
        this.object = object;
        this.parent_id = parent_id;
        this.packDetails = Pack.allInstances.find((pack) => pack.id == parent_id);
        this.q = this.packDetails.q;
        this.stat = {
            dimensions: {
                w: this.packDetails.w,
                h: this.packDetails.h,
                l: this.packDetails.l
            },
            position: this.object.position,
        }

        DragItem.allDraggableItems.push(this.getItem);
    }

    get getItem() {
        return {
            object: this.object,
            parent_id: this.parent_id,
            packDetails: this.packDetails,
            q: this.q,
            stat: this.stat
        }
    }

    //find the best position where to insert the box in the container
    bestPosition(packDetails) {
        let dragSurface = DragSurface.dragSurface;
        if (Dragger.openPoints.length == 0) return { x: 0, y: 0, z: 0 };
        for (let i = 0; i < Dragger.openPoints.length; i++) {
            let p = Dragger.openPoints[i];

            if (
                p.z + packDetails.l <= dragSurface.lenght
                && p.y + packDetails.h <= dragSurface.height
                && p.x + packDetails.w <= dragSurface.width
            )
                return p
        }

    }

    //crate the dragged box when cliking a new box
    //check if the quantity - nbOfDraggedElements > 0 ?????
    //if true add the item if not alert
    createDragItem(transformControl) {
        let check = this.checkQuantityItem(this.parent_id, this.q);

        if (check != -1) {
            let packDetails = Pack.allInstances.filter(p => {
                return p.id == this.parent_id;
            })[0];

            //create the group of box and border
            let boxAndBorder = new THREE.Group();
            boxAndBorder.name = "Box_Border_" + this.parent_id;
            boxAndBorder.userData.parent_id = this.parent_id;
            boxAndBorder.userData.id = this.parent_id + "-" + check;

            //crete the box
            let normalMateriel = new THREE.MeshLambertMaterial({ color: packDetails.color * 0xFF0FFF, side: THREE.DoubleSide })
            let boxGeometry = new THREE.BoxGeometry(packDetails.w, packDetails.h, packDetails.l);
            let box = new THREE.Mesh(boxGeometry, normalMateriel);
            box.userData.parent_id = this.parent_id;
            box.userData.id = this.parent_id + "-" + check;

            //create the outlines of the boxes
            let edges = new THREE.EdgesGeometry(boxGeometry);
            let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
            line.name = "Line_" + this.parent_id;
            line.userData.id = this.parent_id;
            line.userData.name = "Line";
            // line.translateX(packDetails.w / 2);
            // line.translateY(packDetails.h / 2);
            // line.translateZ(packDetails.l / 2);

            //position the group
            let pos = this.bestPosition(packDetails)
            this.stat.position = pos;

            boxAndBorder.position.set(pos.x, pos.y, pos.z);
            boxGeometry.translate(packDetails.w / 2, packDetails.h / 2, packDetails.l / 2);
            edges.translate(packDetails.w / 2, packDetails.h / 2, packDetails.l / 2);

            boxAndBorder.add(box);
            boxAndBorder.add(line);

            scene.add(boxAndBorder);
            transformControl.attach(boxAndBorder);

            return box;
        }

        return false;
    }

    //check if still the quantity - draggedItem > 0
    checkQuantityItem(parent_id, quantity) {
        let items = Dragger.loadedPack.filter(item => {
            return item.box.userData.parent_id == parent_id
        });

        if (Dragger.loadedPack.length == 0) return 0;
        return quantity - items.length > 0 ? items.length : -1;
    }
}

export default DragItem;