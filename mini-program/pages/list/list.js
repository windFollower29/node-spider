

const app =  getApp()

const URL = 'https://ec2-3-134-160-28.us-east-2.compute.amazonaws.com/json'

Page({
  data: {
    json: '',
    img: ''
  },

  onLoad () {
    const me = this
    wx.request({
      url: URL,
      success (res) {
        console.log(res)
        me.setData({ json: res.data.title, img: res.data.img })
      }
    })
  }
})

