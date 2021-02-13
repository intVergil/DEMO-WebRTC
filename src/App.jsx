import React from "react";
import { HashRouter as Router, Route } from "react-router-dom";

import Home from "./pages/Home";
import Camera from "./pages/Camera";
import Microphone from "./pages/Microphone";
import Canvas from "./pages/Canvas";
import ScreenSharing from "./pages/ScreenShare";
import VideoFilter from "./pages/VideoFilter";
import Resolution from "./pages/Resolution";
import AudioVolume from "./pages/AudioVolume";
import DeviceSelect from "./pages/DeviceSelect";
import MediaSettings from "./pages/MediaSetting";
import MediaStreamAPI from "./pages/MediaStreamAPI";
import CaptureVideo from "./pages/CaptureVideo";
import CaptureCanvas from "./pages/CaptureCanvas";
import RecordAudio from "./pages/RecordAudio";
import RecordVideo from "./pages/RecordVideo";
import RecordScreen from "./pages/RecordScreen";
import RecordCanvas from "./pages/RecordCanvas";
import PeerConnection from "./pages/PeerConnection";
import PeerConnectionVideo from "./pages/PeerConnectionVideo";
import PeerConnectionCanvas from "./pages/PeerConnectionCanvas";
import DataChannel from "./pages/DataChannel";
import DataChannelFile from "./pages/DataChannelFile";

const App = () => {
  return (
    <Router>
      <div>
        <Route exact path="/" component={Home} />
        <Route exact path="/camera" component={Camera} />
        <Route exact path="/microphone" component={Microphone} />
        <Route exact path="/canvas" component={Canvas} />
        <Route exact path="/screenSharing" component={ScreenSharing} />
        <Route exact path="/videoFilter" component={VideoFilter} />
        <Route exact path="/resolution" component={Resolution} />
        <Route exact path="/audioVolume" component={AudioVolume} />
        <Route exact path="/deviceSelect" component={DeviceSelect} />
        <Route exact path="/mediaSettings" component={MediaSettings} />
        <Route exact path="/mediaStreamAPI" component={MediaStreamAPI} />
        <Route exact path="/captureVideo" component={CaptureVideo} />
        <Route exact path="/captureCanvas" component={CaptureCanvas} />
        <Route exact path="/recordAudio" component={RecordAudio} />
        <Route exact path="/recordVideo" component={RecordVideo} />
        <Route exact path="/recordScreen" component={RecordScreen} />
        <Route exact path="/recordCanvas" component={RecordCanvas} />
        <Route exact path="/peerConnection" component={PeerConnection} />
        <Route
          exact
          path="/peerConnectionVideo"
          component={PeerConnectionVideo}
        />
        <Route
          exact
          path="/peerConnectionCanvas"
          component={PeerConnectionCanvas}
        />
        <Route exact path="/dataChannel" component={DataChannel} />
        <Route exact path="/dataChannelFile" component={DataChannelFile} />
      </div>
    </Router>
  );
};

export default App;
