const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mqtt = require('mqtt');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 静态资源，访问public文件夹里的html页面
app.use(express.static('public'));

// MQTT配置，和publisher保持一致
const mqttClient = mqtt.connect("mqtt://broker.emqx.io");
const topic = "iot/sensor/data";

mqttClient.on('connect', () => {
  console.log("✅ 后端已连接MQTT服务器，订阅主题：", topic);
  mqttClient.subscribe(topic);
});

// 收到MQTT消息，转发给前端网页
mqttClient.on('message', (_, payload) => {
  const dataStr = payload.toString();
  console.log("收到MQTT传感器数据：", dataStr);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(dataStr);
    }
  });
});

// 前端网页websocket连接
wss.on('connection', () => {
  console.log("🌐 有前端页面连接进来");
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 服务启动成功，访问地址：http://127.0.0.1:${PORT}`);
});

