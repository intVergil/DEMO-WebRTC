import React, { useEffect, useRef, useState } from "react";
import { Button, Select, Modal } from "antd";

import SoundMeter from "../utils/soundMeter";
import "../../styles/css/media-settings.scss";

const { Option } = Select;

const initialState = {
  visible: false,
  videoDevices: [],
  audioDevices: [],
  audioOutputDevices: [],
  resolution: "vga",
  selectedAudioDevice: "",
  selectedVideoDevice: "",
  audioLevel: 0,
};

let soundMeter;

const MediaSettings = () => {
  const videoRef = useRef();
  const progressbarRef = useRef();
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (window.localStorage) {
      let deviceInfo = localStorage["deviceInfo"];
      if (deviceInfo) {
        let info = JSON.parse(deviceInfo);
        setState({
          ...state,
          selectedAudioDevice: info.audioDevice,
          selectedVideoDevice: info.videoDevice,
          resolution: info.resolution,
        });
      }
    }

    updateDevices().then((data) => {
      if (state.selectedAudioDevice === "" && data.audioDevices.length > 0) {
        setState({
          ...state,
          selectedAudioDevice: data.audioDevices[0].deviceId,
        });
      }

      if (state.selectedVideoDevice === "" && data.videoDevices.length > 0) {
        setState({
          ...state,
          selectedVideoDevice: data.videoDevices[0].deviceId,
        });
      }

      setState({
        ...state,
        videoDevices: data.videoDevices,
        audioDevices: data.audioDevices,
        audioOutputDevices: data.audioOutputDevices,
      });
    });
  }, []);

  async function updateDevices() {
    try {
      let videoDevices = [];
      let audioDevices = [];
      let audioOutputDevices = [];
      const devices = await navigator.mediaDevices.enumerateDevices();
      for (let device of devices) {
        switch (device.kind) {
          case "videoinput":
            videoDevices.push(device);
            break;
          case "audioinput":
            audioDevices.push(device);
            break;
          case "audiooutput":
            audioOutputDevices.push(device);
            break;
        }
      }
      return {
        videoDevices,
        audioDevices,
        audioOutputDevices,
      };
    } catch (error) {
      console.log(error);
    }
  }

  function soundMeterProcess() {
    const val = soundMeter.instant.toFixed(2) * 348 + 1;
    setState((prevState) => {
      return { ...prevState, audioLevel: val };
    });
    if (state.visible) {
      setTimeout(soundMeterProcess, 100);
    }
  }

  function stopPreview() {
    if (window.stream) {
      closeMediaStream(window.stream);
    }
  }

  async function startPreview() {
    if (window.stream) {
      closeMediaStream(window.stream);
    }

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    soundMeter = new SoundMeter(audioContext);

    const audioSource = state.selectedAudioDevice;
    const videoSource = state.selectedVideoDevice;

    const constraints = {
      audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
      video: { deviceId: videoSource ? { exact: videoSource } : undefined },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      soundMeter.connectToSource(stream);
      setTimeout(soundMeterProcess, 100);

      return navigator.mediaDevices.enumerateDevices();
    } catch (error) {
      console.log(error);
    }
  }

  function closeMediaStream(stream) {
    if (!stream) return;

    let tracks, i, len;
    if (stream.getTracks) {
      tracks = stream.getTracks();
      for (i = 0, len = tracks.length; i < len; i += 1) {
        tracks[i].stop();
      }
    } else {
      tracks = stream.getAudioTracks();
      for (i = 0, len = tracks.length; i < len; i += 1) {
        tracks[i].stop();
      }

      tracks = stream.getVideoTracks();
      for (i = 0, len = tracks.length; i < len; i += 1) {
        tracks[i].stop();
      }
    }
  }

  function showModal() {
    setState({ ...state, visible: true });
    setTimeout(startPreview, 100);
  }

  function handleOk(e) {
    setState({ ...state, visible: false });
    if (window.localStorage) {
      let deviceInfo = {
        audioDevice: state.selectedAudioDevice,
        videoDevice: state.selectedVideoDevice,
        resolution: state.resolution,
      };
      localStorage["deviceInfo"] = JSON.stringify(deviceInfo);
    }
    stopPreview();
  }

  function handleCancel() {
    setState({ ...state, visible: false });
    stopPreview();
  }

  function handleAudioDeviceChange(e) {
    setState({ ...state, selectedAudioDevice: e });
    setTimeout(startPreview, 100);
  }

  function handleVideoDeviceChange(e) {
    setState({ ...state, selectedVideoDevice: e });
    setTimeout(startPreview, 100);
  }

  function handleResolutionChange(e) {
    setState({ ...state, resolution: e });
  }

  return (
    <div className="container">
      <h1>
        <span>设置综合示例</span>
      </h1>
      <Button onClick={showModal}>修改设备</Button>
      <Modal
        title="修改设备"
        visible={state.visible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
      >
        <div className="item">
          <span className="item-left">麦克风</span>
          <div className="item-right">
            <Select
              value={state.selectedAudioDevice}
              style={{ width: 350 }}
              onChange={handleAudioDeviceChange}
            >
              {state.audioDevices.map((device, index) => {
                return (
                  <Option value={device.deviceId} key={device.deviceId}>
                    {device.label}
                  </Option>
                );
              })}
            </Select>
            <div
              ref={progressbarRef}
              style={{
                width: state.audioLevel + "px",
                height: "10px",
                backgroundColor: "#8dc63f",
                marginTop: "20px",
              }}
            />
          </div>
        </div>
        <div className="item">
          <span className="item-left">摄像头</span>
          <div className="item-right">
            <Select
              value={state.selectedVideoDevice}
              style={{ width: 350 }}
              onChange={handleVideoDeviceChange}
            >
              {state.videoDevices.map((device, index) => {
                return (
                  <Option value={device.deviceId} key={device.deviceId}>
                    {device.label}
                  </Option>
                );
              })}
            </Select>
            <div className="video-container">
              <video
                id="previewVideo"
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        </div>
        <div className="item">
          <span className="item-left">清晰度</span>
          <div className="item-right">
            <Select
              style={{ width: 350 }}
              value={state.resolution}
              onChange={handleResolutionChange}
            >
              <Option value="qvga">流畅(320x240)</Option>
              <Option value="vga">标清(640x360)</Option>
              <Option value="hd">高清(1280x720)</Option>
              <Option value="fullhd">超清(1920x1080)</Option>
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MediaSettings;
