const ThreeDContainer = document.getElementById("3D-container");
const popUp = document.getElementById("exampleModalfat");

var truck_wheels, truck_support;
function affectModelsToVar(truck_wheels_model, truck_support_model){
    truck_wheels = truck_wheels_model
    truck_support = truck_support_model
}


export {
    ThreeDContainer,
    popUp,
    affectModelsToVar,
    truck_wheels, 
    truck_support
}