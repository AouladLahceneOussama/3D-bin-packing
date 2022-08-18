/**
 * @jest-environment jsdom
 */

import Container from "../src/container";

it("should return the container data", () =>
    expect(new Container(1, 2, 3).getContainer).toEqual(
        {
            w: 1 * 100,
            h: 2 * 100,
            l: 3 * 100,
            capacity: 1 * 2 * 3 * Math.pow(100, 3),
        }
    )
)
