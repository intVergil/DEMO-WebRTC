import React, { useRef } from "react";

const CaptureVideo = () => {
  const sourceRef = useRef();
  const playerRef = useRef();

   function canPlay() {
    //侦率
    const fps = 0;
    const stream = sourceRef.current.captureStream(fps);
    playerRef.current.srcObject = stream;
  }

  return (
    <div className="container">
      <h1>
        <span>示例</span>
      </h1>
      <video
        className="video"
        ref={sourceRef}
        controls
        loop
        muted
        playsInline
        onCanPlay={canPlay}
      >
        <source src="./assets/webrtc.mp4" type="video/mp4" />
      </video>
      <video className="video" ref={playerRef} playsInline autoPlay controls/>
    </div>
  );
};

export default CaptureVideo;
