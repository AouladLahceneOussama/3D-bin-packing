$(document).ready(function () {

    $(".menuIcon").click(function () {
        $(".menu").toggleClass("openMenu closeMenu");
        $(".menuIcon").toggleClass("openMenuIcon closeMenu");
    });

    $(".closeMenuIcon").click(function () {
        $(".menu").toggleClass("openMenu closeMenu");
        $(".menuIcon").toggleClass("openMenuIcon closeMenu");
    });

    $("#reset").click(function () {
        localStorage.removeItem("container");
        localStorage.removeItem("packages");
        location.reload();
    });

    $("#openCSV").click(function () {
        $("#openCSV").toggleClass("fa-circle-plus fa-circle-minus")
        $("#csv").toggleClass("formContainerContentOpen formContainerContentClose");
    });
    
    $("#openApi").click(function () {
        $("#openApi").toggleClass("fa-circle-plus fa-circle-minus")
        $("#api").toggleClass("formContainerContentOpen formContainerContentClose");
    });

    $("#openPackages").click(function () {
        $("#openPackages").toggleClass("fa-circle-plus fa-circle-minus")
        $("#packages").toggleClass("formContainerContentOpen formContainerContentClose");
    });

    $("#openVehicule").click(function () {
        $("#openVehicule").toggleClass("fa-circle-plus fa-circle-minus")
        $("#vehicule").toggleClass("formContainerContentOpen formContainerContentClose");
    });

    $("#openResult").click(function () {
        $("#openResult").toggleClass("fa-circle-plus fa-circle-minus")
        $("#result").toggleClass("formContainerContentOpen formContainerContentClose");
    });

    $("#openPackDetail").click(function () {
        $("#openPackDetail").toggleClass("fa-circle-plus fa-circle-minus")
        $("#packDetail").toggleClass("pack-detail-close pack-detail-open");
    });

    var container = JSON.parse(localStorage.getItem("container"));
    if (container !== null) {
        var packDim = container.w + " , " + container.h + " , " + container.l;
        $("#containerDetails").append('<span>' + packDim + '</span>');
    }
})