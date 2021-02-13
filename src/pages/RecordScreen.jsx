import React, { useRef, useState } from "react";
import { Button } from "antd";

let mediaRecorder;
let recordedBlobs;
let stream;

const RecordScreen = () => {
  const videoRef = useRef();
  const [status, setStatus] = useState("start");

  async function startCaptureScreen() {
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 2880, height: 1800 },
      });
      videoRef.current.srcObject = stream;
      startRecord();
    } catch (e) {
      console.log(e);
    }
  }

  function startRecord() {
    stream.addEventListener("inactive", (e) => stopRecord(e));
    recordedBlobs = [];
    try {
      mediaRecorder = new MediaRecorder(stream, { mineType: "video/webm" });
    } catch (e) {
      return console.log("MediaRecorder:", e);
    }
    mediaRecorder.onstop = (event) => {
      console.log("Recorder stopped:", event);
      console.log("Recorder blobs:", recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10);
    setStatus("stop");
  }

  function stopRecord() {
    mediaRecorder.stop();
    setStatus("start");
    const blob = new Blob(recordedBlobs, { type: "video/webm" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "screen.webm";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }

  function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  }

  return (
    <div className="container">
      <h1>
        <span>示例</span>
      </h1>
      <video className="video" ref={videoRef} playsInline autoPlay />
      <Button
        className="button"
        onClick={startCaptureScreen}
        disabled={status !== "start"}
      >
        开始
      </Button>
    </div>
  );
};

export default RecordScreen;
