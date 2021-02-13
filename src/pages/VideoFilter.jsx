import React, { useRef, useEffect } from "react";
import { message, Select } from "antd";

import "../../styles/css/video-filter.scss";

const { Option } = Select;

const VideoFilter = () => {
  const videoRef = useRef();

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

  function handChange(value) {
    videoRef.current.className = value;
  }

  return (
    <div className="container">
      <h1>
        <span>视频滤镜示例</span>
      </h1>
      <video ref={videoRef} autoPlay playsInline></video>
      <Select
        defaultValue="none"
        style={{ width: "100px" }}
        onChange={handChange}
      >
        <Option value="none">没有滤镜</Option>
        <Option value="blur">模糊</Option>
        <Option value="grayscale">灰度</Option>
        <Option value="invert">反转</Option>
        <Option value="sepia">深褐色</Option>
      </Select>
    </div>
  );
};

export default VideoFilter;
