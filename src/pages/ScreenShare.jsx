import React, { useRef } from "react";
import { Button } from "antd";

const ScreenSharing = () => {
  const shareRef = useRef();

  async function startScreenShare() {
    try {
      const constraints = { audio: false, video: true };
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      shareRef.current.srcObject = stream;
    } catch (error) {
      message.error("getUserMedia错误:", error);
    }
  }

  return (
    <div className="container">
      <h1>
        <span>共享屏幕示例</span>
      </h1>
      <video ref={shareRef} autoPlay playsInline />
      <Button onClick={startScreenShare}>开始共享</Button>
    </div>
  );
};

export default ScreenSharing;
