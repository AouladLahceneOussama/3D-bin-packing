/**
 * @jest-environment jsdom
 */

import { loadApi, readCsv } from '../src/form.js'

it("should return the data from the api", async () => {
    await loadApi("https://aouladlahceneoussama.github.io/packer-data/data1.json").
    then( data => expect(data).toEqual(
        {
            "container": {
                "w": 6.8,
                "h": 2.6,
                "l": 2.54
            },
            "routes": [
                {
                    "id": 1,
                    "from": "Casa",
                    "to": "Rabat",
                    "type": "dechargement"
                },
                {
                    "id": 2,
                    "from": "Rabat",
                    "to": "Kenitra",
                    "type": "dechargement"
                },
                {
                    "id": 3,
                    "from": "Kenitra",
                    "to": "Tanger",
                    "type": "dechargement"
                }
            ],
            "colis": [
                {
                    "label": "Palette Dalaa VP",
                    "w": 1.2,
                    "h": 1.8,
                    "l": 1.2,
                    "q": 1,
                    "priority": 1,
                    "stackingCapacity": -1,
                    "rotations": [
                        "base"
                    ]
                },
                {
                    "label": "Palette The Moussem",
                    "w": 1.2,
                    "h": 1.8,
                    "l": 1.2,
                    "q": 12,
                    "priority": 1,
                    "stackingCapacity": -1,
                    "rotations": [
                        "base"
                    ]
                },
                {
                    "label": "Palette Euro Dalaa VP",
                    "w": 1.2,
                    "h": 1.8,
                    "l": 0.8,
                    "q": 2,
                    "priority": 1,
                    "stackingCapacity": -1,
                    "rotations": [
                        "base"
                    ]
                },
                {
                    "label": "Caisse Fizz 1.25",
                    "w": 0.5,
                    "h": 0.5,
                    "l": 0.5,
                    "q": 12,
                    "priority": 1,
                    "stackingCapacity": -1,
                    "rotations": [
                        "base"
                    ]
                },
                {
                    "label": "Caisse Fizz",
                    "w": 0.6,
                    "h": 0.5,
                    "l": 0.4,
                    "q": 30,
                    "priority": 1,
                    "stackingCapacity": -1,
                    "rotations": [
                        "base"
                    ]
                },
                {
                    "label": "Carton moyen Thé",
                    "w": 0.6,
                    "h": 0.4,
                    "l": 0.4,
                    "q": 10,
                    "priority": 1,
                    "stackingCapacity": -1,
                    "rotations": [
                        "base"
                    ]
                },
                {
                    "label": "Pack Dalaa VP",
                    "w": 0.6,
                    "h": 0.2,
                    "l": 0.4,
                    "q": 9,
                    "priority": 1,
                    "stackingCapacity": -1,
                    "rotations": [
                        "base"
                    ]
                },
                {
                    "label": "Colis Dalaa GP Maxi",
                    "w": 0.6,
                    "h": 0.2,
                    "l": 0.3,
                    "q": 0,
                    "priority": 1,
                    "stackingCapacity": -1,
                    "rotations": [
                        "base"
                    ]
                },
                {
                    "label": "PAck 144  Dettol Savon Solide Fresh 70g",
                    "w": 0.28,
                    "h": 0.17,
                    "l": 0.31,
                    "q": 35,
                    "priority": 1,
                    "stackingCapacity": -1,
                    "rotations": [
                        "base"
                    ]
                }
            ]
        }))
    .catch(err => console.log(err));
})

it("should return false bad extention", () => {
    let ext = "txt";
    expect(readCsv(ext, ext)).toBeFalsy()
})

it("should return true right extention", () => {
    let ext = "csv";
    expect(readCsv(ext, ext)).toBeTruthy()
})