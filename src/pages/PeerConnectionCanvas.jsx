import React, { useRef } from "react";
import { Button } from "antd";

import "../../styles/css/pc-canvas.scss";

let context;
let localStream;
let peerConnA;
let peerConnB;

const PeerConnectionCanvas = () => {
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null);

  async function startCaptureCanvas() {
    localStream = canvasRef.current.captureStream(10);
    drawLine();
  }

  function drawLine() {
    context = canvasRef.current.getContext("2d");

    context.fillStyle = "#CCC";
    context.fillRect(0, 0, 320, 240);

    context.lineWidth = 1;
    context.strokeStyle = "#FF0000";

    canvasRef.current.addEventListener("mousedown", startAction);
    canvasRef.current.addEventListener("mouseup", endAction);
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

  async function call() {
    //视频轨道
    const videoTracks = localStream.getVideoTracks();
    //音频轨道
    const audioTracks = localStream.getAudioTracks();
    //判断视频轨道是否有值
    if (videoTracks.length > 0) {
      //输出摄像头的名称
      console.log(`使用的视频设备为: ${videoTracks[0].label}`);
    }
    //判断音频轨道是否有值
    if (audioTracks.length > 0) {
      //输出麦克风的名称
      console.log(`使用的音频设备为: ${audioTracks[0].label}`);
    }

    let configuration = {
      iceServers: [{ url: "stun:stun.l.google.com:19302" }],
    };

    peerConnA = new RTCPeerConnection(configuration);
    peerConnA.addEventListener("icecandidate", onIceCandidateA);

    peerConnB = new RTCPeerConnection(configuration);
    peerConnB.addEventListener("icecandidate", onIceCandidateB);

    peerConnA.addEventListener("iceconnectionstatechange", onIceStateChangeA);
    peerConnB.addEventListener("iceconnectionstatechange", onIceStateChangeB);

    peerConnB.addEventListener("track", gotRemoteStream);

    localStream.getTracks().forEach((track) => {
      peerConnA.addTrack(track, localStream);
    });

    try {
      const offer = await peerConnA.createOffer();
      await onCreateOfferSuccess(offer);
    } catch (e) {
      onCreateSessionDescriptionError(e);
    }
  }

  async function onCreateOfferSuccess(desc) {
    console.log(`peerConnA创建Offer返回的SDP信息\n${desc.sdp}`);
    console.log("设置peerConnA的本地描述start");
    try {
      await peerConnA.setLocalDescription(desc);
      onSetLocalSuccess(peerConnA);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }

    try {
      await peerConnB.setRemoteDescription(desc);
      onSetRemoteSuccess(peerConnB);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }

    try {
      const answer = await peerConnB.createAnswer();
      onCreateAnswerSuccess(answer);
    } catch (e) {
      onCreateSessionDescriptionError(e);
    }
  }

  async function onCreateAnswerSuccess(desc) {
    console.log(`peerConnB的应答Answer数据:\n${desc.sdp}`);
    console.log("peerConnB设置本地描述开始:setLocalDescription");
    try {
      await peerConnB.setLocalDescription(desc);
      onSetLocalSuccess(peerConnB);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }

    try {
      await peerConnA.setRemoteDescription(desc);
      onSetRemoteSuccess(peerConnA);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }
  }

  function onIceStateChangeA(event) {
    console.log(`peerConnA连接的ICE状态: ${peerConnA.iceConnectionState}`);
    console.log("ICE状态改变事件: ", event);
  }

  function onIceStateChangeB(event) {
    console.log(`peerConnB连接的ICE状态: ${peerConnA.iceConnectionState}`);
    console.log("ICE状态改变事件: ", event);
  }

  function onSetLocalSuccess(pc) {
    console.log(`${getName(pc)}设置本地描述完成:setLocalDescription`);
  }

  function onSetRemoteSuccess(pc) {
    console.log(`${getName(pc)}设置远端描述完成:setRemoteDescription`);
  }

  function getName(pc) {
    return pc === peerConnA ? "peerConnA" : "peerConnB";
  }

  function onCreateSessionDescriptionError(error) {
    console.log(`创建会话描述SD错误: ${error.toString()}`);
  }

  function onSetSessionDescriptionError(error) {
    console.log(`设置会话描述SD错误: ${error.toString()}`);
  }

  async function onIceCandidateA(event) {
    try {
      if (event.candidate) {
        await peerConnB.addIceCandidate(event.candidate);
        onAddIceCandidateSuccess(peerConnB);
      }
    } catch (e) {
      onAddIceCandidateError(peerConnA, e);
    }
    console.log(
      `IceCandidate数据:\n${
        event.candidate ? event.candidate.candidate : "(null)"
      }`
    );
  }

  async function onIceCandidateB(event) {
    try {
      if (event.candidate) {
        await peerConnA.addIceCandidate(event.candidate);
        onAddIceCandidateSuccess(peerConnA);
      }
    } catch (e) {
      onAddIceCandidateError(peerConnB, e);
    }
    console.log(
      `IceCandidate数据:\n${
        event.candidate ? event.candidate.candidate : "(null)"
      }`
    );
  }

  function onAddIceCandidateSuccess(pc) {
    console.log(`${getName(pc)}添加IceCandidate成功`);
  }

  function onAddIceCandidateError(pc, error) {
    console.log(`${getName(pc)}添加IceCandidate失败: ${error.toString()}`);
  }

  function gotRemoteStream(e) {
    if (remoteVideoRef.current.srcObject !== e.streams[0]) {
      remoteVideoRef.current.srcObject = e.streams[0];
    }
  }

  function hangup() {
    console.log("结束会话");
    peerConnA.close();
    peerConnB.close();
    peerConnA = null;
    peerConnB = null;
  }

  return (
    <div className="container">
      <h1>
        <span>示例</span>
      </h1>
      <div className="small-canvas">
        <canvas ref={canvasRef} width={320} height={210} />
      </div>
      <video
        className="small-video"
        ref={remoteVideoRef}
        playsInline
        autoPlay
      />
      <div>
        <Button onClick={startCaptureCanvas}>开始</Button>
        <Button onClick={call}>呼叫</Button>
        <Button onClick={hangup}>挂断</Button>
      </div>
    </div>
  );
};

export default PeerConnectionCanvas;
