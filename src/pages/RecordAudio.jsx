import React, { useRef, useState } from "react";
import { Button } from "antd";

import "../../styles/css/record-audio.scss";

let mediaRecorder;
let recordedBlobs;
let stream;

const RecordAudio = () => {
  const [status, setStatus] = useState("start");
  const audioPlayerRef = useRef();

  async function startClickHandler() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus("startRecord");
    } catch (e) {
      console.log("navigator.mediaDevices.getUserMedia:", e);
    }
  }

  function startRecordButtonClickHandler() {
    recordedBlobs = [];
    let options = { mineType: "audio/*;" };
    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      return console.log("MediaRecorder:", e);
    }
    mediaRecorder.onstop = (event) => {
      console.log("Recorder stopped:", event);
      console.log("Recorder blobs:", recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10);
    setStatus("stopRecord");
  }

  function stopRecordButtonClickHandler() {
    mediaRecorder.stop();
    setStatus("play");
  }

  function playButtonClickHandler() {
    const blob = new Blob(recordedBlobs, { type: "audio/*" });
    audioPlayerRef.current.src = null;
    audioPlayerRef.current.src = window.URL.createObjectURL(blob);
    audioPlayerRef.current.play();
    setStatus("download");
  }

  function downloadButtonClickHandler() {
    const blob = new Blob(recordedBlobs, { type: "audio/*" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "test.mp3";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
    setStatus("start");
  }

  function handleDataAvailable(event) {
    event.data && event.data.size > 0 && recordedBlobs.push(event.data);
  }

  return (
    <div className="container">
      <h1>
        <span>示例</span>
      </h1>
      <audio ref={audioPlayerRef} autoPlay controls></audio>
      <div>
        <Button
          className="button"
          onClick={startClickHandler}
          disabled={status !== "start"}
        >
          打开麦克风
        </Button>
        <Button
          className="button"
          onClick={startRecordButtonClickHandler}
          disabled={status !== "startRecord"}
        >
          开始录制
        </Button>
        <Button
          className="button"
          onClick={stopRecordButtonClickHandler}
          disabled={status !== "stopRecord"}
        >
          停止录制
        </Button>
        <Button
          className="button"
          onClick={playButtonClickHandler}
          disabled={status !== "play"}
        >
          播放
        </Button>
        <Button
          className="button"
          onClick={downloadButtonClickHandler}
          disabled={status !== "download"}
        >
          下载
        </Button>
      </div>
    </div>
  );
};

export default RecordAudio;
