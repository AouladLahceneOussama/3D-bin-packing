import { scale_meter_px, scene } from "./configurations.js";
import Container from "./container.js";
import Pack from "./pack.js";
import Packer from "./packer.js";
import { loadResult, loadPacksInstanced, boxInstances, breakPoints, generatePDF } from "./result_drawer.js";
import Logger from "./logger.js";
import Route from "./routes.js";
import DragSurface from "./dragAndDrop/dragSurface.js";
import { deleteAllPacks } from "./dragAndDrop/dragDropMenu.js";

var routeCreated = false;
var containerCreated = false;
var lastNum;
var index = 0;

//removes the container and the loadedBoxes
function updateScene(type) {
    if (type == "loadedPacks")
        scene.remove(scene.getObjectByName("All_Packs"))

    if (type == "all") {
        scene.remove(scene.getObjectByName("All_Packs"))
        scene.remove(scene.getObjectByName("Full_Container"))
    }

    $("#result").empty();

    $("#result").append(`
    <div class="empty-result">
      Not solved yet
    </div>`)

    $("#files").empty();

    $("#files").append(`
    <div class="empty-result">
      Not solved yet
    </div>`)
}

// take the api url and return the data
async function loadApi(url = "") {
    if (url != "") {
        await fetch(url)
            .then(res => {
                if (res.ok)
                    return res.json()
            })
            .then(data => {
                loadDataFromAPI(data)
            })
            .catch(err => console.log(err));
    }

}

//load the data from the csv file into the container and the packages
function loadDataFromAPI(data) {
    let container = data.container;
    let packages = data.colis;
    let routes = data.routes;

    new Route(routes.length, routes).addOrUpdate();
    console.log(routes.length, routes)
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

//read the csv file
//check if the extention if .csv
function readCsv(e, ext) {
    if ($.inArray(ext, ["csv"]) == -1) {
        showErrorMessage("Please upload a CSV file")
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
}

//load the data from the csv file into the container and the packages
function loadDataFromCsv(data) {
    let arrayOfRoutes = [];
    for (let i = 5; i < data.length; i++) {
        if (data[i].length > 0) {
            let line = data[i].split(",");

            if (line[0] == "container") {
                new Container(line[1], line[2], line[3], line[4]);
                containerCreated = true;
            }
            if (line[0] == "colis") {
                let rotations = [];
                for (let j = 8; j <= 10; j++) {
                    console.log(line[j])
                    if (line[j] != undefined)
                        rotations.push(line[j].replace("\"", ''));
                }

                new Pack(line[1], line[2], line[3], line[4], line[5], line[6], [...rotations], line[7]).add();
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

// show the error message in the application
function showErrorMessage(msg) {
    $(".error-container").toggleClass("error-container--hidden")
    $("#errorMsg").html(msg)

    setTimeout(() => {
        $(".error-container").toggleClass("error-container--hidden")
    }, 1500)
}

$(document).ready(function () {
    const worker = new Worker('src/worker.js', { type: "module" });

    var container = JSON.parse(localStorage.getItem("container"));
    if (container !== null) {
        $("#containerWidth").val(container.w)
        $("#containerHeight").val(container.h)
        $("#containerLenght").val(container.l)
        $("#containerUnloading").val(container.unloading)
    }

    // create the routes from localstorage
    //check if at least a route is created
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

        // var packDim = packDetails.w + " , " + packDetails.h + " , " + packDetails.l + " ( " + packDetails.q + " ) ";
        // $("#packageDetails").append('<div class="packInfo"><div>' + packDetails.label + '</div><div class="packInfo-numbers">' + packDim + ' </div></div>');
    });

    //push the packages into the container
    $("#solve").click(function () {
        if (!routeCreated) {
            showErrorMessage("Please add a route")
            return;
        }

        if (!containerCreated) {
            showErrorMessage("Please create the container")
            return;
        }

        if (Pack.allInstances.length == 0) {
            showErrorMessage("Please add some packages")
            return;
        }

        $(".menu").toggleClass("openMenu closeMenu");
        $(".menuIcon").toggleClass("openMenuIcon closeMenu");
        deleteAllPacks();
        Pack.removePacksFromTheScene();
        scene.remove(scene.getObjectByName("sphere"));

        var packer = new Packer("cub");
        var packagesToLoad = packer.initialisePackagesToLoad();
        console.log(packagesToLoad)
        new Logger("Loading", 0.01).dispatchMessage();

        worker.postMessage([Container.instances, packagesToLoad]);
        $(".packer-loader").toggleClass("packer-loader--hide packer-loader--show")

        worker.onmessage = (msg) => {

            new Logger("Loaded (Algorithme)", msg.data.executionTime).dispatchMessage();
            $(".packer-loader").toggleClass("packer-loader--hide packer-loader--show")
            loadResult(Pack.allInstances, msg.data.packer[1]);


            // if ($("#loadBoxes").is(":checked")) {
                loadPacksInstanced(msg.data.packer[0], msg.data.packer[1])
                // loadPacks(msg.data.packer[0], msg.data.packer[1]);
                new Logger("Loaded (3D models)", msg.data.executionTime).dispatchMessage();
            // }

            $("#numberBox").attr("max", msg.data.packer[1].length);
            $("#numberBox").val(msg.data.packer[1].length);

            console.log(breakPoints)
            index = boxInstances.length - 1
            lastNum = breakPoints.length == 0 ? boxInstances[index - 1].count : breakPoints.reduce((partialSum, a) => partialSum + a.count, 0) + 1;

            $(".scene-player").removeClass("hidden")
        }
    })

    //change to the manuelle mode
    let stat = false;
    $("#switchManuelleMode").click(function () {
        if (!containerCreated) {
            showErrorMessage("Please create the container")
            return;
        }

        if (Pack.allInstances.length == 0) {
            showErrorMessage("Please add some packages")
            return;
        }

        updateScene("loadedPacks");
        $(".menu").toggleClass("openMenu closeMenu");
        $(".menuIcon").toggleClass("openMenuIcon closeMenu");
        $(".dragDrop-container").toggleClass("hidden");
        $(".scene-player").addClass("hidden")

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
    $("#actual-btn").change((e) => readCsv(e, $("#actual-btn").val().split(".").pop().toLowerCase()));


    $("#numberBox").on("input", function (e) {

        if (e.target.value != null && boxInstances.length > 0) {
            let boxes = boxInstances[index - 1]
            let linesGeometry = boxInstances[index]

            if (lastNum < e.target.value) {
                console.log("increasing");

                boxes.count = ++boxes.count
                linesGeometry.instanceCount = boxes.count

                if (breakPoints.includes(parseInt(e.target.value))) index += 2;
            }
            else {
                console.log("decreasing");
                boxes.count = --boxes.count
                linesGeometry.instanceCount = boxes.count

                if (breakPoints.includes(parseInt(e.target.value))) index -= 2;
            }

            lastNum = e.target.value;
        }
    });

    // load data from api
    $("#loadApi").click(() => loadApi($("#apiUrl").val()));

    //fill the form with random numbers to make the things fast and easy
    $("#random").click(function () {
        $("#packLabel").val("colis " + Math.floor((Math.random() * 100)));
        $("#packWidth").val(Math.floor((Math.random() * (2 - 0.1 + 1) + 0.1) * 100) / 100);
        $("#packHeight").val(Math.floor((Math.random() * (2 - 0.1 + 1) + 0.1) * 100) / 100);
        $("#packLenght").val(Math.floor((Math.random() * (2 - 0.1 + 1) + 0.1) * 100) / 100);
        $("#packQuantity").val(Math.floor((Math.random() * 20) + 1));
    });
});

function playScene(value) {

    // console.log(value)
    if (value != null && boxInstances.length > 0) {
        let boxes = boxInstances[index - 1]
        let linesGeometry = boxInstances[index]

        console.log(lastNum, value)
        if (lastNum < value) {
            console.log("increasing");

            boxes.count = ++boxes.count
            linesGeometry.instanceCount = boxes.count

            if (breakPoints.includes(parseInt(value))) index += 2;
        }
        else {
            console.log("decreasing");
            boxes.count = --boxes.count
            linesGeometry.instanceCount = boxes.count

            console.log(boxes.count)
            if (breakPoints.includes(parseInt(value))) index -= 2;
        }

        lastNum = value;
    }
}

var speed = 200;
var myInterval;
var direction = "backward";

function play() {

    let numberBox = $("#numberBox");
    let numberBoxValue = parseInt(numberBox.val());
    let numberBoxMax = parseInt(numberBox.attr("max"));

    // console.log(numberBoxValue, numberBoxMax)
    myInterval = setInterval(() => {

        // console.log("hello")
        if (direction == "backward" && numberBoxValue >= 1) {
            $(`#play-forward`).removeClass("disabled")
            numberBox.val(--numberBoxValue)
            playScene(numberBoxValue)
        }

        if (direction == "forward" && numberBoxValue < numberBoxMax) {
            $(`#play-backward`).removeClass("disabled")
            numberBox.val(++numberBoxValue)
            playScene(numberBoxValue)
        }

        if (direction == "backward" && numberBoxValue < 1) {
            $("#play-pause").attr("role", "pause")
            $("#play-pause").toggleClass("fa-circle-play fa-circle-pause")

            $(`#play-${direction}`).toggleClass("disabled", true)
            $(`#play-${direction}`).toggleClass("scene-player--active")

            direction = "forward"
            numberBox.val(0)
            lastNum = -1
            $(`#play-${direction}`).toggleClass("scene-player--active", true)

            pause()
        }

        if (direction == "forward" && numberBoxValue >= numberBoxMax) {
            $("#play-pause").attr("role", "pause")
            $("#play-pause").toggleClass("fa-circle-play fa-circle-pause")

            $(`#play-${direction}`).toggleClass("disabled", true)
            $(`#play-${direction}`).toggleClass("scene-player--active")

            direction = "backward"
            $(`#play-${direction}`).toggleClass("scene-player--active", true)
            pause()
        }

    }, speed);
}

function pause() {
    clearInterval(myInterval)
}

function changeSceneDirection(dir) {
    $(`#play-${dir}`).toggleClass("scene-player--active", true)
    $(`#play-${direction}`).toggleClass("scene-player--active", false)

    direction = dir
}

$("#increase-speed").click(function () {
    console.log(speed)
    if (speed <= 500)
        speed += 50
})

$("#decrease-speed").click(function () {
    console.log(speed)

    if (speed >= 1)
        speed -= 50
})

$("#play-backward").click(function () {
    changeSceneDirection("backward")
})

$("#play-forward").click(function () {
    changeSceneDirection("forward")
})

//play with the scene using the controlls
//like video controlls
$("#play-pause").on("click", function () {
    $(this).toggleClass("fa-circle-play fa-circle-pause")
    let role = $(this).attr("role");

    if (role == "play") {
        $(this).attr("role", "pause")
        role = "pause"
    }
    else {
        $(this).attr("role", "play")
        role = "play"
    }

    if (role == "play") play();
    else pause();
})

//generate the pdf file
$(document).on('click', '#exportPdf', function () {
    generatePDF()
})

// $("#exportPdf").on('click', 'b', function () {
//     console.log("generate the pdf")
//     generatePDF();
// })

//this export is used for testing 
export { loadApi, readCsv }

