import React, { useRef, useEffect } from "react";
import { Button } from "antd";

const Canvas = () => {
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    openCamera();
  }, []);

  async function openCamera() {
    try {
      const constraints = { audio: false, video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTracks = stream.getVideoTracks();
      console.log("使用的设备是:" + videoTracks[0]);
      const audioTracks = stream.getAudioTracks();
      console.log("使用的设备是:" + audioTracks[0]);
      videoRef.current.srcObject = stream;
    } catch (error) {
      if (error.name === "ConstraintNotSatisfiedError") {
        const v = constraints.video;
        message.error(`宽:${v.width.exact} 高:${v.height.exact} 设备不支持`);
      } else if (error.name === "PermissionDeniedError") {
        message.error("没有摄像头和麦克风的使用权限,请点击允许按钮");
      }
      message.error("getUserMedia错误:", error);
    }
  }

  async function handleTakeSnap() {
    const w = (canvasRef.current.width = videoRef.current.videoWidth);
    const h = (canvasRef.current.height = videoRef.current.videoHeight);
    canvasRef.current.getContext("2d").drawImage(videoRef.current, 0, 0, w, h);
  }

  return (
    <div className="container">
      <h1>
        <span>截取视频示例</span>
      </h1>
      <video className="small-video" ref={videoRef} autoPlay playsInline />
      <canvas className="small-canvas" ref={canvasRef} />
      <Button onClick={handleTakeSnap}>截屏</Button>
    </div>
  );
};

export default Canvas;
