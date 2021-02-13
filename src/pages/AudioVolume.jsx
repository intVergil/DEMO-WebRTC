import React, { useState, useRef } from "react";
import { Button } from "antd";

import SoundMeter from "../utils/soundMeter";

const AudioVolume = () => {
  const soundMeter = useRef();
  const [audioLevel, setAudioLevel] = useState(0);

  async function start() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();

      soundMeter.current = new SoundMeter(audioContext);

      const constraints = { audio: true, video: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      soundMeter.current.connectToSource(stream);
      setTimeout(soundMeterProcess, 100);
    } catch (e) {
      console.log("网页音频API不支持.");
      console.log("getUserMedia error:", error.message, error.name);
    }
  }

  function soundMeterProcess() {
    const val = soundMeter.current.instant.toFixed(2) * 348 + 1;
    setAudioLevel(val);
    setTimeout(soundMeterProcess, 100);
  }

  return (
    <div className="container">
      <h1>
        <span>音量检测示例</span>
      </h1>
      <div
        style={{
          width: audioLevel,
          height: 10,
          background: "#8dc63f",
          marginTop: 20,
          marginBottom: 20,
        }}
      />
      <Button onClick={start}>开始检测</Button>
    </div>
  );
};

export default AudioVolume;
