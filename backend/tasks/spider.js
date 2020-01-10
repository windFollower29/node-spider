

const { launch } = require('puppeteer')
const puppeteer = require('puppeteer')
const schedule = require('node-schedule')
const { sleep } = require('sleep')

const { GoodsModel } = require('../db/model')

const { SCREEN_SHOT_PATH } = require('../utils/const')
const { deepSet } = require('../utils/tool')

let count = 0

const { ZARA } = require('../data/product')

// const spider = () => schedule.scheduleJob({
//   rule: '*/50 * * * * *'
// }, () => {
//   console.log('task ', count++);
// });

class Goods {
  constructor (id) {
    this.model = {
      id,
      label: '',
      img: '',
      price: '',
      sku: {}
    }
  }

  setId (id) {
    this.model.id = id
  }

  setLabel (label) {
    this.model.label = label
  }

  setImg (url) {
    this.model.img = url
  }

  setPrice (price) {
    this.model.price = +price
  }

  setSku (key, val) {
    Object.assign(this.model.sku, {
      [key]: val
    })
  }
}

let goodsId = ''
const cache = []
let goods = null


launchOpts = {
  // 'executablePath': CHROME_PATH
  // headless: false,
  devtools: true
}
const spider = null

const URL = 'https://www.zara.cn/cn/zh/search?searchTerm='


async function createNewBrowser (url) {
  const browser = await puppeteer.launch(launchOpts)
  const page = await browser.newPage()
  await page.goto(url)

  return {
    page,
    async destroy () {
      await browser.close()
    }
  }
}

function createGoods () {
  goods = new Goods(goodsId)
  cache.push(goods.model)
}

async function initGoods (page) {
  // 创建商品实例
  createGoods()
  // 获取商品标签
  await getInfo(page)
}

async function getSku (page) {

  await page.waitForSelector('.size-select')
  // await page.screenshot({ path: SCREEN_SHOT_PATH + name + '.jpg' })
  const sizes = await page.evaluate(() => {

    return [ ...document.querySelectorAll('label.product-size') ].map(node => {
        return {
          title: node.getAttribute('data-name'),
          disabled: node.classList.contains('disabled')
        }
      })
  })

  for (let size of sizes) {
    goods.setSku(size.title, size.disabled)
  }
}

async function getImg (imgDom) {
  const url =  await (await imgDom.getProperty('src')).jsonValue()
  // console.log(url)
  goods.setImg(url)
}

async function getInfo (page) {
  await page.waitForSelector('.product-color')
  const label = await page.$('.product-color')
  const title = await (await label.getProperty('textContent')).jsonValue()

  goods.setLabel(title)
}

async function clickColor (page) {

  let dom
  const len = (await page.$$('._color')).length

  for (let i = 0; i < len; i++) {

    // 按钮需要重新获取，因为点击一次按钮dom重新渲染了
    dom = (await page.$$('._color'))[i]

    try {
      // click different color in order
      await page.evaluate(node => node.click(), dom)

    } catch (e) {
      console.log(e)
    }
    await sleep(2)

    await initGoods(page)
    await getImg(await dom.$('img'))
    await getSku(page)
  }

}

async function gotoDetail (url) {
  
  const { page, destroy } = await createNewBrowser(url)

  await initGoods(page)
  await getImg(await page.$('._color img'))
  await getSku(page)
  await clickColor(page)

  // console.log(JSON.stringify(cache))
  await destroy()
}

async function searchGoods (url) {

  const { page, destroy } = await createNewBrowser(url)

  await page.waitForSelector('.product-list')
  await page.screenshot({ path: SCREEN_SHOT_PATH + 'test' + '.jpg' })

  const links = await page.evaluate(() => {

    return [ ...document.querySelectorAll('.product-list a.item') ].map(node => {

      const path = node.getAttribute('href')
      const query = node.getAttribute('data-extraquery')
      return `${path}?${query}`

    })

  })
  console.log(links)
  // 销毁搜索页
  destroy()

  try {

    for (link of links) {
      await gotoDetail(link)
    }

  } catch (e) {
    console.log('error', e)
  }

}

async function begin () {

  // 遍历所有商品
  for (id of ZARA) {
    try {
      goodsId = id
      await searchGoods(`${URL}${id}`)
    } catch (e) {

    }
  }

  await saveToDb()
}

async function saveToDb () {
  console.log('爬虫数据：\n', JSON.stringify(cache))
  
  for(let data of cache) {
    const goods = new GoodsModel(data)
    goods.save()
      .then(res => {
        console.log('保存成功：', res)
      })
      .catch(err => console.log.bind(console, '保存失败：'))
  }
}

begin()

module.exports = spider