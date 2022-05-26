import { scale_meter_px } from "../configurations";

class DragSurface {
    static draggerStat = false;
    static dragSurface = {};

    constructor(width, height, lenght) {
        this.width = parseInt(width * scale_meter_px);
        this.height = parseInt(height * scale_meter_px);
        this.lenght = parseInt(lenght * scale_meter_px);

        DragSurface.dragSurface = this.getDragSurface;
    }

    get getDragSurface() {
        return {
            width: this.width,
            height: this.height,
            lenght: this.lenght
        }
    }

    static switch(stat) {
        DragSurface.draggerStat = stat
    }
}

export default DragSurface;