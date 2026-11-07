const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.emqx.io:1883');
const TOPIC = 'iot/sensor/data';

client.on('connect', () => {
  console.log('✅ 已连上公共MQTT服务器');
  client.subscribe(TOPIC, (err) => {
    if (!err) {
      console.log('✅ 已订阅主题：', TOPIC);
    }
  });
});

client.on('message', (topic, payload) => {
  try {
    const data = JSON.parse(payload.toString());
    console.log('收到传感器数据：', data);
  } catch (e) {
    console.log('数据解析失败');
  }
});

client.on('error', (err) => {
  console.error('连接出错：', err);
});
