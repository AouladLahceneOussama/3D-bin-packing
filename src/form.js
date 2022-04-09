import { scale_meter_px, scene } from "./configurations.js";
import Container from "./container.js";
import Pack from "./pack.js";
import Packer from "./packer.js";
import { updateScene } from '../main.js';
import { loadPacks, loadResult } from "./result_drawer.js";

$(document).ready(function () {

    const worker = new Worker('src/worker.js', { type: "module" });

    var containerCreated = false;
    var container = JSON.parse(localStorage.getItem("container"));
    if (container !== null) {
        $("#containerWidth").val(container.w)
        $("#containerHeight").val(container.h)
        $("#containerLenght").val(container.l)
    }

    //submit the container form to create the container
    $("#containerForm").submit(function (event) {

        event.preventDefault();
        var containerDimensions = {};

        //read variables from container form
        containerDimensions.w = $("#containerWidth").val();
        containerDimensions.h = $("#containerHeight").val();
        containerDimensions.l = $("#containerLenght").val();
        containerDimensions.weight = 0;

        //remove all the truck and the packs added
        updateScene();

        //create the container
        new Container(containerDimensions.w, containerDimensions.h, containerDimensions.l, 0);
        containerCreated = true;

        var container = JSON.parse(localStorage.getItem("container"));
        if (container !== null) {
            var packDim = container.w + " , " + container.h + " , " + container.l;
            $("#containerDetails").html('<span>' + packDim + '</span>');
        }
    });

    //submit the packages form to add the packs
    $("#packForm").submit(function (event) {
        event.preventDefault();

        if (!containerCreated) {
            alert("create the container")
            return;
        }

        var packDetails = {};
        var pack;

        packDetails.label = $("#packLabel").val();
        packDetails.w = $("#packWidth").val();
        packDetails.h = $("#packHeight").val();
        packDetails.l = $("#packLenght").val();
        packDetails.q = $("#packQuantity").val();
        packDetails.stack = $("#packStackingCapacity").val();
        packDetails.priority = $("#packPriority").val();

        //rotation
        packDetails.r = ["base"];

        if ($('#rightSide').is(":checked")) {
            packDetails.r.push("right-side")
        }
        if ($('#frontSide').is(":checked")) {
            packDetails.r.push("front-side")
        }

        pack = new Pack(packDetails.label, packDetails.w, packDetails.h, packDetails.l, packDetails.q, packDetails.stack, packDetails.r, packDetails.priority)
        pack.add()

        var packDim = packDetails.w + " , " + packDetails.h + " , " + packDetails.l + " ( " + packDetails.q + " ) ";
        $("#packageDetails").append('<div class="packInfo"><div>' + packDetails.label + '</div><div class="packInfo-numbers">' + packDim + ' </div></div>');
    });

    //push the packages into the container
    $("#solve").click(function () {
        if (!containerCreated) {
            alert("create the container")
            return;
        }

        Pack.removePacksFromTheScene();
        scene.remove(scene.getObjectByName("sphere"));

        var packer = new Packer("cub");
        var packagesToLoad = packer.initialisePackagesToLoad();

        console.log("solving");
        worker.postMessage([Container.instances, packagesToLoad]);

        worker.onmessage = (msg) => {
            console.log("solved")
            loadPacks(msg.data[0], msg.data[1]);
            loadResult(Pack.allInstances, msg.data[1]);
            $("#numberBox").val(msg.data[1].length)
        }
    })

    //load the packages from the localstorage if not empty
    Pack.loadPacksFromLocalStorage();

    //click event on the update button to update a specific pack
    $("#updatePack").click(function (event) {
        event.preventDefault();

        var packDetails = {};
        packDetails.id = $("#pack_Detail_Id").val();
        packDetails.label = $("#pack_Detail_Label").val();
        packDetails.w = $("#pack_Detail_Width").val() * scale_meter_px;
        packDetails.h = $("#pack_Detail_Height").val() * scale_meter_px;
        packDetails.l = $("#pack_Detail_Lenght").val() * scale_meter_px;
        packDetails.q = $("#pack_Detail_Quantity").val();
        packDetails.stack = $("#pack_Detail_StackingCapacity").val();
        packDetails.priority = $("#pack_Detail_Priority").val();

        packDetails.r = ["base"];
        //rotation
        if ($('#pack_Detail_right-side').is(":checked")) {
            packDetails.r.push("right-side")
        }
        if ($('#pack_Detail_front-side').is(":checked")) {
            packDetails.r.push("front-side")
        }

        Pack.update(packDetails, packDetails.id);
        Pack.removeBoxesFromTheScene();
        Pack.loadPacks();

    });

    //click event on the delete button to remove a specific pack
    $("#deletePack").click(function (event) {
        event.preventDefault();

        let id = $("#pack_Detail_Id").val();
        Pack.remove(id);
        Pack.removeBoxesFromTheScene();
        Pack.loadPacks();
    });

    // csv section
    // load data from csv file
    $("#actual-btn").change(function (e) {
        var ext = $("#actual-btn").val().split(".").pop().toLowerCase();
        if ($.inArray(ext, ["csv"]) == -1) {
            alert('Upload CSV');
            return false;
        }
        if (e.target.files != undefined) {
            $("#file-chosen").html(e.target.files[0].name)
            var reader = new FileReader();
            reader.onload = function (e) {
                var lines = e.target.result.split('\r\n');
                loadDataFromCsv(lines);
            };
            reader.readAsText(e.target.files.item(0));
        }
        return false;
    });

    //load the data from the csv file into the container and the packages
    function loadDataFromCsv(data) {
        for (let i = 1; i < data.length; i++) {
            if (data[i].length > 0) {
                let line = data[i].split(",");

                if (line[0] == "container") {
                    new Container(line[1], line[2], line[3], line[4]);
                    containerCreated = true;
                }
                else {
                    let rotations = [];
                    for (let j = 6; j <= 8; j++) {
                        if (line[j] != undefined)
                            rotations.push(line[j].replace("\"", ''));
                    }

                    var pack = new Pack(line[0], line[1], line[2], line[3], line[4], line[5], [...rotations]);
                    pack.add();

                    var packDim = line[1] + " , " + line[2] + " , " + line[3] + " ( " + line[4] + " ) ";
                    $("#packageDetails").append('<div class="packInfo"><div>' + line[0] + '</div><div class="packInfo-numbers">' + packDim + ' </div></div>');
                }
            }
        }
    }

    $("#numberBox").on("input", function (e) {

        if (e.target.value != null && scene.getObjectByName("All_Packs")) {
            let boxes = scene.getObjectByName("All_Packs").children;
            e.target.max = boxes.length

            //show the package
            for (let i = e.target.value - 1; i >= 0; i--) {
                let grp = boxes[i].children;
                let box = grp[0];
                let border = grp[1];

                box.visible = true;
                border.visible = true;
            }

            //hide the package
            for (let i = boxes.length - 1; i >= e.target.value; i--) {
                let grp = boxes[i].children;
                let box = grp[0];
                let border = grp[1];

                box.visible = false;
                border.visible = false;
            }
        }
    });

    // load data from api
    $("#loadApi").click(async function () {
        let url = $("#apiUrl").val();
        await fetch(url)
            .then(res => {
                if (res.ok)
                    return res.json()
            })
            .then(data => {
                console.log(data)
                loadDataFromAPI(data)
            })
            .catch(err => console.log(err));
    });

    //load the data from the csv file into the container and the packages
    function loadDataFromAPI(data) {
        console.log(data)
        let container = data.container;
        let packages = data.colis;

        new Container(container.w, container.h, container.l, container.capacity);
        containerCreated = true;

        packages.map(pack => {
            var pack = new Pack(pack.label, pack.w, pack.h, pack.l, pack.q, pack.stackingCapacity, pack.rotations, pack.priority);
            pack.add();

            var packDim = pack.w + " , " + pack.h + " , " + pack.l + " ( " + pack.q + " ) ";
            $("#packageDetails").append('<div class="packInfo"><div>' + pack.label + '</div><div class="packInfo-numbers">' + packDim + ' </div></div>');
        });
    }

    //fill the form with random numbers to make the things fast and easy
    $("#random").click(function () {
        $("#packLabel").val("colis " + Math.floor((Math.random() * 100)));
        $("#packWidth").val(Math.floor((Math.random() * (2 - 0.1 + 1) + 0.1) * 100) / 100);
        $("#packHeight").val(Math.floor((Math.random() * (2 - 0.1 + 1) + 0.1) * 100) / 100);
        $("#packLenght").val(Math.floor((Math.random() * (2 - 0.1 + 1) + 0.1) * 100) / 100);
        $("#packQuantity").val(Math.floor((Math.random() * 20) + 1));
    });
});
