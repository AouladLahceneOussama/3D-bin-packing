import Packer from "./packer.js";

onmessage = function (msg) {
    const start = this.performance.now();

    var packer = new Packer("cub");
    postMessage(packer.solve(msg.data[0], msg.data[1][0], msg.data[1][1]));
    const end = this.performance.now();
    console.log(`Execution time ${(end - start) * Math.pow(10, -3)}s`)
};