
const { Schema, model } = require('./config')

const { goodsSchema } = require('./schema')

let GoodsSchema = new Schema(goodsSchema)

const GoodsModel = model('goods', GoodsSchema)

module.exports = {
  GoodsModel
}