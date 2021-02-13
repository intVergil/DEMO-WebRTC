import React, { useRef, useEffect } from "react";

const Microphone = () => {
  const audioRef = useRef();

  useEffect(() => {
    openCamera();
  }, []);

  async function openCamera() {
    try {
      const constraints = { audio: true, video: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTracks = stream.getVideoTracks();
      console.log("使用的设备是:" + videoTracks[0]);
      const audioTracks = stream.getAudioTracks();
      console.log("使用的设备是:" + audioTracks[0]);
      audioRef.current.srcObject = stream;
    } catch (error) {
      if (error.name === "PermissionDeniedError") {
        message.error("没有摄像头和麦克风的使用权限,请点击允许按钮");
      }
      message.error("getUserMedia错误:", error);
    }
  }

  return (
    <div className="container">
      <h1>
        <span>麦克风示例</span>
      </h1>
      <audio ref={audioRef} controls autoPlay />
    </div>
  );
};

export default Microphone;
