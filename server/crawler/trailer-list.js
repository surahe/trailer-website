const puppeteer = require('puppeteer')

const url = 'https://movie.douban.com/explore#!type=movie&tag=最新&page_limit=20&page_start=0'

const sleep = time => new Promise(resolve => {
  setTimeout(resolve, time)
})

; (async () => {
  console.log('start')
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    dumpio: false
  })

  const page = await browser.newPage()
  await page.goto(url, {
    waitUntil: 'networkidle2'
  })

  await sleep(3000)

  await page.waitForSelector('.more')


  for (let i = 0; i < 3; i++) {
    await sleep(3000)
    await page.click('.more')
  }

  const result = await page.evaluate(() => {
    var $ = window.$
    var items = $('.list-wp .list a')  //得到所有这一页的详情内容，每个详情都由一个a标签包裹着
    var links = []

    if (items.length > 0) {
      items.each(function(intex, item) {
        var it = $(item)
        var doubanId = it.find('div').data('id') // 这个id对应 data-id="30122633" 
        var p = it.find('p').html()
        var title
        if(p.match(/<\/span>/)) {
          title = $.trim(p.match(/[^<>]+/g)[6])
        } else {
          title = $.trim(p.match(/[^<>]+/g)[0])
        }
        var rate = Number(it.find('strong').text()) // 豆瓣评分是文本，转化为数字
        var poster = it.find('img').attr('src').replace('s_ratio', 'l_ratio').replace('jpg', 'webp')//海报图片的src是小图，替换为大的高清图,后缀也改为webp
        links.push({
          doubanId,
          title,
          rate,
          poster
        })
      })
      return links
    }
  })

  browser.close()
  
  process.send({result}) // 将这个结果发送出去
  process.exit(0) // 退出进程

})()