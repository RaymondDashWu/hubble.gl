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

// Modal aesthetics
import {ThemeProvider, withTheme} from 'styled-components';
import RenderSettingsModal from './render-settings-modal';
import Button from 'kepler.gl';

// Redux stores/actions
import {connect as keplerGlConnect} from 'kepler.gl';
import {connect} from 'react-redux';
import toggleHubbleExportModal from 'kepler.gl'; // TODO make custom action

const mapStateToProps = (state) => {
    // console.log("keplerGlGetState state", state)
    // console.log("state.demo.keplerGl", state.demo.keplerGl)
    return {mapData: state.demo.keplerGl.map}}


// function mapStateToProps(state = {}, props) {
//     return { // TODO unsure if other redux stores are needed atm
//       ...props,
//       visState: state.visState,
//       mapStyle: state.mapStyle,
//       mapState: state.mapState,
//       uiState: state.uiState,
//       providerState: state.providerState,
//     };
// }

// noResultDispatch returns nothing in this case. Undefined if console.log
// because we're using Kepler's connect (wrapper of Redux connect) it has 3 arguments (2 are dispatches)
// the code can be found from ../connect/keplergl-connect
// const mapDispatchToProps = () => (noResultDispatch, ownProps, dispatch) => {
const mapDispatchToProps = () => (dispatch, props) => {	
    return {
        toggleHubbleExportModal: (isOpen) => dispatch(toggleHubbleExportModal(isOpen)), // NOTE gives dispatch error
    }
}	

export class HubbleExport extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isOpen: false
        }
    }
    
    // handleClose() {this.props.toggleHubbleExportModal(false)} // X button in RenderSettingsModal was clicked
    // handleExport() {this.props.toggleHubbleExportModal(true)} // Export button in Kepler UI was clicked
    handleClose() {this.setState({isOpen: false})} // X button in RenderSettingsModal was clicked
    handleExport() {this.setState({isOpen: true})} // Export button in Kepler UI was clicked

    render() {
        console.log("this.props", this.props)
        console.log("this.state.isOpen", this.state.isOpen)
        return (
            <div>
                {/* TODO hardcoded this.props.mapData.visState.layers.length . Change to something more scalable */}
                {this.props.mapData && this.props.mapData.visState.layers.length == 2 && this.props.mapData.visState.filters && <RenderSettingsModal isOpen={this.state.isOpen} handleClose={this.handleClose.bind(this)} mapData={this.props.mapData}/>}
                {/* <RenderSettingsModal isOpen={this.props.uiState.hubbleExportModalOpen} handleClose={this.handleClose.bind(this)} mapData={this.props}/> */}
                {/* <ThemeProvider theme={RenderSettingsModal}></ThemeProvider> */}
                <h1>Use this button to export an animation using Hubble <button onClick={() => this.handleExport()}>Export</button></h1> {/* anonymous function to bind state onclick  */}
            </div>
        )
    }
};

console.log("mapStateToProps", mapStateToProps)
console.log("mapDispatchToProps", mapDispatchToProps)
// console.log("this.props", this.props)

// keplerGlConnect is a wrapper of Redux's standard connect w/ access to Kepler's Redux store
export default connect(mapStateToProps, mapDispatchToProps)(withTheme(HubbleExport));
// export default keplerGlConnect(mapStateToProps, mapDispatchToProps); // Object(...) is not a function