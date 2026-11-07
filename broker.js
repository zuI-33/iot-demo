const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const port = 1883

server.listen(port, function () {
  console.log('✅ MQTT broker 已经启动，端口 1883')
})
aedes.on('client', (client) => {
  console.log('有客户端连接：', client.id)
})
