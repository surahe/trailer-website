const puppeteer = require('puppeteer')

const base = 'https://movie.douban.com/subject/'
const doubanId = '27202819'
const videoBase = 'https://movie.douban.com/trailer/219491/'

const sleep = time => new Promise(resolve => {
  setTimeout(resolve, time)
})

  ; (async () => {
    console.log('开始访问目标视频网页。。。')

    //定义一个模拟的chromium浏览器browser，在这上面进行操作
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      dumpio: false
    })

    //打开一个新的网页，载入目标网页
    const page = await browser.newPage()
    await page.goto(base + doubanId, {
      waitUntil: 'networkidle2'
    })

    //等待网页载入1秒钟
    await sleep(1000)

    //获取预告片内容放入对象中,页面中有已加载好的JQuery库，可以直接用jQuery
    const result = await page.evaluate(() => {
      var $ = window.$
      var it = $('.related-pic-video') //预告片视频
      if (it && it.length) {
        var link = it.attr('href')  //预告片的跳转地址
        var cover = it.css('background-image')  //预告片视频的封面图地址,现豆瓣网页有改变，和视频中不一样，需要从style中获取这个background-image的值

        //然后去掉不需要的字符
        cover = cover.replace('url(', '')
        cover = cover.replace(/\?/, '')
        cover = cover.replace(/\)/, '')

        //将得到的结果封装成对象返回给result
        return {
          link,
          cover
        }
      }

      return {} //如果没有预告片内容，则返回一个空对象
    })

    // 爬取视频
    let video
    if (result.link) {
      await page.goto(result.link, {
        waitUntil:'networkidle2'
      })
      await sleep(2000)
      video = await page.evaluate(() => {
        var $ = window.$
        var it = $('source') //得到视频地址

        if (it && it.length > 0){
            return it.attr('src')
        }

        return ''
      })
    }

    //封装最后返回的数据
    const data = {
      video,
      doubanId,
      cover: result.cover
    }

    browser.close()

    process.send(data) // 将这个结果发送出去
    process.exit(0) // 退出进程

  })()