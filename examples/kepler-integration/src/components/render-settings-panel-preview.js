// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {Component} from 'react';

// Map Component
import DeckGL from '@deck.gl/react';

import {MapView, OrthographicView} from '@deck.gl/core';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';

export class RenderSettingsPanelPreview extends Component {
  constructor(props) {
    super(props);

    this.mapData = this.props.mapData;

    this.state = {
      timestamp: {
        latitude: 47.65,
        longitude: 7
      }
    };

    this._renderLayer = this._renderLayer.bind(this);
  }

  componentDidMount() {
    this.forceUpdate();
  }
  _renderLayer(overlays, idx) {
    const datasets = this.mapData.visState.datasets;
    const layers = this.mapData.visState.layers;
    const layerData = this.mapData.visState.layerData;
    const hoverInfo = this.mapData.visState.hoverInfo;
    const clicked = this.mapData.visState.clicked;
    const mapState = this.mapData.mapState;
    const interactionConfig = this.mapData.visState.interactionConfig;
    const animationConfig = this.mapData.visState.animationConfig;

    const layer = layers[idx];
    const data = layerData[idx];
    const {gpuFilter} = datasets[layer.config.dataId] || {};

    const objectHovered = clicked || hoverInfo;
    const layerCallbacks = {
      onSetLayerDomain: val => this._onLayerSetDomain(idx, val)
    };

    // Layer is Layer class
    const layerOverlay = layer.renderLayer({
      data,
      gpuFilter,
      idx,
      interactionConfig,
      layerCallbacks,
      mapState,
      animationConfig,
      objectHovered
    });
    return overlays.concat(layerOverlay || []);
  }

  layerFilter({layer, viewport}) {
    if (viewport.id === 'timestamp' && layer.id === 'timestamp') {
      // Renders timestamp in OrthographicView only
      return true;
    } else if (viewport.id === 'MapView' && layer.id !== 'timestamp') {
      // Renders rest of views in MapView
      return true;
    }
    return false;
  }

  onViewStateChange({viewport, viewState}) {
    if (viewport.id === 'timestamp') {
      this.setState({
        timestamp: {
          longitude: viewState.longitude,
          latitude: viewState.latitude
        }
      });
    }
  }

  //   interactionConfig,
  render() {
    // const mapStyle = this.mapData.mapStyle;
    const mapState = this.mapData.mapState;
    // const layers = this.mapData.visState.layers;
    // const layerData = this.mapData.visState.layerData;
    const layerOrder = this.mapData.visState.layerOrder;
    // const animationConfig = this.mapData.visState.animationConfig;
    const useDevicePixels = false;

    // Map data
    const mapboxApiAccessToken = this.mapData.mapStyle.mapboxApiAccessToken;
    const mapboxApiUrl = this.mapData.mapStyle.mapboxApiUrl;

    // define trip and geojson layers
    let deckGlLayers = [];

    const tileLayer = new TileLayer({
      autoHighlight: true,
      highlightColor: [60, 60, 60, 40],
      opacity: 1,
      // https://wiki.openstreetmap.org/wiki/Zoom_levels
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      // getTileData: ({x, y, z}) => {return load(`http://d90016be4e11c76b57d0311404f546f06afbae25.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`);},

      data: [
        `http://{d90016be4e11c76b57d0311404f546f06afbae25}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png`
      ],

      renderSubLayers: props => {
        const {
          bbox: {west, south, east, north}
        } = props.tile;

        return new BitmapLayer(props, {
          data: [],
          image: props.data,
          bounds: [west, south, east, north]
        });
      }
    });

    // TODO refactor this. Layers are reverse, filtered, etc. only to be redefined later
    // TODO FIX tileLayer & textlayer need to be added manually
    // wait until data is ready before render data layers
    if (layerOrder && layerOrder.length) {
      // last layer render first
      deckGlLayers = layerOrder
        .slice()
        .reverse()
        // .filter(
        //   idx => layers[idx].overlayType === OVERLAY_TYPE.deckgl && layers[idx].id
        // )
        .reduce(this._renderLayer, []);
      // deckGlLayers.splice(0, 0, tileLayer)

      // var i;
      // for (i = 0; i < deckGlLayers.length; i++) {
      //   deckGlLayers[i].shouldUpdateState()
      // }
    }

    deckGlLayers[2] = deckGlLayers[1];
    deckGlLayers[1] = deckGlLayers[0];
    deckGlLayers[0] = tileLayer;

    const style = {
      position: 'relative'
    };

    console.log('deckGlLayers', deckGlLayers);
    return (
      <div id="deck-canvas" style={{width: '480px', height: '460px', position: 'relative'}}>
        <DeckGL
          ref={r => {
            this.deckgl = {current: r};
          }}
          viewState={mapState}
          id="default-deckgl-overlay2"
          layers={deckGlLayers}
          layerFilter={this.layerFilter}
          useDevicePixels={useDevicePixels}
          style={style}
          controller={true}
          onViewStateChange={({viewState: vs}) => {
            this.props.setViewState(vs);
          }}
          views={[
            new MapView({id: 'MapView', repeat: true}),
            new OrthographicView({id: 'timestamp'})
          ]} // Not yet
          /* onBeforeRender={this._onBeforeRender} // Not yet
                      onHover={visStateActions.onLayerHover} // Not yet
                      onClick={visStateActions.onLayerClick}*/ {...this.props.adapter.getProps(
            this.deckgl,
            () => {},
            () => {
              this.forceUpdate();
            }
          )}
          // {...this.props.adapter._updateFromProps()}
        />
      </div>
    );
  }
}
