import { scale_meter_px, scene } from "./configurations.js";
import Container from "./container.js";
import Pack from "./pack.js";
import Packer from "./packer.js";
import { updateScene } from '../main.js';
import { loadPacks, loadResult } from "./result_drawer.js";
import Logger from "./logger.js";
import Route from "./routes.js";
import DragSurface from "./dragAndDrop/dragSurface.js";
import { deleteAllPacks } from "./dragAndDrop/dragDropMenu.js";

$(document).ready(function () {

    const worker = new Worker('src/worker.js', { type: "module" });

    var containerCreated = false;
    var container = JSON.parse(localStorage.getItem("container"));
    if (container !== null) {
        $("#containerWidth").val(container.w)
        $("#containerHeight").val(container.h)
        $("#containerLenght").val(container.l)
        $("#containerUnloading").val(container.unloading)
    }

    // create the routes from localstorage
    //check if at least a route is created
    var routeCreated = false;

    // from  = api || from = localstorage
    function loadRoutes(routes = [], loadFrom) {
        let routesLocalStorage = JSON.parse(localStorage.getItem("routes"));
        let length;

        if (loadFrom == "api" || loadFrom == "csv") {
            length = routes.length
            routes = routes
        }
        else {
            if (routesLocalStorage == null) return;

            length = routesLocalStorage.routeNumber
            routes = routesLocalStorage.routes
        }

        if (length > 0) {
            $("#routesNumber").val(length);
            for (let i = 0; i < length - 1; i++)
                addRouteInputs(i + 1);

            $('.routeFrom').each(function (i) { $(this).val(routes[i].from); });
            $('.routeTo').each(function (i) { $(this).val(routes[i].to); });
            $('.routeType').each(function (i) { $(this).val(routes[i].type); });
        }

    }


    loadRoutes([], "localStorage");

    //routes number incerement and decrement
    $("#routeIncrement").click(function () {
        let currentVal = parseInt($("#routesNumber").val());
        $("#routesNumber").val(currentVal + 1);
        addRouteInputs(currentVal + 1);
    });

    $("#routeDecrement").click(function () {
        let currentVal = parseInt($("#routesNumber").val());
        if (currentVal > 1) {
            $("#routesNumber").val(currentVal - 1);
            $('#routeInputs .inputs').last().remove();
        }
    });

    //add/remove inputs from list of routes
    function addRouteInputs() {
        $("#routeInputs").append(`
            <div class="inputs">
                <div>
                    <p class="inputLabel">From</p>
                    <input type="text" class="input routeFrom" required>
                </div>
                <div>
                    <p class="inputLabel">To</p>
                    <input type="text" class="input routeTo" required>
                </div>
                <div>
                    <p class="inputLabel">Type</p>
                    <select class="input routeType" required>
                        <option value="dechargement">D</option>
                        <option value="chargement">C</option>
                        <option value="dechargement">D et C</option>
                    </select>
                </div>
            </div>`)
    }

    //submit the routes form to add the route
    $("#routesForm").submit(function (event) {
        event.preventDefault();

        var routeDetails = {};
        var route;

        routeDetails.routesNumber = $("#routesNumber").val();
        routeDetails.from = $('.routeFrom').map(function () { return $(this).val(); }).get();
        routeDetails.to = $('.routeTo').map(function () { return $(this).val(); }).get();
        routeDetails.type = $('.routeType').map(function () { return $(this).val(); }).get();

        routeDetails.routes = [];

        for (let i = 0; i < routeDetails.routesNumber; i++) {
            let r = {
                id: i + 1,
                from: routeDetails.from[i],
                to: routeDetails.to[i],
                type: routeDetails.type[i]
            }
            routeDetails.routes.push(r);
        }

        route = new Route(routeDetails.routesNumber, routeDetails.routes)
        route.addOrUpdate();

        routeCreated = true
    });

    //submit the container form to create the container
    $("#containerForm").submit(function (event) {

        event.preventDefault();
        var containerDimensions = {};

        //read variables from container form
        containerDimensions.w = $("#containerWidth").val();
        containerDimensions.h = $("#containerHeight").val();
        containerDimensions.l = $("#containerLenght").val();
        containerDimensions.capacity = 0;

        //remove all the truck and the packs added
        updateScene("all");

        //create the container
        new Container(containerDimensions.w, containerDimensions.h, containerDimensions.l, containerDimensions.capacity);
        new DragSurface(containerDimensions.w, containerDimensions.h, containerDimensions.l);
        containerCreated = true;
    });

    //submit the packages form to add the packs
    $("#packForm").submit(function (event) {
        event.preventDefault();

        if (!containerCreated) {
            showErrorMessage("please create the container")
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

        pack = new Pack(packDetails.label, packDetails.w, packDetails.h, packDetails.l, packDetails.q, packDetails.stack, packDetails.r, packDetails.priority, [])
        pack.add()

        var packDim = packDetails.w + " , " + packDetails.h + " , " + packDetails.l + " ( " + packDetails.q + " ) ";
        $("#packageDetails").append('<div class="packInfo"><div>' + packDetails.label + '</div><div class="packInfo-numbers">' + packDim + ' </div></div>');
    });

    //push the packages into the container
    $("#solve").click(function () {
        if (!routeCreated) {
            showErrorMessage("please add a route")
            return;
        }

        if (!containerCreated) {
            showErrorMessage("please create the container")
            return;
        }

        $(".menu").toggleClass("openMenu closeMenu");
        $(".menuIcon").toggleClass("openMenuIcon closeMenu");
        deleteAllPacks();
        Pack.removePacksFromTheScene();
        scene.remove(scene.getObjectByName("sphere"));

        var packer = new Packer("cub");
        var packagesToLoad = packer.initialisePackagesToLoad();

        new Logger("Loading", 0.01).dispatchMessage();

        worker.postMessage([Container.instances, packagesToLoad]);
        $(".packer-loader").toggleClass("packer-loader--hide packer-loader--show")
        worker.onmessage = (msg) => {
            new Logger("Loaded (Algorithme)", msg.data.executionTime).dispatchMessage();
            $(".packer-loader").toggleClass("packer-loader--hide packer-loader--show")

            if($("#loadBoxes").is(":checked"))
                loadPacks(msg.data.packer[0], msg.data.packer[1]);

            loadResult(Pack.allInstances, msg.data.packer[1]);
            $("#numberBox").val(msg.data.packer[1].length);

            new Logger("Loaded (3D models)", msg.data.executionTime).dispatchMessage();

        }
    })

    function showErrorMessage(msg) {
        $(".error-container").toggleClass("error-container--hidden")
        $("#errorMsg").html(msg)

        setTimeout(() => {
            $(".error-container").toggleClass("error-container--hidden")
        }, 1500)
    }

    //change to the manuelle mode
    let stat = false;
    $("#switchManuelleMode").click(function () {
        if (!containerCreated) {
            showErrorMessage("please create the container")
            return;
        }

        // if(!$("#switchManuelleMode").hasClass("disabled")){
        updateScene("loadedPacks");
        $(".menu").toggleClass("openMenu closeMenu");
        $(".menuIcon").toggleClass("openMenuIcon closeMenu");
        $(".dragDrop-container").toggleClass("hidden");


        Pack.reloadShowPacker();

        stat = !stat;
        $("#solve").toggleClass("disabled")
        //change the mode of app from auto fill to manuelle fill
        DragSurface.switch(stat)

    });

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

        //add/update the list of of multiple priorities
        let quantities = getMultipleInputValues(".sub-q");
        let priorities = getMultipleInputValues(".sub-prio");
        let subQuantities = [];

        for (let i = 0; i < quantities.length; i++) {
            let q = quantities[i];
            let p = priorities[i];

            subQuantities.push({
                n: q,
                p: p
            });
        }

        packDetails.subQuantities = subQuantities;

        Pack.update(packDetails, packDetails.id);
        Pack.removeBoxesFromTheScene();
        Pack.loadPacks();

    });

    //get the array of values inserted by the user
    function getMultipleInputValues(className) {
        let inputs = $(className);
        let values = [];

        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i];
            values.push(parseInt(input.value));
        }

        return values;
    }

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
            showErrorMessage("Upload CSV file")
            return false;
        }
        if (e.target.files != undefined) {
            $("#file-chosen").html(e.target.files[0].name)
            var reader = new FileReader();
            reader.onload = function (e) {
                var lines = e.target.result.split('\r\n');
                loadDataFromCsv2(lines);
            };
            reader.readAsText(e.target.files.item(0));
        }
        return false;
    });

    //load the data from the csv file into the container and the packages
    function loadDataFromCsv(data) {
        for (let i = 1; i < data.length; i++) {
            if (data[i].length > 0) {
                console.log(data[i])
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

    function loadDataFromCsv2(data) {
        let arrayOfRoutes = [];
        for (let i = 6; i < data.length; i++) {
            if (data[i].length > 0) {
                console.log(data[i])
                let line = data[i].split(",");

                if (line[0] == "container") {
                    new Container(line[1], line[2], line[3], line[4]);
                    containerCreated = true;
                }
                if (line[0] == "colis") {
                    let rotations = [];
                    for (let j = 6; j <= 8; j++) {
                        if (line[j] != undefined)
                            rotations.push(line[j].replace("\"", ''));
                    }

                    new Pack(line[1], line[2], line[3], line[4], line[5], line[6], [...rotations]).add();
                }
                if (line[0] == "route") {
                    arrayOfRoutes.push({
                        id: line[1],
                        from: line[2],
                        to: line[3],
                        type: line[4]
                    })
                    routeCreated = true
                }
            }
        }

        new Route(arrayOfRoutes.length, arrayOfRoutes).addOrUpdate();
        loadRoutes(arrayOfRoutes, "csv");
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
        let routes = data.routes;

        new Route(routes.length, routes).addOrUpdate();
        loadRoutes(routes, "api");
        routeCreated = true

        new Container(container.w, container.h, container.l, container.capacity, container.unloading);
        containerCreated = true;

        packages.map(pack => {
            new Pack(pack.label, pack.w, pack.h, pack.l, pack.q, pack.stackingCapacity, pack.rotations, pack.priority).add();
        });


        let logger = new Logger("Load Data", 0.01);
        logger.dispatchMessage();
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
