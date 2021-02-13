import React, { useRef, useState, useEffect } from "react";
import { Button, Select } from "antd";

const { Option } = Select;

const DeviceSelect = () => {
  const videoRef = useRef();

  const [state, setState] = useState({
    selectedAudioDevice: "",
    selectedAudioOutputDevice: "",
    selectedVideoDevice: "",
    videoDevices: [],
    audioDevices: [],
    audioOutputDevices: [],
  });

  useEffect(() => {
    updateDevices().then((data) => {
      if (state.selectedAudioDevice === "" && data.audioDevices.length > 0) {
        setState({
          ...state,
          selectedAudioDevice: data.audioDevices[0].deviceId,
        });
      }

      if (
        state.selectedAudioOutputDevice === "" &&
        data.audioOutputDevices.length > 0
      ) {
        setState({
          ...state,
          selectedAudioOutputDevice: data.audioOutputDevices[0].deviceId,
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
      return Promise.resolve({
        videoDevices,
        audioDevices,
        audioOutputDevices,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  function handleAudioDeviceChange(e) {
    setState({ ...state, selectedAudioDevice: e });
    setTimeout(startTest, 100);
  }

  function handleVideoDeviceChange(e) {
    setState({ ...state, selectedVideoDevice: e });
    setTimeout(startTest, 100);
  }

  async function handleAudioOutputDeviceChange(e) {
    setState({ ...state, selectedAudioOutputDevice: e });
    if (typeof videoRef.current.skinId !== "undefined") {
      try {
        await videoRef.current.setSinkId(e);
        console.log("音频输出设备设置成功");
      } catch (error) {
        console.log("音频输出设备设置失败", error);
      }
    } else {
      console.warn("你的浏览器不支持输出设备选择");
    }
  }

  async function startTest() {
    try {
      const audioSource = state.selectedAudioDevice;
      const videoSource = state.selectedVideoDevice;
      const constraints = {
        audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
        video: { deviceId: videoSource ? { exact: videoSource } : undefined },
      };
      const stream = navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="container">
      <h1>
        <span>设备枚举示例</span>
      </h1>
      <Select
        value={state.selectedAudioDevice}
        style={{ width: 150, marginRight: "10px" }}
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
      <Select
        value={state.selectedAudioOutputDevice}
        style={{ width: 150, marginRight: "10px" }}
        onChange={handleAudioOutputDeviceChange}
      >
        {state.audioOutputDevices.map((device, index) => {
          return (
            <Option value={device.deviceId} key={device.deviceId}>
              {device.label}
            </Option>
          );
        })}
      </Select>
      <Select
        value={state.selectedVideoDevice}
        style={{ width: 150 }}
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
      <video
        className="video"
        ref={videoRef}
        autoPlay
        playsInline
        style={{ objectFit: "contain", marginTop: "10px" }}
      />
      <Button onClick={startTest}>测试</Button>
    </div>
  );
};

export default DeviceSelect;
