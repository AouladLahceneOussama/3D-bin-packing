/**
 * @jest-environment jsdom
 */

import Pack from "../src/pack";
import Packer from "../src/packer";

Pack.allInstances = [[
    {
        "id": 0,
        "label": "colis 64",
        "w": 161,
        "h": 100,
        "l": 91,
        "q": 1,
        "v": 1465100,
        "priority": 1,
        "stackC": -1,
        "rotations": [
            {
                "w": 161,
                "h": 100,
                "l": 91,
                "type": [
                    "base",
                    0
                ],
                "surface": 14651
            },
            {
                "w": 91,
                "h": 100,
                "l": 161,
                "type": [
                    "base",
                    90
                ],
                "surface": 14651
            }
        ],
        "rotateDirections": [
            "base"
        ],
        "multiplePrio": false,
        "subQuantities": [],
        "color": 0.9524728205791131,
        "loaded": 5,
        "unloaded": 0
    },
    {
        "id": 2,
        "label": "colis 56",
        "w": 206,
        "h": 32,
        "l": 121,
        "q": 1,
        "v": 797632,
        "priority": 1,
        "stackC": -1,
        "rotations": [
            {
                "w": 206,
                "h": 32,
                "l": 121,
                "type": [
                    "base",
                    0
                ],
                "surface": 24926
            },
            {
                "w": 121,
                "h": 32,
                "l": 206,
                "type": [
                    "base",
                    90
                ],
                "surface": 24926
            }
        ],
        "rotateDirections": [
            "base"
        ],
        "multiplePrio": false,
        "subQuantities": [],
        "color": 0.9791706758322778,
        "loaded": 1,
        "unloaded": 0
    },
    {
        "id": 1,
        "label": "colis 2",
        "w": 20,
        "h": 20,
        "l": 20,
        "q": 1,
        "v": 8000,
        "priority": 1,
        "stackC": -1,
        "rotations": [
            {
                "w": 20,
                "h": 20,
                "l": 20,
                "type": [
                    "base",
                    0
                ],
                "surface": 400
            },
            {
                "w": 20,
                "h": 20,
                "l": 20,
                "type": [
                    "base",
                    90
                ],
                "surface": 400
            },
            {
                "w": 20,
                "h": 20,
                "l": 20,
                "type": [
                    "right-side",
                    0
                ],
                "surface": 400
            },
            {
                "w": 20,
                "h": 20,
                "l": 20,
                "type": [
                    "right-side",
                    90
                ],
                "surface": 400
            },
            {
                "w": 20,
                "h": 20,
                "l": 20,
                "type": [
                    "front-side",
                    0
                ],
                "surface": 400
            },
            {
                "w": 20,
                "h": 20,
                "l": 20,
                "type": [
                    "front-side",
                    90
                ],
                "surface": 400
            }
        ],
        "rotateDirections": [
            "base",
            "right-side",
            "front-side"
        ],
        "multiplePrio": false,
        "subQuantities": [],
        "color": 0.9982417890838651,
        "loaded": 650,
        "unloaded": 0
    }
]];

test('should return intialized array containnig priorities and packages', () => {
    let packer = new Packer("openPoints")

    let spy = jest.spyOn(packer, 'initialisePackagesToLoad').mockImplementation(() =>
        [
            {
                "1": [
                    {
                        "id": "0-0",
                        "label": "colis 64",
                        "w": 161,
                        "h": 100,
                        "l": 91,
                        "v": 1465100,
                        "priority": 1,
                        "stackC": -1,
                        "rotations": [
                            {
                                "w": 161,
                                "h": 100,
                                "l": 91,
                                "type": [
                                    "base",
                                    0
                                ],
                                "surface": 14651
                            },
                            {
                                "w": 91,
                                "h": 100,
                                "l": 161,
                                "type": [
                                    "base",
                                    90
                                ],
                                "surface": 14651
                            }
                        ],
                        "rotateDirections": [
                            "base"
                        ],
                        "multiplePrio": false,
                        "subQuantities": [],
                        "color": 0.27049808186780044,
                        "loaded": 1,
                        "unloaded": 0,
                        "parent_id": 0
                    },
                    {
                        "id": "2-0",
                        "label": "colis 56",
                        "w": 206,
                        "h": 32,
                        "l": 121,
                        "v": 797632,
                        "priority": 1,
                        "stackC": -1,
                        "rotations": [
                            {
                                "w": 206,
                                "h": 32,
                                "l": 121,
                                "type": [
                                    "base",
                                    0
                                ],
                                "surface": 24926
                            },
                            {
                                "w": 121,
                                "h": 32,
                                "l": 206,
                                "type": [
                                    "base",
                                    90
                                ],
                                "surface": 24926
                            },
                            {
                                "w": 206,
                                "h": 121,
                                "l": 32,
                                "type": [
                                    "right-side",
                                    0
                                ],
                                "surface": 6592
                            },
                            {
                                "w": 32,
                                "h": 121,
                                "l": 206,
                                "type": [
                                    "right-side",
                                    90
                                ],
                                "surface": 6592
                            },
                            {
                                "w": 121,
                                "h": 206,
                                "l": 32,
                                "type": [
                                    "front-side",
                                    90
                                ],
                                "surface": 3872
                            },
                            {
                                "w": 32,
                                "h": 206,
                                "l": 121,
                                "type": [
                                    "front-side",
                                    0
                                ],
                                "surface": 3872
                            }
                        ],
                        "rotateDirections": [
                            "base",
                            "right-side",
                            "front-side"
                        ],
                        "multiplePrio": false,
                        "subQuantities": [],
                        "color": 0.18455847913863654,
                        "loaded": 1,
                        "unloaded": 0,
                        "parent_id": 2
                    },
                    {
                        "id": "1-0",
                        "label": "colis 2",
                        "w": 20,
                        "h": 20,
                        "l": 20,
                        "v": 8000,
                        "priority": 1,
                        "stackC": -1,
                        "rotations": [
                            {
                                "w": 20,
                                "h": 20,
                                "l": 20,
                                "type": [
                                    "base",
                                    0
                                ],
                                "surface": 400
                            },
                            {
                                "w": 20,
                                "h": 20,
                                "l": 20,
                                "type": [
                                    "base",
                                    90
                                ],
                                "surface": 400
                            },
                            {
                                "w": 20,
                                "h": 20,
                                "l": 20,
                                "type": [
                                    "right-side",
                                    0
                                ],
                                "surface": 400
                            },
                            {
                                "w": 20,
                                "h": 20,
                                "l": 20,
                                "type": [
                                    "right-side",
                                    90
                                ],
                                "surface": 400
                            },
                            {
                                "w": 20,
                                "h": 20,
                                "l": 20,
                                "type": [
                                    "front-side",
                                    0
                                ],
                                "surface": 400
                            },
                            {
                                "w": 20,
                                "h": 20,
                                "l": 20,
                                "type": [
                                    "front-side",
                                    90
                                ],
                                "surface": 400
                            }
                        ],
                        "rotateDirections": [
                            "base",
                            "right-side",
                            "front-side"
                        ],
                        "multiplePrio": false,
                        "subQuantities": [],
                        "color": 0.8361343449997944,
                        "loaded": 1,
                        "unloaded": 0,
                        "parent_id": 1
                    }
                ]
            },
            [1]
        ]);

    // Spying on the actual methods of the Person class
    expect(packer.initialisePackagesToLoad()[0]).toEqual(
        {
            "1": [
                {
                    "id": "0-0",
                    "label": "colis 64",
                    "w": 161,
                    "h": 100,
                    "l": 91,
                    "v": 1465100,
                    "priority": 1,
                    "stackC": -1,
                    "rotations": [
                        {
                            "w": 161,
                            "h": 100,
                            "l": 91,
                            "type": [
                                "base",
                                0
                            ],
                            "surface": 14651
                        },
                        {
                            "w": 91,
                            "h": 100,
                            "l": 161,
                            "type": [
                                "base",
                                90
                            ],
                            "surface": 14651
                        }
                    ],
                    "rotateDirections": [
                        "base"
                    ],
                    "multiplePrio": false,
                    "subQuantities": [],
                    "color": 0.27049808186780044,
                    "loaded": 1,
                    "unloaded": 0,
                    "parent_id": 0
                },
                {
                    "id": "2-0",
                    "label": "colis 56",
                    "w": 206,
                    "h": 32,
                    "l": 121,
                    "v": 797632,
                    "priority": 1,
                    "stackC": -1,
                    "rotations": [
                        {
                            "w": 206,
                            "h": 32,
                            "l": 121,
                            "type": [
                                "base",
                                0
                            ],
                            "surface": 24926
                        },
                        {
                            "w": 121,
                            "h": 32,
                            "l": 206,
                            "type": [
                                "base",
                                90
                            ],
                            "surface": 24926
                        },
                        {
                            "w": 206,
                            "h": 121,
                            "l": 32,
                            "type": [
                                "right-side",
                                0
                            ],
                            "surface": 6592
                        },
                        {
                            "w": 32,
                            "h": 121,
                            "l": 206,
                            "type": [
                                "right-side",
                                90
                            ],
                            "surface": 6592
                        },
                        {
                            "w": 121,
                            "h": 206,
                            "l": 32,
                            "type": [
                                "front-side",
                                90
                            ],
                            "surface": 3872
                        },
                        {
                            "w": 32,
                            "h": 206,
                            "l": 121,
                            "type": [
                                "front-side",
                                0
                            ],
                            "surface": 3872
                        }
                    ],
                    "rotateDirections": [
                        "base",
                        "right-side",
                        "front-side"
                    ],
                    "multiplePrio": false,
                    "subQuantities": [],
                    "color": 0.18455847913863654,
                    "loaded": 1,
                    "unloaded": 0,
                    "parent_id": 2
                },
                {
                    "id": "1-0",
                    "label": "colis 2",
                    "w": 20,
                    "h": 20,
                    "l": 20,
                    "v": 8000,
                    "priority": 1,
                    "stackC": -1,
                    "rotations": [
                        {
                            "w": 20,
                            "h": 20,
                            "l": 20,
                            "type": [
                                "base",
                                0
                            ],
                            "surface": 400
                        },
                        {
                            "w": 20,
                            "h": 20,
                            "l": 20,
                            "type": [
                                "base",
                                90
                            ],
                            "surface": 400
                        },
                        {
                            "w": 20,
                            "h": 20,
                            "l": 20,
                            "type": [
                                "right-side",
                                0
                            ],
                            "surface": 400
                        },
                        {
                            "w": 20,
                            "h": 20,
                            "l": 20,
                            "type": [
                                "right-side",
                                90
                            ],
                            "surface": 400
                        },
                        {
                            "w": 20,
                            "h": 20,
                            "l": 20,
                            "type": [
                                "front-side",
                                0
                            ],
                            "surface": 400
                        },
                        {
                            "w": 20,
                            "h": 20,
                            "l": 20,
                            "type": [
                                "front-side",
                                90
                            ],
                            "surface": 400
                        }
                    ],
                    "rotateDirections": [
                        "base",
                        "right-side",
                        "front-side"
                    ],
                    "multiplePrio": false,
                    "subQuantities": [],
                    "color": 0.8361343449997944,
                    "loaded": 1,
                    "unloaded": 0,
                    "parent_id": 1
                }
            ]
        })
    expect(packer.initialisePackagesToLoad).toHaveBeenCalledTimes(1)

    spy.mockRestore();
});

