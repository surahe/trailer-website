const mongoose = require('mongoose')
const glob = require('glob')
const {resolve} = require('path')
const db = 'mongodb://localhost/douban-trailer'

mongoose.Promise = global.Promise

exports.initSchemas = () => {
  glob.sync(resolve(__dirname, './schema', '**/*.js')).forEach(require)
}

exports.initAdmin = async () => {
  const User = mongoose.model('User')
  let user = await User.findOne({
    username: 'sura'
  })

  if (!user) {
    const user = new User({
      username: 'sura',
      email: 'lei@qq.com',
      password: '123456',
      role: 'admin'
    })

    await user.save()
  }
}

exports.connect = () => {
  return new Promise((resolve, reject) => {
    let maxConnectTimes = 0

    if (process.env.NODE_ENV !== 'production') {
      mongoose.set('debug', true)
    }

    mongoose.connect(db)


    mongoose.connection.on('disconnected', () => {
      maxConnectTimes++
      if (maxConnectTimes < 5) {
        mongoose.connect(db)
      } else {
        throw new Error('数据库连接失败，重连已达到最大次数')
      }
    })

    mongoose.connection.on('error', err => {
      console.log(err)
      maxConnectTimes++
      if (maxConnectTimes < 5) {
        mongoose.connect(db)
      } else {
        throw new Error('数据库连接失败，重连已达到最大次数')
      }
    })

    mongoose.connection.once('open', () => {
      resolve()
      console.log('MongoDB Connected successfully!')
    })
  })
}