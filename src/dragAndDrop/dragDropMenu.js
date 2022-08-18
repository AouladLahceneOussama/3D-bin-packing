import { scene } from "../configurations";
import Dragger from "./dragger";

localStorage.setItem("steps", JSON.stringify([{
    stepNumber: 0,
    loadedPacks: [],
    openPoint: [{ x: 0, y: 0, z: 0 }]
}]));

// What to do : take two parameters add/remove
// add = true / remove = false
function initializeClasses(className, whatToDo) {
    let InitialRotations = [
        {
            rotation: "base",
            angles: [0, Math.PI / 2]
        },
        {
            rotation: "right-side",
            angles: [0, Math.PI / 2]
        },
        {
            rotation: "front-side",
            angles: [0, Math.PI / 2]
        }];

    InitialRotations.forEach(r => {
        $(`#d-${r.rotation} .fa-cube`).toggleClass(className, whatToDo);
        $(`#d-${r.rotation} .fa-arrow-rotate-left`).toggleClass(className, whatToDo);
        $(`#d-${r.rotation} .fa-arrow-rotate-right`).toggleClass(className, whatToDo);
    });
}

function changeOpacityUnvailableRotations(rotations) {
    // console.log(rotations, rotations.length);
    initializeClasses("d-less-opacity", true);

    let currentR = rotations.reduce((groupedRotation, r) => {
        let type = r.type[0];
        let angle = r.type[1] == 0 ? "fa-arrow-rotate-left" : "fa-arrow-rotate-right"

        if (groupedRotation[type] == null) groupedRotation[type] = [angle];
        else groupedRotation[type].push(angle)

        return groupedRotation;
    }, {});

    // console.log(currentR)
    for (const angles in currentR) {
        // console.log(`${angles}: ${currentR[angles]}`);
        $(`#d-${angles} .fa-cube`).removeClass("d-less-opacity");
        currentR[angles].forEach(a => {
            $(`#d-${angles} .${a}`).removeClass("d-less-opacity");
        })
    }
}

function currentRotationUpdate(currentRotation, currentAngle) {
    initializeClasses("d-current-rotate ", false);

    let newAngle = currentAngle == 0 ? "fa-arrow-rotate-left" : "fa-arrow-rotate-right";
    $(`#d-${currentRotation} .fa-cube`).addClass("d-current-rotate");
    $(`#d-${currentRotation} .${newAngle}`).addClass("d-current-rotate");
}

function deleteAllPacks() {
    let itemsToDelete = [];
    scene.traverse((obj) => {
        if (obj.userData.name === 'Box_border')
            itemsToDelete.push(obj);
    });

    // make all the variable the the first state
    Dragger.currentStep = 0
    Dragger.loadedPack = [];
    Dragger.openPoints = [{ x: 0, y: 0, z: 0 }];
    itemsToDelete.forEach(item => scene.remove(item));
}

$("#delete-all").click((() => deleteAllPacks()));

$("#dragDrop-backward").click(function () {
    let steps = JSON.parse(localStorage.getItem("steps"));

    console.log("backward", Dragger.currentStep);
    if (steps.length > 0 && Dragger.currentStep > 0) {
        $("#dragDrop-backward").removeClass("disabled");

        let currentDataStep = steps.find(s => s.stepNumber == Dragger.currentStep)
        let beforeDataStep = steps.find(s => s.stepNumber == Dragger.currentStep - 1)

        console.log(currentDataStep, beforeDataStep)
        Dragger.loadedPack = Dragger.allLoadedPacks.slice(0, beforeDataStep.loadedPacks.length);
        Dragger.openPoints = beforeDataStep.openPoint;

        console.log(Dragger.allLoadedPacks, Dragger.loadedPack, beforeDataStep.loadedPacks.length - 1)
        let pack = currentDataStep.loadedPacks[currentDataStep.loadedPacks.length - 1]
        scene.remove(scene.getObjectByName("Box_Border_" + pack.id))

        Dragger.currentStep = Dragger.currentStep - 1;
    }

    if (Dragger.currentStep == 0) {
        $("#dragDrop-backward").addClass("disabled")
        return;
    }
});

setInterval(() => {
    if (Dragger.currentStep > 0) {
        $("#dragDrop-backward").removeClass("disabled");
    }
}, 100)

// $("#dragDrop-forward").click(function () {
//     let steps = JSON.parse(localStorage.getItem("steps"));
//     // $("#dragDrop-forward").removeClass("disabled");
//     console.log("forward", Dragger.currentStep);

//     if (steps.length > 0 && Dragger.currentStep != steps.length - 1) {
//         let currentDataStep = steps.find(s => s.stepNumber == Dragger.currentStep)
//         let AfterDataStep = steps.find(s => s.stepNumber == Dragger.currentStep + 1)

//         console.log(currentDataStep, AfterDataStep)
//         Dragger.loadedPack = Dragger.allLoadedPacks.slice(0, AfterDataStep.loadedPacks.length);
//         // Dragger.loadedPack = AfterDataStep.loadedPacks;
//         Dragger.openPoints = AfterDataStep.openPoint;

//         let pack = AfterDataStep.loadedPacks[AfterDataStep.loadedPacks.length - 1]
//         createDragItem(pack)
//         Dragger.currentStep = Dragger.currentStep + 1;
//     }


//     if (Dragger.currentStep == steps.length - 1) {
//         // $("#dragDrop-forward").addClass("disabled")
//         return;
//     }
// });

$("#openDragger").click(function () {
    $("#openDragger i").toggleClass("fa-circle-plus fa-circle-minus")
    $("#dragDrop").toggleClass("dragDrop-container--close dragDrop-container--open");
});

$(".guidline-dragdrop-container").click(function () {
    $($(this)).toggleClass("toggleGuidlines")
});

$("#dragDrop-shortcuts").click(function () {
    $(".guidline-dragdrop-container").toggleClass("toggleGuidlines")
})

export {
    changeOpacityUnvailableRotations, currentRotationUpdate, deleteAllPacks, initializeClasses
}

