const app = getApp()

function groupBy(list, name) {
  return list.reduce((obj, item) => {
    if (!obj[item[name]]) {
      obj[item[name]] = []
      obj[item[name]].push(item)
    } else {
      obj[item[name]].push(item)
    }
    return obj
  }, {})
}

function loading(){
  tt.showLoading({
    title: '请求中...请稍后',
    mask:true,
  });
}
function hideLoading(){
  tt.hideLoading({
    success (res) {
      console.log(`res`);
    },
    fail (res) {
      console.log(`hideLoading failure`);
    }
  });
}

Page({
  data: {
    userInfo: undefined,
    remainTicketAmount: 11,
    prizes: [],
    currentItem: {},
    openingPrize: false,
    showDetail: false,
    userBetInfo:{},
    betList:{},
  },
  showRule() {
    tt.showModal({
      title: '抽奖规则',
      showCancel: false,
      content: '每个账号只有11张投票券，可以任意投给奖池里面的38种奖品（至少1张，最多11张），可以实时自行修改投票，每种奖品2人获奖。2月2日24：00停止投票',
    })
  },
  handleModel() {
    this.setData({
      showDetail: false
    })
  },
  bet: function (event) {
    if (this.data.remainTicketAmount <= 0) {
      tt.showToast({
        title: '您没有额外的金币了，不能再加啦！',
        icon: 'warning'
      })
      return
    }
    let betList = this.data.betList;
    let betId = event.target.dataset['bet'].id
    if (betList[betId]) {
      betList[betId] += 1
    } else {
      betList[betId] = 1
    }
    this.setData({
      remainTicketAmount: this.data.remainTicketAmount - 1,
      betList: betList,
    })
    const putCoinSound = tt.createInnerAudioContext();
    putCoinSound.src = '../../assets/sound/putcoin.mp3';
    putCoinSound.play()
  },
  clearBet: function () {
    var that = this
    loading()
    tt.request({
      url: `${app.globalData.baseUrl}/lottery/reset`,
      method:'POST',
      data: {
        openId:tt.getStorageSync('open_id')
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        console.log(`重置 调用成功 res`);
        that.getUserBetInfo()
        hideLoading()
      },
      fail(res) {
        console.log(`重置 调用失败`);
        hideLoading()
      }
    })
    this.setData({
      betList: {},
    })
  },
  submit(){
    let voteList = []
    for(let key in this.data.betList){
      let value = this.data.betList[key];
      voteList.push({
        rewardId:key,
        voteCount:value,
      })
    }
    var that = this
    loading()
    tt.request({
      url: `${app.globalData.baseUrl}/lottery/vote`,
      method:'POST',
      data: {
        openId:tt.getStorageSync('open_id'),
        voteList:voteList,
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        console.log(`提交成功`);
        that.getUserBetInfo()
        hideLoading()
      },
      fail(res) {
        console.log(`request 调用失败`);
        hideLoading()
      }
    })
  },
  openPrize(event){
    let prize = event.target.dataset['prize']
    loading()
    tt.request({
      url: `${app.globalData.baseUrl}/lottery/lottery`,
      method:'POST',
      data: {
        id:prize.id,
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        console.log(`开奖 调用成功 ${res}`);
        hideLoading()
      },
      fail(res) {
        console.log(`开奖 调用失败`);
        hideLoading()
      }
    })
    this.setData({
      currentItem:prize,
      showDetail:true,
    })
  },
  getPrizeList() {
    var that = this
    loading()
    let task = tt.request({
      url: `${app.globalData.baseUrl}/lottery/getRewardList`,
      method: 'POST',
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        // console.log(`request 调用成功 ${JSON.stringify(res)}`);
        let group = groupBy(res.data.data,'level')
        let covertData = []
        for(let index in group){
          let i = group[index]
          let categoryName = ['特等奖','一等奖','二等奖','三等奖'][i[0].level]
          covertData.push({
            categoryName:categoryName,
            prizeList:i,
          })
        }
        that.setData({
          prizes: covertData
        })
        hideLoading();
      },
      fail(res) {
        console.log(`request 调用失败${JSON.stringify(res)}`);
        hideLoading()
      }
    });
  },
  getUserBetInfo(){
    let openId = tt.getStorageSync('open_id')
    var that = this
    if(!!openId){
      tt.request({
        url: `${app.globalData.baseUrl}/lottery/getUserDetail`,
        method:'POST',
        data: {
          openId: openId
        },
        header: {
          'content-type': 'application/json'
        },
        success(res) {
          console.log(`用户下注信息 调用成功 ${JSON.stringify(res)}`);
          that.setData({
            userBetInfo:res.data.data,
            remainTicketAmount: res.data.data.allTickets - res.data.data.usedTickets
          })
        },
        fail(res) {
          console.log(`request 调用失败`);
          tt.showModal({
            title: '',
            content: `${JSON.stringify(res)}`,
          })
        }
      })
    }else{
      this.initUser()
    }
  },
  getUserInfo: function () {
    var that = this;
    let localUserInfo = tt.getStorageSync('userInfo')
    console.log('local userinfo', localUserInfo)
    if (!!localUserInfo.nickName) {
      this.setData({
        userInfo: localUserInfo
      })
    } else {
      tt.getUserInfo({
        success(res) {
          console.log(res)
          tt.setStorageSync('userInfo', res.userInfo)
          that.setData({
            userInfo: res.userInfo
          }, () => {
            that.showWelcome()
          })
        },
        fail(res) {
          console.log('fail to get userinfo')
        }
      })
    }
  },
  initUser(code) {
    var that = this
    tt.getUserInfo({
      success(ures) {
        console.log('获取用户信息成功', ures)
        tt.setStorageSync('userInfo', ures.userInfo)
        that.setData({
          userInfo: ures.userInfo
        }, () => {
          that.showWelcome()
        })
        tt.request({
          url: 'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal/',
          data: {
            app_id: 'cli_a09b9ba2a47dd00e',
            app_secret: '5Axk9L277KmJz1ZfXirItbteI3lk1Vt6'
          },
          header: {
            'content-type': 'application/json'
          },
          success(res) {
            console.log(`请求access token 调用成功 ${JSON.stringify(res)}`);
            tt.request({
              url: 'https://open.feishu.cn/open-apis/mina/v2/tokenLoginValidate',
              data: {
                code: code,
                token: res.data.app_access_token,
              },
              header: {
                'content-type': 'application/json'
              },
              success(res) {
                console.log(`获取openid 调用成功 ${JSON.stringify(res)}`);
                tt.setStorageSync('open_id', res.data.data.open_id)
                let userInfo = ures.userInfo
                tt.request({
                  url: `${app.globalData.baseUrl}/lottery/initUser`,
                  method:'POST',
                  data: {
                    name: userInfo.nickName,
                    headPictureUrl: userInfo.avatarUrl,
                    openId: res.data.data.open_id
                  },
                  header: {
                    'content-type': 'application/json'
                  },
                  success(res) {
                    console.log(`初始化用户 调用成功`);
                    that.getUserBetInfo()
                  },
                  fail(res) {
                    console.log(`request 调用失败`);
                  }
                })

              },
              fail(res) {
                console.log(`request 调用失败`);
              }
            })
          },
          fail(res) {
            console.log(`request 调用失败`);
          }
        })
      },
      fail(res) {
        console.log('fail to get userinfo')
      }
    })

  },
  onLoad: function () {
    var that = this
    tt.checkSession({
      success(res) {
        console.log(`session 未过期`);
        that.getUserInfo()
      },
      fail(res) {
        console.log(`session 已过期，需要重新登录`);
        that.login()
      }
    })
    this.getPrizeList()
    this.getUserBetInfo()

  },
  login() {
    var that = this
    tt.login({
      success(res) {
        console.log('login success')
        that.initUser(res.code)
      },
      fail() {
        console.log('login fail')
      }
    })
  },
  showWelcome: function () {
    tt.showToast({
      title: `Welcome to Balcklake Casino,${this.data.userInfo.nickName},good luck!`,
      icon: 'none',
      duration: 2000,
    })
  }
})
