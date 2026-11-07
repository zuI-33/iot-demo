const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.emqx.io:1883');
const TOPIC = 'iot/sensor/data';

client.on('connect', () => {
  console.log('✅ 发布端连上MQTT服务器，开始发送温湿度');
  setInterval(() => {
    const msg = {
      deviceId: "sensor-001",
      temperature: (20 + Math.random() * 10).toFixed(2),
      humidity: (30 + Math.random() * 20).toFixed(2),
      ts: Date.now()
    };
    client.publish(TOPIC, JSON.stringify(msg));
  }, 2000);
});
