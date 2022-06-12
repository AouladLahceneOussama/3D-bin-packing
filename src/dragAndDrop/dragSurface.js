import { scale_meter_px } from "../configurations";
import Logger from "../logger";

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
        if (!stat)
            new Logger("Manual mode is deactivated", 0.01).dispatchMessage();
        else
            new Logger("Manual mode is activated (start dragging...)", 0.01).dispatchMessage();

        DragSurface.draggerStat = stat
    }
}

export default DragSurface;