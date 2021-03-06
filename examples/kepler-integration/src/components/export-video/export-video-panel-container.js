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
import ExportVideoPanel from './export-video-panel';

import {parseSetCameraType} from './parse-set-camera-type';

import {easing} from 'popmotion';

import {
  DeckAdapter,
  DeckScene,
  CameraKeyframes,
  WebMEncoder,
  JPEGSequenceEncoder,
  PNGSequenceEncoder,
  PreviewEncoder,
  GifEncoder
} from '@hubble.gl/core';

// import {DEFAULT_TIME_FORMAT} from 'kepler.gl';
// import moment from 'moment';

// function setFileNameDeckAdapter(name) {
//   encoderSettings.filename = `${name} ${moment()
//     .format(DEFAULT_TIME_FORMAT)
//     .toString()}`;
// }

// TODO Couldn't figure out how to incorporate these into state. Would be calling state property within this.state?
// let currentWidth = 1280
// let currentHeight = 720

export class ExportVideoPanelContainer extends Component {
  static defaultProps = {
    exportVideoWidth: 980
  };

  constructor(props) {
    super(props);

    this.setMediaTypeState = this.setMediaTypeState.bind(this);
    this.setCameraPreset = this.setCameraPreset.bind(this);
    this.setFileName = this.setFileName.bind(this);
    this.setQuality = this.setQuality.bind(this);
    this.getCameraKeyframes = this.getCameraKeyframes.bind(this);
    this.getDeckScene = this.getDeckScene.bind(this);
    this.onPreviewVideo = this.onPreviewVideo.bind(this);
    this.onRenderVideo = this.onRenderVideo.bind(this);

    this.state = {
      mediaType: 'GIF',
      cameraPreset: 'None',
      fileName: 'Video Name',
      quality: 'High (720p)',
      viewState: this.props.mapData.mapState,
      currentWidth: 1280,
      currentHeight: 720,
      durationMs: 1000,
      encoderSettings: {
        framerate: 30,
        webm: {
          // TODO width/height not in WEBMEncoder
          quality: 0.8
        },
        jpeg: {
          // TODO width/height not in JPEGEncoder
          quality: 0.8
        },
        gif: {
          sampleInterval: 1000,
          get width() {
            return this.currentWidth;
          },
          set width(width) {
            width = this.currentWidth;
          },
          get height() {
            return this.currentHeight;
          },
          set height(height) {
            height = this.currentHeight;
          }
        },
        filename: 'kepler.gl'
      },
      adapter: new DeckAdapter(this.getDeckScene)
    };
  }

  getCameraKeyframes(prevCamera = undefined) {
    const {viewState, cameraPreset, durationMs} = this.state;

    return new CameraKeyframes({
      timings: [0, durationMs],
      keyframes: [
        {
          longitude: viewState.longitude,
          latitude: viewState.latitude,
          zoom: viewState.zoom,
          pitch: viewState.pitch,
          bearing: viewState.bearing
        },
        parseSetCameraType(cameraPreset, viewState)
      ],
      easings: [easing.easeInOut]
    });
  }

  getDeckScene(animationLoop) {
    const keyframes = {
      camera: this.getCameraKeyframes()
    };
    const currentCamera = animationLoop.timeline.attachAnimation(keyframes.camera);

    return new DeckScene({
      animationLoop,
      keyframes,
      lengthMs: this.state.durationMs, // TODO change to 5000 later. 1000 for dev testing
      width: 480,
      height: 460,
      currentCamera
    });
  }

  setMediaTypeState(media) {
    this.setState({
      mediaType: media
    });
  }
  setCameraPreset(option) {
    this.setState({
      cameraPreset: option
    });
  }
  setFileName(name) {
    this.setState({
      fileName: name.target.value
    });
    // setFileNameDeckAdapter(name.target.value);
  }
  setQuality(resolution) {
    // const {adapter, encoderSettings} = this.state
    this.setState({
      quality: resolution
    });
    if (resolution === 'Good (540p)') {
      this.setState({currentWidth: 960});
      this.setState({currentHeight: 540});
    } else if (resolution === 'High (720p)') {
      this.setState({currentWidth: 1280});
      this.setState({currentHeight: 720});
    } else if (resolution === 'Highest (1080p)') {
      this.setState({currentWidth: 1920});
      this.setState({currentHeight: 1080});
    }

    // console.log('REACHED');
    // console.log('this.state.encoderSettings.gif', this.state.encoderSettings.gif);
    // console.log("currentWidth", currentWidth)
  }

  onPreviewVideo() {
    const {adapter, encoderSettings} = this.state;

    const onStop = () => {};
    adapter.render(PreviewEncoder, encoderSettings, onStop, this.getCameraKeyframes);
  }

  onRenderVideo() {
    const {adapter, encoderSettings, mediaType} = this.state;
    let Encoder = PreviewEncoder;
    const onStop = () => {};

    if (mediaType === 'WebM Video') {
      Encoder = WebMEncoder;
    } else if (mediaType === 'PNG Sequence') {
      Encoder = PNGSequenceEncoder;
    } else if (mediaType === 'JPEG Sequence') {
      Encoder = JPEGSequenceEncoder;
    } else if (mediaType === 'GIF') {
      Encoder = GifEncoder;
    }

    adapter.render(Encoder, encoderSettings, onStop, this.getCameraKeyframes);
  }

  render() {
    const {exportVideoWidth, handleClose, mapData} = this.props;
    const settingsData = {
      mediaType: this.state.mediaType,
      cameraPreset: this.state.cameraPreset,
      fileName: this.state.fileName,
      resolution: this.state.quality
    };

    const {exportSettings, adapter} = this.state;

    return (
      <ExportVideoPanel
        // UI Props
        exportVideoWidth={exportVideoWidth}
        handleClose={handleClose}
        // Map Props
        mapData={mapData}
        setViewState={viewState => {
          this.setState({viewState});
        }}
        // Settings Props
        settingsData={settingsData}
        setMediaTypeState={this.setMediaTypeState}
        setCameraPreset={this.setCameraPreset}
        setFileName={this.setFileName}
        setQuality={this.setQuality}
        // Hubble Props
        exportSettings={exportSettings}
        adapter={adapter}
        handlePreviewVideo={this.onPreviewVideo}
        handleRenderVideo={this.onRenderVideo}
      />
    );
  }
}
