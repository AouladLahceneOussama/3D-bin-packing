import * as THREE from "../../threeJsLib/three.js.r122"
import { scene } from "../configurations";
import Pack from "../pack";
import Dragger from './dragger';
import DragDropLogger from './dragDropLogger';
import { currentRotationUpdate } from './dragDropMenu';

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

        console.log(this.object.position)
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
    bestPosition() {
        return Dragger.specificOpenPoints[0];
    }

    //crate the dragged box when cliking a new box
    //check if the quantity - nbOfDraggedElements > 0 ?????
    //if true add the item if not alert
    createDragItem(transformControl) {
        let check = this.checkQuantityItem(this.parent_id, this.q);
        console.log(check);
        new DragDropLogger(this.packDetails, check == -1 ? this.q : check, check == -1 ? "All loaded" : Dragger.specificOpenPoints.length > 0 ? "On loading" : "No left space in the container").dispatchMessage()

        if (check != -1 && Dragger.specificOpenPoints.length > 0) {
            //create the group of box and border
            let boxAndBorder = new THREE.Group();
            boxAndBorder.name = "Box_Border_" + this.parent_id + "-" + check;
            boxAndBorder.userData.parent_id = this.parent_id;
            boxAndBorder.userData.id = this.parent_id + "-" + check;
            boxAndBorder.userData.name = "Box_border";
            console.log(Dragger.specificOpenPoints)

            let dimensions = Dragger.specificOpenPoints[0].rotations[0];
            //crete the box
            let normalMateriel = new THREE.MeshLambertMaterial({ color: this.packDetails.color * 0xFF0FFF, side: THREE.DoubleSide })
            let boxGeometry = new THREE.BoxGeometry(dimensions.w, dimensions.h, dimensions.l);
            let box = new THREE.Mesh(boxGeometry, normalMateriel);
            box.userData.parent_id = this.parent_id;
            box.userData.id = this.parent_id + "-" + check;

            //create the outlines of the boxes
            let edges = new THREE.EdgesGeometry(boxGeometry);
            let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
            line.name = "Line_" + this.parent_id;
            line.userData.id = this.parent_id;
            line.userData.name = "Line";

            //position the group
            let pos = this.bestPosition()
            this.stat.position = pos;

            
            boxAndBorder.position.set(pos.x, pos.y, pos.z);
            boxGeometry.translate(dimensions.w / 2, dimensions.h / 2, dimensions.l / 2);
            edges.translate(dimensions.w / 2, dimensions.h / 2, dimensions.l / 2);

            boxAndBorder.add(box);
            boxAndBorder.add(line);

            scene.add(boxAndBorder);
            transformControl.attach(boxAndBorder);

            //change the color of the current rotation in the menu
            currentRotationUpdate(dimensions.type[0], dimensions.type[1]);

            return box;
        }

        return false;
    }

    //check if still the quantity - draggedItem > 0
    checkQuantityItem(parent_id, quantity) {
        console.log(Dragger.loadedPack)
        let items = Dragger.loadedPack.filter(item => {
            return item.box.userData.parent_id == parent_id
        });

        if (Dragger.loadedPack.length == 0) return 0;
        return quantity - items.length > 0 ? items.length : -1;
    }
}

export default DragItem;