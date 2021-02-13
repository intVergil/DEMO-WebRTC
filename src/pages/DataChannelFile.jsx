import React, { useEffect, useRef } from "react";
import { Button } from "antd";

let localConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;
let fileReader;
let receiveBuffer = [];
let receivedSize = 0;

const DataChannelFile = () => {
  const sendProgressRef = useRef();
  const receiveProgressRef = useRef();
  const fileInputRef = useRef();
  const downloadRef = useRef();

  useEffect(() => {
    fileInputRef &&
      fileInputRef.current &&
      fileInputRef.current.addEventListener &&
      init();
  });

  async function init() {
    const fileListener = async () => {
      const file = fileInputRef.current.files[0];
      if (!file) {
        console.log("没有选择文件");
      } else {
        console.log("选择的文件是:" + file.name);
      }
    };
    fileInputRef.current.addEventListener("change", fileListener);
    return () => {
      fileInputRef.current.removeEventListener("change", fileListener);
    };
  }

  async function startSendFile() {
    localConnection = new RTCPeerConnection();
    localConnection.addEventListener("icecandidate", onLocalIceCandidate);

    sendChannel = localConnection.createDataChannel("webrtc-datachannel");
    sendChannel.binaryType = "arraybuffer";
    sendChannel.onopen = onSendChannelStateChange;
    sendChannel.onclose = onSendChannelStateChange;

    remoteConnection = new RTCPeerConnection();
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
    if (readyState === "open") {
      sendData();
    }
  }

  function onReceiveChannelStateChange() {
    const readyState = receiveChannel.readyState;
    console.log("接收通道状态:" + readyState);
  }

  function receiveChannelCallback(event) {
    receiveChannel = event.channel;
    receiveChannel.binaryType = "arraybuffer";
    receiveChannel.onmessage = onReceiveMessageCallBack;
    receiveChannel.onopen = onReceiveChannelStateChange;
    receiveChannel.onclose = onReceiveChannelStateChange;
    receivedSize = 0;
  }

  function onReceiveMessageCallBack(event) {
    receiveBuffer.push(event.data);
    receivedSize += event.data.byteLength;
    receiveProgressRef.current.value = receivedSize;

    const file = fileInputRef.current.files[0];
    if (receivedSize === file.size) {
      const received = new Blob(receiveBuffer);
      receiveBuffer = [];
      downloadRef.current.href = URL.createObjectURL(received);
      downloadRef.current.download = file.name;
      downloadRef.current.textContent = `点击下载'${file.name}'&(${file.size} bytes)`;
      downloadRef.current.style.display = "block";
    }
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

  function sendData() {
    let file = fileInputRef.current.files[0];

    sendProgressRef.current.max = file.size;
    receiveProgressRef.current.max = file.size;

    let chunkSize = 16384;
    fileReader = new FileReader();
    let offset = 0;

    fileReader.addEventListener("error", (error) => {
      console.error("读取文件出错:", error);
    });

    fileReader.addEventListener("abort", (event) => {
      console.error("读取文件取消:", event);
    });

    fileReader.addEventListener("load", (e) => {
      sendChannel.send(e.target.result);
      offset += e.target.result.byteLength;
      sendProgressRef.current.value = offset;
      if (offset < file.size) {
        readSlice(offset);
      }
    });
    let readSlice = (o) => {
      let slice = file.slice(offset, o + chunkSize);
      fileReader.readAsArrayBuffer(slice);
    };
    readSlice(0);
  }

  function closeChannel() {
    console.log("结束会话");
    sendChannel.close();
    if (receiveChannel) {
      receiveChannel.close();
    }
    localConnection.close();
    remoteConnection.close();
    localConnection = null;
    remoteConnection = null;
  }

  function cancleSendFile() {
    if (fileReader && fileReader.readyState === 1) {
      console.log("取消读取文件");
      fileReader.abort();
    }
  }

  return (
    <div className="container">
      <h1>
        <span>示例</span>
      </h1>
      <div>
        <form id="fileInfo">
          <input type="file" ref={fileInputRef} name="files" />
        </form>
        <div>
          <h2>发送</h2>
          <progress
            ref={sendProgressRef}
            max="0"
            value="0"
            style={{ width: "500px" }}
          />
        </div>
        <div>
          <h2>接收</h2>
          <progress
            ref={receiveProgressRef}
            max="0"
            value="0"
            style={{ width: "500px" }}
          />
        </div>
      </div>

      <a ref={downloadRef} />
      <Button onClick={startSendFile}>发送</Button>
      <Button onClick={cancleSendFile}>取消</Button>
      <Button onClick={closeChannel}>关闭</Button>
    </div>
  );
};

export default DataChannelFile;
