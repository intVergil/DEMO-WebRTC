import React, { useRef } from "react";
import { Button } from "antd";

const Camera = () => {
  const videoRef = useRef();

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

  return (
    <div className="container">
      <h1>
        <span>摄像头示例</span>
      </h1>
      <video className="video" ref={videoRef} autoPlay playsInline />
      <Button onClick={openCamera}>打开摄像头</Button>
    </div>
  );
};

export default Camera;
