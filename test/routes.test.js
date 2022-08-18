/**
 * @jest-environment jsdom
 */

import Route from "../src/routes";

it("should retun the route data", () =>
    expect(
        new Route(1, [{ id: 1, from: "a", to: "b", type: "dechargement" }]).getRoute)
        .toEqual(
            {
                routeNumber: 1,
                routes: [
                    {
                        id: 1,
                        from: "a",
                        to: "b",
                        type: "dechargement"
                    }
                ]
            }
        )
)

it("should get the route number by the given type", () => {
    new Route(1, [
        { id: 1, from: "a", to: "b", type: "dechargement" },
        { id: 2, from: "c", to: "d", type: "dechargement" },
        { id: 3, from: "e", to: "f", type: "chargement" }
    ]);

    expect(Route.getRouteNumber("dechargement")).toBe(2)
    expect(Route.getRouteNumber("chargement")).toBe(1)
})


