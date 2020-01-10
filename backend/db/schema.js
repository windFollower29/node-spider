const { Schema } = require('./config')
const { Types } = Schema

const goodsSchema = {
  id: String,
  label: String,
  img: String,
  price: Number,
  sku: Types.Mixed
}

module.exports = {
  goodsSchema
}