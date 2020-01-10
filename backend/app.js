const path = require('path')
const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const send = require('koa-send')


const { GoodsModel } = require('./db/model')
const spider = require('./tasks/spider')
// spider()

const index = require('./routes/index')
const users = require('./routes/users')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(async (ctx, next) => {
  console.log(ctx, ctx.path)
  if (ctx.path.includes('.stylesheets')) {

    await send(ctx, path.join('public', ctx.path), {
      hidden: true
    })
    console.log(1111)
  } else {

    await next()
  }
  console.log(999)
})

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  console.log('logggggggg')
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
