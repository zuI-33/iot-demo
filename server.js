require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const mqtt = require('mqtt');
const { WebSocketServer, WebSocket } = require('ws');

const port = Number(process.env.PORT) || 3000;
const url = process.env.MQTT_URL || 'mqtt://localhost:1883';
const topic = process.env.TOPIC || 'iot/demo/temperature';
const MAX_HISTORY = 60;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const history = [];
let brokerConnected = false;

function broadcast(message) {
  const payload = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function setBrokerConnected(connected) {
  if (brokerConnected === connected) return;
  brokerConnected = connected;
  broadcast({ type: 'broker', connected });
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'hello', topic, brokerConnected, history }));
});

const client = mqtt.connect(url, {
  username: process.env.MQTT_USERNAME || undefined,
  password: process.env.MQTT_PASSWORD || undefined,
});

client.on('connect', () => {
  console.log('[SERVER] MQTT connected:', url);
  setBrokerConnected(true);
  client.subscribe(topic, { qos: 0 }, (err) => {
    if (err) {
      console.error('[SERVER] Subscribe error:', err.message);
    } else {
      console.log('[SERVER] Subscribed to:', topic);
    }
  });
});

client.on('message', (t, payload) => {
  if (t !== topic) return;

  let data;
  try {
    data = JSON.parse(payload.toString());
  } catch (err) {
    console.error('[SERVER] Invalid JSON:', payload.toString());
    return;
  }

  history.push(data);
  if (history.length > MAX_HISTORY) history.shift();
  broadcast({ type: 'data', payload: data });
});

client.on('close', () => setBrokerConnected(false));
client.on('offline', () => setBrokerConnected(false));
client.on('error', (err) => console.error('[SERVER] MQTT error:', err.message));

server.listen(port, () => {
  console.log(`[SERVER] Web UI: http://localhost:${port}`);
});
