import $ from '../libraries/jquery.min.js';
global.$ = global.jQuery = $;

import * as  THREE from "../threeJsLib/three.js.r122";
global.THREE = THREE;

require('jest-fetch-mock').enableMocks()
// import { jsdom } from 'jsdom';

// const dom = new jsdom('<!doctype html><html><body></body></html>');
// const { window } = dom.defaultView;
// window.HTMLCanvasElement.prototype.getContext = () => {
//     return {};
// };

// global.window = window;