import Packer from "./packer.js";

onmessage = function (msg) {
    const start = this.performance.now();
    var packer = new Packer("cub");
    let solver = packer.solve(msg.data[0], msg.data[1][0], msg.data[1][1]);
    const end = this.performance.now();

    let loadingResult = {
        packer: solver,
        executionTime: (end - start) * Math.pow(10, -3)
    };

    console.log((end - start), (end - start) * Math.pow(10, -3))
    postMessage(loadingResult);
};