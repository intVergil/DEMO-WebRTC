import React, { useRef, useEffect, useState } from "react";
import { Button } from "antd";

import "../../styles/css/record-canvas.scss";

let mediaRecorder;
let recordedBlobs;
let stream;
let context;

const RecordCanvas = () => {
  const canvasRef = useRef();
  const videoRef = useRef();
  const [status, setStatus] = useState("start");

  useEffect(() => {
    canvasRef &&
      canvasRef.current &&
      canvasRef.current.addEventListener &&
      drawLine();
  });

  function drawLine() {
    context = canvasRef.current.getContext("2d");
    context.fillStyle = "#CCC";
    context.fillRect(0, 0, 320, 240);
    context.lineWidth = 1;
    context.strokeStyle = "#FF0000";

    canvasRef.current.addEventListener("mousedown", startAction);
    canvasRef.current.addEventListener("mouseup", endAction);
    return () => {
      canvasRef.current.removeEventListener("mousedown", startAction);
      canvasRef.current.removeEventListener("mouseup", endAction);
    };
  }

  function startAction(event) {
    context.beginPath();
    context.moveTo(event.offsetX, event.offsetY);
    context.stroke();

    canvasRef.current.addEventListener("mousemove", moveAction);
  }

  function moveAction(event) {
    context.lineTo(event.offsetX, event.offsetY);
    context.stroke();
  }

  function endAction() {
    canvasRef.current.removeEventListener("mousemove", moveAction);
  }

  async function startCaptureCanvas() {
    stream = canvasRef.current.captureStream(10);
    videoRef.current.srcObject = stream;
    startRecord();
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
    try {
      mediaRecorder.stop();
      setStatus("start");
    } catch (e) {
      console.log(e);
    }
    const blob = new Blob(recordedBlobs, { type: "video/webm" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "canvas.webm";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
  function handleDataAvailable(event) {
    event.data && event.data.size > 0 && recordedBlobs.push(event.data);
  }

  return (
    <div className="container">
      <h1>
        <span>示例</span>
      </h1>
      <div className="small-canvas">
        <canvas ref={canvasRef} width={320} height={210} />
      </div>
      <video className="small-video" ref={videoRef} playsInline autoPlay />
      <div>
        <Button
          className="button"
          onClick={startCaptureCanvas}
          disabled={status !== "start"}
        >
          开始
        </Button>
        <Button
          className="button"
          onClick={stopRecord}
          disabled={status !== "stop"}
        >
          停止
        </Button>
      </div>
    </div>
  );
};

export default RecordCanvas;
