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
import styled, {withTheme} from 'styled-components';
import {Button, Input, Icons, ItemSelector} from 'kepler.gl/components';

import {sceneBuilder} from './scene'; // Not yet part of standard library. TODO when updated
import {RenderSettingsPanelPreview} from './render-settings-panel-preview'; // Not yet part of standard library. TODO when updated

import { point } from '@turf/helpers';
import transformTranslate from '@turf/transform-translate';


import {
  WebMEncoder,
  JPEGSequenceEncoder,
  PNGSequenceEncoder,
  PreviewEncoder,
  GifEncoder
} from '@hubble.gl/core';
import {DeckAdapter, ScatterPlotLayerKeyframes} from 'hubble.gl';

import {DEFAULT_TIME_FORMAT} from 'kepler.gl';
import moment from 'moment';
import {messages} from 'kepler.gl/localization';
import {IntlProvider} from 'react-intl';

const DEFAULT_BUTTON_HEIGHT = '32px';
const DEFAULT_BUTTON_WIDTH = '64px';
const DEFAULT_PADDING = '32px';
const DEFAULT_ROW_GAP = '16px';

const INITIAL_VIEW_STATE = {
  longitude: -122.4,
  latitude: 37.74,
  zoom: 11,
  pitch: 30,
  bearing: 0
};

let adapter = new DeckAdapter(sceneBuilder);

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
  },
  webm:{
    quality: 1.5
  },
  filename: "Default Video Name" + " " + moment().format(DEFAULT_TIME_FORMAT).toString()
};

function preview() {
  adapter.render(PreviewEncoder, encoderSettings, ()=>{});
  // updateCamera(); // TODO anti-pattern?
}

function setFileNameDeckAdapter(name){
  encoderSettings.filename = name + " " + moment().format(DEFAULT_TIME_FORMAT).toString();
}

/*function setResolution(resolution){
  if(resolution === 'Good (540p)'){
    adapter.scene.width = 960;
    adapter.scene.height = 540;
  }else if(resolution === 'High (720p)'){
    adapter.scene.width = 1280;
    adapter.scene.height = 720;
  }else if(resolution === 'Highest (1080p)'){
    adapter.scene.width = 1920;
    adapter.scene.height = 1080;
  }
}*/

// This is temporary, for showing purposes on Friday, resolution settings should be in a separate function, 
// only because we are against the clock. 
// TODO: refactor
function render(settingsdata){

  //  setResolution(settingsdata.resolution); // Remove this

    if (settingsdata.mediaType === 'WebM Video') {
      adapter.render(WebMEncoder, encoderSettings, () => {});
    } else if (settingsdata.mediaType === 'PNG Sequence') {
      adapter.render(PNGSequenceEncoder, encoderSettings, () => {});
    } else if (settingsdata.mediaType === 'JPEG Sequence') {
      adapter.render(JPEGSequenceEncoder, encoderSettings, () => {});
    } 
    updateCamera(); // TODO anti-pattern?
  // preview();
  }

// TODO:

// Changes Timestamp function
// Camera function (preset keyframes) DONE
// File Name function DONE
// MediaType function DONE
// Quality function
// Set Duration function
// Calculate File Size function
// Render Function DONE

function nop() {}

const IconButton = styled(Button)`
  padding: 0;
  svg {
    margin: 0;
  }
`;

const PanelCloseInner = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${DEFAULT_PADDING} ${DEFAULT_PADDING} 0 ${DEFAULT_PADDING};
`;

const PanelClose = ({buttonHeight, handleClose}) => (
  <PanelCloseInner className="render-settings-panel__close" >
    <IconButton className="render-settings-panel__button" link onClick={() => {handleClose()}}>
      <Icons.Delete height={buttonHeight} />
    </IconButton>
  </PanelCloseInner>
);

const StyledTitle = styled.div`
  color: ${props => props.theme.titleTextColor};
  font-size: 20px;
  font-weight: 400;
  line-height: ${props => props.theme.lineHeight};
  padding: 0 ${DEFAULT_PADDING} 16px ${DEFAULT_PADDING};
`;

const StyledSection = styled.div`
  align-self: center;
  color: ${props => props.theme.labelColor};
  font-weight: 500;
  font-size: 13px;
  margin-top: ${DEFAULT_PADDING};
  margin-bottom: ${DEFAULT_ROW_GAP};
`;

const StyledLabelCell = styled.div`
  align-self: center;
  color: ${props => props.theme.labelColor};
  font-weight: 400;
  font-size: 11px;
`;

const StyledValueCell = styled.div`
  align-self: center;
  color: ${props => props.theme.textColor};
  font-weight: 500;
  font-size: 11px;
  padding: 0 12px;
`;

const PanelBodyInner = styled.div`
  padding: 0 ${DEFAULT_PADDING};
  display: grid;
  grid-template-columns: 480px auto;
  grid-column-gap: 20px;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 88px auto;
  grid-template-rows: repeat(
    ${props => props.rows},
    ${props => (props.rowHeight ? props.rowHeight : '34px')}
  );
  grid-row-gap: ${DEFAULT_ROW_GAP};
`;

// PSEUDOCODE (all within scene.js)
// setup initial_view_state to mapState values
// componentDidMount
// const INITIAL_VIEW_STATE = {
//   longitude: mapState.longitude,
//   latitude: ...,
//   zoom: ...,
//   pitch: 30,
//   bearing: 0
// };

// react state to store view_state
// for when user moves camera within modal

// see how viewState is used
// https://github.com/CodeLabs-Hubble-gl/hubble.gl/blob/master/examples/camera/app.js#L42

// then dispatch kepler store? TODO for future

const PanelBody = ({mapData, setMediaType, setCamera, setFileName/*, setQuality*/, settingsData}) => (
  <PanelBodyInner className="render-settings-panel__body"> 
    <div style={{width: "480px", height: "460px"}}>
       <RenderSettingsPanelPreview mapData={mapData} encoderSettings={encoderSettings} adapter={adapter} /*ref={sce}*//> 
    </div>
    <div>
    <StyledSection>Video Effects</StyledSection>
    <InputGrid rows={2}>
      <StyledLabelCell>Timestamp</StyledLabelCell> {/* TODO add functionality  */}
      <ItemSelector
        selectedItems={['None']}
        options={['None', 'White', 'Black']}
        multiSelect={false}
        searchable={false}
      />
      <StyledLabelCell>Camera</StyledLabelCell> {/* TODO add functionality */}
      <ItemSelector
        selectedItems={settingsData.camera}
        options={[
          'None',
          'Orbit (90º)',
          'Orbit (180º)',
          'Orbit (360º)',
          'North to South',
          'South to North',
          'East to West',
          'West to East',
          'Zoom Out',
          'Zoom In'
        ]}
        multiSelect={false}
        searchable={false}
        onChange={setCamera}
      />
    </InputGrid>
    <StyledSection>Export Settings</StyledSection> {/* TODO add functionality  */}
    <InputGrid rows={3}>
      <StyledLabelCell>File Name</StyledLabelCell>
      <Input placeholder={settingsData.fileName} onChange={setFileName}/>
      <StyledLabelCell>Media Type</StyledLabelCell> {/* TODO add functionality  */}
      <ItemSelector
        selectedItems={settingsData.mediaType}
        options={['WebM Video', 'PNG Sequence', 'JPEG Sequence']}
        multiSelect={false}
        searchable={false}
        onChange={setMediaType}
      />
      <StyledLabelCell>Quality</StyledLabelCell> {/* TODO add functionality  */}
      <ItemSelector
        selectedItems={settingsData.resolution}
        options={['Good (540p)', 'High (720p)', 'Highest (1080p)']}
        multiSelect={false}
        searchable={false}
        onChange={() => {}}
      />
    </InputGrid>
    <InputGrid style={{marginTop: DEFAULT_ROW_GAP}} rows={2} rowHeight="18px">
      <StyledLabelCell>Duration</StyledLabelCell> {/* TODO add functionality  */}
      <StyledValueCell>00:00:30</StyledValueCell> 
      <StyledLabelCell>File Size</StyledLabelCell> {/* TODO add functionality  */}
      <StyledValueCell>36 MB</StyledValueCell>
    </InputGrid>
    </div>
  </PanelBodyInner>
);

const PanelFooterInner = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${DEFAULT_ROW_GAP};
  padding: ${DEFAULT_PADDING};
`;

const ButtonGroup = styled.div`
  display: flex;
`;

const PanelFooter = ({handleClose, settingsData}) => (
  <PanelFooterInner className="render-settings-panel__footer">
    <Button
      width={DEFAULT_BUTTON_WIDTH}
      height={DEFAULT_BUTTON_HEIGHT}
      secondary
      className={'render-settings-button'}
      onClick={preview}
    >
      Preview
    </Button>
    <ButtonGroup>
      <Button
        width={DEFAULT_BUTTON_WIDTH}
        height={DEFAULT_BUTTON_HEIGHT}
        link
        className={'render-settings-button'}
        onClick={() => {handleClose()}}
      >
        Cancel
      </Button>
      <Button
        width={DEFAULT_BUTTON_WIDTH}
        height={DEFAULT_BUTTON_HEIGHT}
        className={'render-settings-button'}
        onClick={() => render(settingsData)}
      >
        Render
      </Button>
    </ButtonGroup>
  </PanelFooterInner>
);

const Panel = styled.div`
  width: ${props => props.settingsWidth}px;
`;

class RenderSettingsPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mediaType: "WebM Video",
      camera: "None", 
      fileName: "Video Name",
      cameraHandle: undefined,
    //  quality: "High (720p)",
      viewState: INITIAL_VIEW_STATE,
      setViewState: INITIAL_VIEW_STATE, // TODO unsure of how to use vs original implementation https://github.com/CodeLabs-Hubble-gl/hubble.gl/blob/master/examples/camera/app.js#L42
    };

    this.setMediaTypeState = this.setMediaTypeState.bind(this);
    this.setCamera = this.setCamera.bind(this);
    this.setFileName = this.setFileName.bind(this);
   // this.setQuality = this.setQuality.bind(this);
  }

  componentWillUnmount() { 
    console.log("Reached render-settings-panel componentWillUnmount")
  }

  static defaultProps = {
    settingsWidth: 980,
    buttonHeight: '16px'
  };

  updateCamera(prevCamera) {
    // Set by User
    prevCamera = new CameraKeyframes({
      timings: [0, 5000],
      keyframes: [
        {
          longitude: viewState.longitude,
          latitude: viewState.latitude,
          zoom: viewState.zoom,
          pitch: viewState.pitch,
          bearing: viewState.bearing
        },
        {
          longitude: viewState.longitude,
          latitude: viewState.latitude,
          zoom: viewState.zoom,
          bearing: viewState.bearing,
          pitch: viewState.pitch
        }
      ],
      easings: [easing.easeInOut]
    });

    return prevCamera;
  };

  createKeyframe(strCameraType) {    
    if (this.state.cameraHandle != undefined) { 
      // NOTE this is where each parts of chain come from
      // adapter - Deck, scene.animationLoop - Hubble, timeline.detachAnimation - Luma
      adapter.scene.animationLoop.timeline.detachAnimation(this.state.cameraHandle)
      // adapter.scene.keyframes.camera = this.resetKeyframes() // Resets keyframes so that they don't inherit other options
      console.log("DETACHED")
    }

    this.parseSetCameraType(strCameraType, adapter.scene.keyframes.camera)

    const newCameraHandle = adapter.scene.animationLoop.timeline.attachAnimation(adapter.scene.keyframes.camera);
    this.setState({cameraHandle: newCameraHandle})
  }

  parseSetCameraType(strCameraType, camera) {
    const match = strCameraType.match(/\b(?!to)\b\S+\w/g) // returns arr of important keywords. Should work for 2+ words in future ex: ["Orbit", "90"] | ["North", "South"] | ["Zoom", "In"]

    // Named this way for possibility of >2 keyframes in future
    const firstKeyframe = camera.values[0]
    const secondKeyframe = camera.values[1]

    // Converts mapState object to turf friendly Point obj (GEOJSON)
    const turfPoint = point([camera.values[1].longitude, camera.values[1].latitude])
    console.log("turfPoint", turfPoint)
    if (match[0] == "Orbit") {
      secondKeyframe.bearing = parseInt(match[1])
    }

    // TODO future option that'll allow user to set X distance (km OR miles) directionally. Options inside turf
    // https://turfjs.org/docs/#transformTranslate
    const setChecker = new Set(["East", "South", "West", "North"])
    if (setChecker.has(match[0])) {
      if (match[0] == "East") { // TODO Temporary solution to catch this branch to master. Doesn't work for "East to North" for example if option allows in future
        const translatedPoly = transformTranslate(turfPoint, 10000, 270);
        secondKeyframe.longitude = translatedPoly.geometry.coordinates[0]
      } else 
      if (match[0] == "South") {
        const translatedPoly = transformTranslate(turfPoint, 10000, 0);
        secondKeyframe.latitude = translatedPoly.geometry.coordinates[1]
      } else 
      if (match[0] == "West") {
        const translatedPoly = transformTranslate(turfPoint, 10000, 90);
        secondKeyframe.longitude = translatedPoly.geometry.coordinates[0]
      } else 
      if (match[0] == "North") {
        const translatedPoly = transformTranslate(turfPoint, 10000, 180);
        console.log("translatedPoly", translatedPoly)
        secondKeyframe.latitude = translatedPoly.geometry.coordinates[1]
      }
    }

    if (match[0] == "Zoom") {
      if (match[1] == "In") {
        secondKeyframe.zoom = 15
      } else 
      if (match[1] == "Out") {
        firstKeyframe.zoom = 15
      } 
    }
  }

  // resetKeyframes() { // minified default keyframes from scenebuilder fn
  //   return new CameraKeyframes({timings:[0,5e3],keyframes:[{longitude:-122.4,latitude:37.74,zoom:5,pitch:30,bearing:0},{longitude:-122.4,latitude:37.74,zoom:5,bearing:35,pitch:50}],easings:[easing.easeInOut]})
  // }
 
  setMediaTypeState(media){
    this.setState({
      mediaType: media
    });
  }
  setCamera(option){
      this.setState({
        camera: option
      });
      this.createKeyframe(option)
  }
  setFileName(name){
    this.setState({
      fileName: name.target.value
    });
    setFileNameDeckAdapter(name.target.value);
  }
 /* setQuality(resolution){
    this.setState({
      quality: resolution
    });
    setResolution(resolution);
  }*/

  
  render() {
    
    console.log("this.state", this.state)
    const {buttonHeight, settingsWidth, handleClose} = this.props;
    const settingsData = {
      mediaType : this.state.mediaType,
      camera : this.state.camera,
      fileName: this.state.fileName,
      resolution: this.state.quality,
    }
   
    return (
      <IntlProvider locale="en" messages={messages["en"]}>
        <Panel settingsWidth={settingsWidth} className="render-settings-panel">
          <PanelClose 
              buttonHeight={buttonHeight} 
              handleClose={handleClose}/> {/* handleClose for X button */}
          <StyledTitle className="render-settings-panel__title">Export Video</StyledTitle>  
          <PanelBody 
              mapData={this.props.mapData} 
              setMediaType={this.setMediaTypeState} 
              setCamera={this.setCamera}
              setFileName={this.setFileName}
            //  setQuality={this.setQuality}
              settingsData={settingsData}
              />
          <PanelFooter 
              handleClose={handleClose} 
              settingsData = {settingsData}
              /> {/* handleClose for Cancel button */} 
        </Panel>
      </IntlProvider>
    );
  }
}

export default withTheme(RenderSettingsPanel);