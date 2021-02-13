# webRTC 示例项目

本示例源自亢少军老师的 《WebRTC 视频教程-H5》 课程。

本示例全部采用 hooks 写法，欢迎小伙伴一起讨论研究。

## 项目环境

- react, hooks
- AntDesign
- Node, webpack, Sass 等

## start Example

1. 直接启动：

   ```bash
   $ cd DEMO-WebRTC

   $ yarn install
   $ yarn start
   ```

2. 使用你自己的 SSL 证书：
   - 替换`/configs`文件夹下的 SSL 证书
     - cert 文件：`/configs/cert.pem`
     - key 文件：`/configs/key.pem`
   - 如果改动了文件名，请修改相应的`package.json`下的启动路径
     - "start": "webpack-dev-server --config ./webpack.config.js --mode development --open --https --cert 《你的 cert 路径》 --key 《你的 key 路径》"

## TODO

- [] 解决远端推视频流黑屏问题
- [] 优化组件外部变量和内部 hooks
- [] 编写 webrtc hooks 库
