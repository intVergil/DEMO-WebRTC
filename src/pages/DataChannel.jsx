import React, { useRef } from "react";
import { Button } from "antd";

import "../../styles/css/datachannel.scss";

let localConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;

const DataChannel = () => {
  const dataChannelSendRef = useRef();
  const dataChannelReceiveRef = useRef();
  async function call() {
    let configuration = {
      iceServers: [{ url: "stun:stun.l.google.com:19302" }],
    };

    localConnection = new RTCPeerConnection(configuration);
    localConnection.addEventListener("icecandidate", onLocalIceCandidate);

    sendChannel = localConnection.createDataChannel("webrtc-datachannel");
    sendChannel.onopen = onSendChannelStateChange;
    sendChannel.onclose = onSendChannelStateChange;

    remoteConnection = new RTCPeerConnection(configuration);
    remoteConnection.addEventListener("icecandidate", onRemoteIceCandidate);

    localConnection.addEventListener(
      "iceconnectionstatechange",
      onLocalIceStateChange
    );
    remoteConnection.addEventListener(
      "iceconnectionstatechange",
      onRemoteIceStateChange
    );

    remoteConnection.ondatachannel = receiveChannelCallback;

    try {
      const offer = await localConnection.createOffer();
      await onCreateOfferSuccess(offer);
    } catch (e) {
      onCreateSessionDescriptionError(e);
    }
  }

  function onSendChannelStateChange() {
    const readyState = sendChannel.readyState;
    console.log("发送通道状态:" + readyState);
  }

  function onReceiveChannelStateChange() {
    const readyState = receiveChannel.readyState;
    console.log("接收通道状态:" + readyState);
  }

  function sendData() {
    const data = dataChannelSendRef.current.value;
    sendChannel.send(data);
  }

  function receiveChannelCallback(event) {
    receiveChannel = event.channel;
    receiveChannel.onmessage = onReceiveMessageCallBack;
    receiveChannel.onopen = onReceiveChannelStateChange;
    receiveChannel.onclose = onReceiveChannelStateChange;
  }

  function onReceiveMessageCallBack(event) {
    dataChannelReceiveRef.current.value = event.data;
  }

  async function onCreateOfferSuccess(desc) {
    console.log(`localConnection创建Offer返回的SDP信息\n${desc.sdp}`);
    console.log("设置localConnection的本地描述start");
    try {
      await localConnection.setLocalDescription(desc);
      onSetLocalSuccess(localConnection);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }

    try {
      await remoteConnection.setRemoteDescription(desc);
      onSetRemoteSuccess(remoteConnection);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }

    try {
      const answer = await remoteConnection.createAnswer();
      onCreateAnswerSuccess(answer);
    } catch (e) {
      onCreateSessionDescriptionError(e);
    }
  }

  async function onCreateAnswerSuccess(desc) {
    console.log(`remoteConnection的应答Answer数据:\n${desc.sdp}`);
    console.log("remoteConnection设置本地描述开始:setLocalDescription");
    try {
      await remoteConnection.setLocalDescription(desc);
      onSetLocalSuccess(remoteConnection);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }

    try {
      await localConnection.setRemoteDescription(desc);
      onSetRemoteSuccess(localConnection);
    } catch (e) {
      onSetSessionDescriptionError(e);
    }
  }

  function onLocalIceStateChange(event) {
    console.log(
      `localConnection连接的ICE状态: ${localConnection.iceConnectionState}`
    );
    console.log("ICE状态改变事件: ", event);
  }

  function onRemoteIceStateChange(event) {
    console.log(
      `remoteConnection连接的ICE状态: ${localConnection.iceConnectionState}`
    );
    console.log("ICE状态改变事件: ", event);
  }

  function onSetLocalSuccess(pc) {
    console.log(`${getName(pc)}设置本地描述完成:setLocalDescription`);
  }

  function onSetRemoteSuccess(pc) {
    console.log(`${getName(pc)}设置远端描述完成:setRemoteDescription`);
  }

  function getName(pc) {
    return pc === localConnection ? "localConnection" : "remoteConnection";
  }

  function onCreateSessionDescriptionError(error) {
    console.log(`创建会话描述SD错误: ${error.toString()}`);
  }

  function onSetSessionDescriptionError(error) {
    console.log(`设置会话描述SD错误: ${error.toString()}`);
  }

  async function onLocalIceCandidate(event) {
    try {
      if (event.candidate) {
        await remoteConnection.addIceCandidate(event.candidate);
        onAddIceCandidateSuccess(remoteConnection);
      }
    } catch (e) {
      onAddIceCandidateError(localConnection, e);
    }
    console.log(
      `IceCandidate数据:\n${
        event.candidate ? event.candidate.candidate : "(null)"
      }`
    );
  }

  async function onRemoteIceCandidate(event) {
    try {
      if (event.candidate) {
        await localConnection.addIceCandidate(event.candidate);
        onAddIceCandidateSuccess(localConnection);
      }
    } catch (e) {
      onAddIceCandidateError(remoteConnection, e);
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

  function hangup() {
    console.log("结束会话");
    localConnection.close();
    remoteConnection.close();
    localConnection = null;
    remoteConnection = null;
  }

  return (
    <div className="container">
      <h1>
        <span>示例</span>
      </h1>
      <div>
        <div>
          <h2>发送</h2>
          <textarea
            ref={dataChannelSendRef}
            disabled={false}
            placeholder="请输入要发送的文本..."
          />
        </div>
        <div>
          <h2>接收</h2>
          <textarea ref={dataChannelReceiveRef} disabled={false} />
        </div>
      </div>
      <Button onClick={call}>呼叫</Button>
      <Button onClick={sendData}>发送</Button>
      <Button onClick={hangup}>挂断</Button>
    </div>
  );
};

export default DataChannel;
