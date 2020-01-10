
const db = require('mongoose')

const DB_URL = `mongodb://localhost:27017/node-spider`

db.Promise = global.Promise

db.connect(DB_URL, {

})

db.connection.once('connected', () => {
  console.log('connected mongodb!')
})

db.connection.on('error', e => {
  console.log('连接错误：', e)
})

db.connection.on('disconnected', e => {
  console.log('mongodb disconnected')
})

module.exports = db