import Route from "./routes";

$(document).ready(function () {

    $(".menuIcon").click(function () {
        $(".menu").toggleClass("openMenu closeMenu");
        $(".menuIcon").toggleClass("openMenuIcon closeMenu");
    });

    $("#closeMenuIcon").click(function () {
        $(".menu").toggleClass("openMenu closeMenu");
        $(".menuIcon").toggleClass("openMenuIcon closeMenu");
    });

    $("#reset").click(function () {
        localStorage.removeItem("container");
        localStorage.removeItem("packages");
        localStorage.removeItem("routes")
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

    $("#openRoutes").click(function () {
        $("#openRoutes").toggleClass("fa-circle-plus fa-circle-minus")
        $("#routes").toggleClass("formContainerContentOpen formContainerContentClose");
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

    $("#openExport").click(function () {
        $("#openExport").toggleClass("fa-circle-plus fa-circle-minus")
        $("#files").toggleClass("formContainerContentOpen formContainerContentClose");
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

    //open the advanced parameters
    $("#toggleAdvParam").click(function () {
        $(".sub-container").toggleClass("sub-container--close sub-container--open");
        $("#toggleAdvParam").toggleClass("toggleAdvParam--close toggleAdvParam--open")
    });

    //trait the logic of manupulating multiple priorities
    let id = 0;
    $("#addPrioInputs").click(function () {
        let initialQuantity = $("#pack_Detail_Quantity").val();

        if (initialQuantity != "" && initialQuantity > 1) {

            let values = getMultipleInputValues(".sub-q");
            let actualVal = values.reduce((acc, val) => {
                return acc = acc + val;
            }, 0);

            let val = initialQuantity - actualVal;
            if (val > 0) {
                //disable the normal priorities
                $("#pack_Detail_Priority").addClass("disabled")

                //add the form to maintain the multiple priorities
                disableMultipleInputs(".sub-q");
                $("#multiple-prio").append(`
                        <div class="sub-content" id="advOptionsPrio${id}">
                            <div class="sub-content-inputs">
                                <div>
                                    <p class="inputLabel">Quantity</p>
                                    <input type="number" min="1" max="${val}" value="${val}" class="sub-q input">
                                </div>
                                <div>
                                    <p class="inputLabel">Priority</p>
                                    <select class="pack_priorities sub-prio input" required></select>
                                </div>
                            </div>
                            <div>
                                <i class="fa-solid fa-trash removePrioInput" data="${id++}"></i>
                            </div>
                        </div>`)
                $(".sub-container").animate({ scrollTop: $('.sub-container').prop("scrollHeight") }, 500);

                Route.initialisePriorityFields();
            }
            else
                alert("the somme is bigger than initial quantity");
        }
        else
            alert("the initial quantity is empty or less than 1 Or the somme is bigger than initial quantity");
    });

    //remove the non needed inputs
    $(document).on("click", ".removePrioInput", function () {
        $("#advOptionsPrio" + $(this).attr("data")).remove()
        if ($(".sub-content").length == 0) 
            $("#pack_Detail_Priority").removeClass("disabled")
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

    //disable multiple inputs having the same class
    function disableMultipleInputs(className) {
        let inputs = $(className);

        if (inputs.length >= 1) {
            console.log(inputs[inputs.length - 1], inputs[inputs.length - 1].disabled)
            inputs[inputs.length - 1].disabled = "disabled"
        }
    }

    //activate manuelle mode drag and drop

})

