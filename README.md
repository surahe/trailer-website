# http的request获取数据
const rp = require('request-promise-native')


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