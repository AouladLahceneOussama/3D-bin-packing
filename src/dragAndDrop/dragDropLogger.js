let IdLogger = 0;

class DragDropLogger {

    static allMessages = [];

    constructor(pack, loaded, stat) {
        this.id = IdLogger++;
        this.pack = pack;
        this.loaded = loaded;
        this.stat = stat;

        //keep the track of all the logs
        DragDropLogger.allMessages.push(this.getMessageDetail);
    }

    get getMessageDetail() {
        return {
            id: this.id,
            pack: this.pack,
            loaded: this.loaded,
            stat: this.stat
        }
    }

    //add the message to the logger (UI)
    dispatchMessage() {
        // remove the old data
        $(".logger-content div").remove();

        // insert the new data
        let packDetail = `
            <div class="logger-detail">
            <span class="pack-title">Label</span>
            <span>${this.pack.label}</span>
            </div>
            <div class="logger-detail">
            <span class="pack-title">Quantity</span>
            <span>${this.pack.q}</span>
            </div>
            <div class="logger-detail">
            <span class="pack-title">Loaded</span>
            <span>${this.loaded}</span>
            </div>
            <div class="logger-detail">
            <span class="pack-title">Stat</span>
            <span>${this.stat}</span>
            </div>
        `

        // append the new data
        $(".logger-content").append(packDetail);
    }
}

export default DragDropLogger;