import React, { useRef } from "react";
import { Select } from "antd";

const { Option } = Select;

const qvgaConstraints = {
  video: { width: { exact: 320 }, height: { exact: 240 } },
};
const vgaConstraints = {
  video: { width: { exact: 640 }, height: { exact: 480 } },
};
const hdConstraints = {
  video: { width: { exact: 1280 }, height: { exact: 720 } },
};
const fullHdConstraints = {
  video: { width: { exact: 1920 }, height: { exact: 1080 } },
};
const twoKConstraints = {
  video: { width: { exact: 2560 }, height: { exact: 1440 } },
};
const fourKConstraints = {
  video: { width: { exact: 4096 }, height: { exact: 2160 } },
};

let stream;

const Resolution = () => {
  const videoRef = useRef();

  async function getMedia(constraints) {
    try {
      stream && stream.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.log("getUserMedia错误:", error);
    }
  }

  function getDynamicMedia(constraints) {
    try {
      const track = stream && stream.getVideoTracks()[0];
      track.applyConstraints(constraints);
      console.log("动态改变分辨率成功...");
    } catch (error) {
      console.log("动态改变分辨率错误...", error.name);
    }
  }

  function handChange(value) {
    switch (value) {
      case "qvga":
        getMedia(qvgaConstraints);
        break;
      case "vga":
        getMedia(vgaConstraints);
        break;
      case "hd":
        getMedia(hdConstraints);
        break;
      case "fullhd":
        getMedia(fullHdConstraints);
        break;
      case "2k":
        getMedia(twoKConstraints);
        break;
      case "4k":
        getMedia(fourKConstraints);
        break;
      default:
        getMedia(vgaConstraints);
        break;
    }
  }

  function dynamicChange(value) {
    switch (value) {
      case "qvga":
        getDynamicMedia(qvgaConstraints);
        break;
      case "vga":
        getDynamicMedia(vgaConstraints);
        break;
      case "hd":
        getDynamicMedia(hdConstraints);
        break;
      case "fullhd":
        getDynamicMedia(fullHdConstraints);
        break;
      case "2k":
        getDynamicMedia(twoKConstraints);
        break;
      case "4k":
        getDynamicMedia(fourKConstraints);
        break;
      default:
        getDynamicMedia(vgaConstraints);
        break;
    }
  }

  return (
    <div className="container">
      <h1>
        <span>摄像头示例</span>
      </h1>
      <video className="video" ref={videoRef} autoPlay playsInline />
      <div>
        <label>设置（stream）</label>
        <Select
          defaultValue="vga"
          style={{ width: "100px", marginLeft: "20px" }}
          onChange={handChange}
        >
          <Option value="qvga">QVGA</Option>
          <Option value="vga">VGA</Option>
          <Option value="hd">高清</Option>
          <Option value="fullhd">超清</Option>
          <Option value="2k">2K</Option>
          <Option value="4k">4K</Option>
          <Option value="8k">8K</Option>
        </Select>
      </div>
      <br />
      <div>
        <label>动态设置（track）</label>
        <Select
          defaultValue="vga"
          style={{ width: "100px", marginLeft: "20px" }}
          onChange={dynamicChange}
        >
          <Option value="qvga">QVGA</Option>
          <Option value="vga">VGA</Option>
          <Option value="hd">高清</Option>
          <Option value="fullhd">超清</Option>
          <Option value="2k">2K</Option>
          <Option value="4k">4K</Option>
          <Option value="8k">8K</Option>
        </Select>
      </div>
    </div>
  );
};

export default Resolution;
