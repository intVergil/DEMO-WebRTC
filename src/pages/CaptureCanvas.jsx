import React, { useRef, useEffect } from "react";
import { Button } from "antd";

import "../../styles/css/capture-canvas.scss";

let context;

const CaptureCanvas = () => {
  const canvasRef = useRef();
  const videoRef = useRef();

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

  async function startCaptureCanvas() {
    const stream = await canvasRef.current.captureStream(10);
    videoRef.current.srcObject = stream;
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
        <Button onClick={startCaptureCanvas}>开启同步</Button>
      </div>
    </div>
  );
};

export default CaptureCanvas;
