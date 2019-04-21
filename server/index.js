const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const {resolve} = require('path')
const {connect, initSchemas} = require('./database/init')
 
;(async() => {
  await connect()

  initSchemas()

  require('./tasks/api')
})()

app.use(views(resolve(__dirname, './views'), {
  extension: 'pug'
}))

app.use(async (ctx, next) => {
  await ctx.render('index', {
    you: 'ss',
    me: 'aa'
  })
})

app.listen(8888)