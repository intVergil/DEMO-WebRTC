import React, { useRef } from "react";
import { Button, message } from "antd";

let stream;

const MediaStreamAPI = () => {
  const videoRef = useRef();

  async function openDevice() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
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

  function btnGetTracks() {
    console.log("btnGetTracks()");
    console.log(stream.getTracks());
  }

  function btnGetAudioTracks() {
    console.log("btnGetAudioTracks()");
    console.log(stream.getAudioTracks());
  }

  function btnGetVideoTracks() {
    console.log("btnGetVideoTracks()");
    console.log(stream.getVideoTracks());
  }

  function btnRemoveAudioTracks() {
    console.log("btnGetVideoTracks()");
    stream.removeTrack(stream.getAudioTracks()[0]);
  }

  function btnGetTrackById() {
    console.log("btnGetTrackById()");
    console.log(stream.getTrackById(stream.getAudioTracks()[0].id));
  }

  return (
    <div className="container">
      <h1>
        <span>示例</span>
      </h1>
      <video className="video" ref={videoRef} autoPlay playsInline />
      <Button onClick={openDevice}>打开设备</Button>
      <Button onClick={btnGetTracks}>获取所有轨道</Button>
      <Button onClick={btnGetAudioTracks}>获取音频轨道</Button>
      <Button onClick={btnGetVideoTracks}>获取视频轨道</Button>
      <Button onClick={btnRemoveAudioTracks}>删除音频轨道</Button>
      <Button onClick={btnGetTrackById}>根据Id获取音频轨道</Button>
    </div>
  );
};

export default MediaStreamAPI;
