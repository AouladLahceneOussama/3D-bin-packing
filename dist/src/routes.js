import Logger from "./logger.js";

let ID = 0;

class Route {

    static allRoutes;

    constructor(routeNumber = 0, routes = []) {
        this.id = ID++;
        this.routeNumber = parseInt(routeNumber);
        this.routes = routes;

        Route.allRoutes = this.getRoute;
    }

    get getRoute() {
        return {
            routeNumber: this.routeNumber,
            routes: this.routes
        }
    }

    get getRouteToLocalStorage() {
        return {
            routeNumber: this.routeNumber,
            routes: this.routes
        }
    }

    static getRouteNumber(type) {
        let items = Route.allRoutes.routes.filter(route => {
            return route.type == type;
        });

        return items.length;
    }

    //take the number of unloading routes
    //initialise option in the select
    static initialisePriorityFields() {
        //create the list of priorities based on the number of routes
        $(".pack_priorities option").remove();

        for (let i = 1; i <= Route.getRouteNumber("dechargement"); i++) 
            $(".pack_priorities").append('<option value="' + i + '">' + i + '</option>');
        
    }

    //init loading the data from localstorage
    static init() {
        if (localStorage.getItem("routes") !== null) {
            let routes = JSON.parse(localStorage.getItem("routes"));

            routes.forEach(r => {
                new Route(r.routeNumber, r.from, r.to, r.type);
            });

            Route.allRoutes.routes.forEach(route => {
                var routeInfo = route.from + " - " + route.to + "(" + route.type + ")";
                var routePrio = "p : " + route.id;
                $("#routesDetails").append('<div class="packInfo"><div>' + routeInfo + '</div><div class="packInfo-numbers">' + routePrio + ' </div></div>');
            });

            Route.initialisePriorityFields();
        }
    }

    //add new route to the application
    addOrUpdate() {
        localStorage.setItem("routes", JSON.stringify(this.getRouteToLocalStorage));
        $("#routesDetails div").remove();
        
        //add the data to the user interface
        Route.allRoutes.routes.forEach(route => {
            var routeInfo = route.from + " - " + route.to + "(" + route.type + ")";
            var routePrio = "p : " + route.id;
            $("#routesDetails").append('<div class="packInfo"><div>' + routeInfo + '</div><div class="packInfo-numbers">' + routePrio + ' </div></div>');
        });

        Route.initialisePriorityFields();

        //dispatch the message to the user
        let logger = new Logger("Adding route", 0.01);
        logger.dispatchMessage();
    }
}

export default Route;