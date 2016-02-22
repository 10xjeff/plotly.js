/**
* Copyright 2012-2016, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var ScatterLoupe = {};

ScatterLoupe.attributes = require('./attributes');
ScatterLoupe.supplyDefaults = require('./defaults');
ScatterLoupe.colorbar = require('../scatter/colorbar');

// reuse the Scatter3D 'dummy' calc step so that legends know what to do
ScatterLoupe.calc = require('../scatter3d/calc');
ScatterLoupe.plot = require('./convert');

ScatterLoupe.moduleType = 'trace';
ScatterLoupe.name = 'scatterloupe';
ScatterLoupe.basePlotModule = require('../../plots/gloupe');
ScatterLoupe.categories = ['gloupe', 'symbols', 'errorBarsOK', 'markerColorscale', 'showLegend'];
ScatterLoupe.meta = {
    description: [
        'The data visualized as scatter point or lines is set in `x` and `y`',
        'using the WebGl plotting engine.',
        'Bubble charts are achieved by setting `marker.size` and/or `marker.color`',
        'to a numerical arrays.'
    ].join(' ')
};

module.exports = ScatterLoupe;
