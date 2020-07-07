import React, {Component, useState, useRef} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, ColumnLayer} from '@deck.gl/layers';
import {StaticMap} from 'react-map-gl';
import {DeckAdapter} from '@hubble.gl/core';
import {useNextFrame, BasicControls} from '@hubble.gl/react';
import {sceneBuilder} from './scene';


// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

// Source: https://earthquake.usgs.gov/fdsnws/event/1/
const EARTHQUAKES = 'https://gist.githubusercontent.com/RaymondDashWu/a383fa57a5cc36e21947a47bb4ca7b25/raw/93e140016a3e610d682facab26c4b96385602162/usgs_earthquakes_7_4.geo.json';


// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 10,
  pitch: 0,
  bearing: 0
};

const adapter = new DeckAdapter(sceneBuilder);

/** @type {import('@hubble.gl/core/src/types').FrameEncoderSettings} */
const encoderSettings = {
  framerate: 30,
  webm: {
    quality: 0.8
  },
  jpeg: {
    quality: 0.8
  },
  gif: {
    sampleInterval: 1000
  }
};

class Layers extends Component {
  _onClick(info) {
    if (info.object) {
      // eslint-disable-next-line
      alert(`${info.object.properties.mag} (${info.object.properties.mag})`);
    }
  }

  render() {
    const layers = [
      new GeoJsonLayer({
        id: 'earthquakes',
        data: EARTHQUAKES,
        // Styles
        filled: true,
        pointRadiusMinPixels: 2,
        pointRadiusScale: 2000,
        getRadius: f => f.properties.mag,
        getFillColor: [200, 0, 80, 180],
        // Interactive props
        pickable: true,
        autoHighlight: true,
      }),
      new ColumnLayer({
        id: 'column-layer',
        data: EARTHQUAKES,
        diskResolution: 12,
        radius: 250,
        extruded: true,
        pickable: true,
        elevationScale: 5000,
        getPosition: d => d.geometry.coordinates, // [d.geometry.coordinates[0], d.geometry.coordinates[1]],
        getFillColor: d => [48, 128, d.properties.mag * 255, 255],
        getLineColor: [0, 0, 0],
        getElevation: 1000 // d => d.value
      })
    ];
    
    console.log(layers)
    console.log("test", layers[0].data)

    return (
      <DeckGL initialViewState={INITIAL_VIEW_STATE} 
        controller={true} 
        layers={layers}
        getTooltip={({object}) => object && ("Magnitude: " + object["properties"]["mag"].toString()
          + "\n" + "KM Below Surface " +  
          object["geometry"]["coordinates"][2])}
      >
        <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle="mapbox://styles/mapbox/outdoors-v11" 
        />
      </DeckGL>
    );
  }
}

export default Layers;