/**
 * @jest-environment jsdom
 */

import Pack from "../src/pack";

it("should return the package detail", () =>
    expect(new Pack("colis 1", 1, 1, 1 / 2, 10, -1, ["base"], 1).getPack)
        .toEqual(
            {
                id: 0,
                label: "colis 1",
                w: 1 * 100,
                h: 1 * 100,
                l: 1 / 2 * 100,
                q: 10,
                v: 1 * 1 * 1 / 2 * Math.pow(100, 3),
                priority: 1,
                stackC: -1,
                rotations: [
                    {
                        w: 1 * 100,
                        h: 1 * 100,
                        l: 1 / 2 * 100,
                        type: ["base", 0],
                        surface: 1 * 1 / 2 * Math.pow(100, 2)
                    }, {
                        w: 1 / 2 * 100,
                        h: 1 * 100,
                        l: 1 * 100,
                        type: ["base", 90],
                        surface: 1 * 1 / 2 * Math.pow(100, 2)
                    }
                ],
                rotateDirections: ["base"],
                multiplePrio: false,
                subQuantities: [],
            }
        )
)

it("should calcul the possible rotation", () =>
    expect(
        new Pack("colis 1", 2, 1, 1 / 2, 10, -1, ["base", "right-side", "front-side"], 1)
            .setDimensions(["base", "right-side", "front-side"]))
        .toEqual(
            [
                {
                    w: 2 * 100,
                    h: 1 / 2 * 100,
                    l: 1 * 100,
                    type: ["right-side", 0],
                    surface: 1 * 2 * Math.pow(100, 2)
                },
                {
                    w: 1 * 100,
                    h: 1 / 2 * 100,
                    l: 2 * 100,
                    type: ["right-side", 90],
                    surface: 1 * 2 * Math.pow(100, 2)
                },
                {
                    w: 2 * 100,
                    h: 1 * 100,
                    l: 1 / 2 * 100,
                    type: ["base", 0],
                    surface: 2 * 1 / 2 * Math.pow(100, 2)
                },
                {
                    w: 1 / 2 * 100,
                    h: 1 * 100,
                    l: 2 * 100,
                    type: ["base", 90],
                    surface: 2 * 1 / 2 * Math.pow(100, 2)
                },
                {
                    w: 1 * 100,
                    h: 2 * 100,
                    l: 1 / 2 * 100,
                    type: ["front-side", 0],
                    surface: 1 * 1 / 2 * Math.pow(100, 2)
                },
                {
                    w: 1 / 2 * 100,
                    h: 2 * 100,
                    l: 1 * 100,
                    type: ["front-side", 90],
                    surface: 1 * 1 / 2 * Math.pow(100, 2)
                }
            ]
        )
)