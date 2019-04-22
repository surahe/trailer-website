# http的request获取数据
const rp = require('request-promise-native')

# 批量引入文件
```
const glob = require('glob')

exports.initSchemas = () => {
  glob.sync(resolve(__dirname, './schema', '**/*.js')).forEach(require)
}
```

# 爬虫
## 匹配2个标签中的内容
```
// 包含2个标签在内
$.trim(p.match(/[^<>]+/g)
```

## puppeteer
```
const puppeteer = require('puppeteer')
const url = 'xxx' // 要爬取的页面

const sleep = time => new Promise(resolve => {
  setTimeout(resolve, time)
})

;(async () => {
  // 这个方法结合了下面3个步骤：
  // 1、使用 puppeteer.defaultArgs() 作为一组默认值来启动 Chromium。
  // 2、启动浏览器并根据 executablePath ，handleSIGINT，dumpio 和其他选项开始管理它的进程。
  // 3、创建一个 Browser 类的实例，并根据 defaultViewport，slowMo 和 ignoreHTTPSErrors 初始化它。
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    dumpio: false //是否将浏览器进程标准输出和标准错误输入到 process.stdout 和 process.stderr 中。默认是 false
  })

  // 返回一个新的 Page 对象。Page 在一个默认的浏览器上下文中被创建。
  const page = await browser.newPage()
  
  // 跳转到指定的页面
  await page.goto(url, {
    // 满足什么条件认为页面跳转完成，默认是 load 事件触发时。指定事件数组，那么所有事件触发后才认为是跳转完成。
    // networkidle2 - 只有2个网络连接时触发（至少500毫秒后）
    waitUntil: 'networkidle2'
  })

  // 等待网页载入1秒钟
  await sleep(1000)
  // 等待某个元素出现
  // await page.waitForSelector('.more')

  <!-- 操作 -->
  // 在浏览器环境执行脚本
  cosnt result = await page.evaluate(() => {
    // 可以获取DOM，返回结果...
  })

  // 关闭浏览器
  browser.close()
  
  process.send(result) // 将这个结果发送出去
  process.exit(0) // 退出进程
})()


```

# 七牛上传
```
// config中的配置
// bucket：存储空间名称
// AK：AccessKey
// SK：SecretKey

const qiniu = require('qiniu')
const nanoid = require('nanoid')
const config = require('../config')

const bucket = config.qiniu.bucket

// 构建BucketManager对象
const mac = new qiniu.auth.digest.Mac(config.qiniu.AK, config.qiniu.SK)
const cfg = new qiniu.conf.Config()
const client = new qiniu.rs.BucketManager(mac, cfg)

// 抓取网络资源到空间
//拿到指定的url,将内容上传到七牛上
const uploadToQiniu = async (url, key) => {
  return new Promise((resolve, reject) => {
    client.fetch(url, bucket, key, (err, ret, info) => {
      if (err) {
        reject(err)
      } else {
        if (info.statusCode === 200) {
          resolve({ key })
        } else {
          reject(info)
        }
      }
    })
  })
}

let sources = []
sources.map(async item => {
  try {
    let data = await uploadToQiniu(item.uri, item.name)
  } catch(err) {
    console.log(err)
  }
})

```


# babel
## .babelrc
在babel中使用 decorators等
```
{
  "presets": ["@babel/preset-env"],
  "plugins": [
    "@babel/plugin-transform-runtime",
    ["@babel/plugin-proposal-decorators", { "legacy": true }]
  ]
}
```

## package.json
@babel/node可能没用上
```
{
  "dependencies": {
    "@babel/plugin-transform-runtime": "^7.4.3",
    "@babel/runtime": "^7.4.3",
  },
  "devDependencies": {
    "@babel/cli": "^7.4.3",
    "@babel/core": "^7.4.3",
    "@babel/node": "^7.2.2",
    "@babel/plugin-proposal-decorators": "^7.4.0",
    "@babel/polyfill": "^7.4.3",
    "@babel/preset-env": "^7.4.3"
  }
}
```
## start.js
```
require('@babel/register')
require("@babel/polyfill")
require('./server/index')
```


# 路由
步骤
1. 在 index.js 调用中间件 /server/middleware/router.js
2. 执行 router.js 的 router 方法
   1. 将 /server/routes/ 赋值给 apiPath
   2. 实例化 /server/lib/decorator 的 Route，将传入的参数app、apiPath赋值给类属性，实例化koa-router
   3. 调用 Route 的 init 方法
      1. 导入 apiPath（即routes） 目录下的所有 js 文件
        1. 执行controller修饰符，在Controller的prototype属性创建唯一属性symbolPrefix，值为将传入的路径参数
        2. 执行get post修饰符，修饰Controller的方法，执行router函数
        3. 在routerMap添加键值对，如键为{target: movieController,method:'get',path: '/'}，值为getMovies函数
      2. 遍历 routerMap，获取conf, controller属性
        1. 将controllers转化为数组
        2. 若路径前缀存在，与配置中的path拼接为routerPath
        3. 调用 koa实例的 router[method](routerPath, ...controllers)

## index.js
导入 middleware文件夹内MIDDLEWARES数组的文件
```
const R = require('ramda')
const MIDDLEWARES = ['router']

const useMiddlewares = (app) => {
  R.map(
    R.compose(
      R.forEachObjIndexed(
        initWith => initWith(app)
      ),
      require,
      name => resolve(__dirname, `./middleware/${name}`)
    )
  )(MIDDLEWARES)
}

;(async() => {
  await connect()
  const app = new Koa()
  await useMiddlewares(app)
  
  app.listen(8888)
})()
```

## middleware/router.js
以app和routes目录路径为参数，初始化decorator
```
const {resolve} = require('path')
const {Route} = require('../lib/decorator')

export const router = app => {
  const apiPath = resolve(__dirname, '../routes')
  const router = new Route(app, apiPath)
  router.init()
}
```

## routes\movie.js
```
const {
  controller,
  get
} = require('../lib/decorator')
const {
  getAllMovies,
  getMovieDetail,
  getRelativeMovies
} = require('../service/movie')

@controller('/api/v0/movies')
export class movieController {
  @get('/')
  async getMovies (ctx, next) {
    const { type, year } = ctx.query
    const movies = await getAllMovies(type, year)

    ctx.body = {
      success: true,
      data: movies
    }
  }

  @get('/:id')
  async getMovieDetail (ctx, next) {
    const id = ctx.params.id
    const movie = await getMovieDetail(id)
    const relativeMovies = await getRelativeMovies(movie)

    ctx.body = {
      data: {
        movie,
        relativeMovies
      },
      success: true
    }
  }
}

```