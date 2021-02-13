import React, { useRef, useState } from "react";
import { Button } from "antd";

import "../../styles/css/record-video.scss";

let mediaRecorder;
let recordedBlobs;
let stream;

const RecordVideo = () => {
  const videoPreviewRef = useRef();
  const videoPlayerRef = useRef();
  const [status, setStatus] = useState("start");

  async function startClickHandler() {
    let constraints = { audio: true, video: { width: 1280, height: 720 } };
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoPreviewRef.current.srcObject = stream;
      setStatus("startRecord");
    } catch (e) {
      console.log("navigator.mediaDevices.getUserMedia:", e);
    }
  }

  function startRecordButtonClickHandler() {
    recordedBlobs = [];
    let options = { mineType: "video/webm;codecs=vp9" };

    if (!MediaRecorder.isTypeSupported(options.mineType)) {
      console.log("video/webm;codecs=vp9不支持");
      options = { mineType: "video/webm;codecs=vp8" };
      if (!MediaRecorder.isTypeSupported(options.mineType)) {
        console.log("video/webm;codecs=vp8不支持");
        options = { mineType: "video/webm" };
        if (!MediaRecorder.isTypeSupported(options.mineType)) {
          console.log("video/webm不支持");
          options = { mineType: "" };
        }
      }
    }

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
    const blob = new Blob(recordedBlobs, { type: "video/webm" });
    videoPlayerRef.current.src = null;
    videoPlayerRef.current.src = window.URL.createObjectURL(blob);
    videoPlayerRef.current.controls = true;
    videoPlayerRef.current.play();
    setStatus("download");
  }

  function downloadButtonClickHandler() {
    const blob = new Blob(recordedBlobs, { type: "video/webm" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "test.webm";
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
      <video
        className="small-video"
        ref={videoPreviewRef}
        playsInline
        autoPlay
        muted
      />
      <video className="small-video" ref={videoPlayerRef} playsInline loop />
      <div>
        <Button
          className="button"
          onClick={startClickHandler}
          disabled={status !== "start"}
        >
          打开摄像头
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

export default RecordVideo;
