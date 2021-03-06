const app = getApp()
const hosts = ['石岩']
const expireTime = Number(new Date('2021-02-03T00:00:00'))
var pollingTimer



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

function loading() {
  tt.showLoading({
    title: '请求中...请稍后',
    mask: true,
  });
}
function hideLoading() {
  tt.hideLoading({
    success(res) {

    },
    fail(res) {
      console.log(`hideLoading failure`);
    }
  });
}

Page({
  onPullDownRefresh() {
    this.getPrizeList()
  },
  data: {
    userInfo: undefined,
    remainTicketAmount: 11,
    prizes: [],
    currentItem: {},
    openingPrize: false,
    showDetail: false,
    userBetInfo: {},
    betList: {},
    isOver: false,
    isHost: false,
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
      showDetail: false,
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
  },
  clearBet: function () {
    var that = this
    loading()
    tt.request({
      url: `${app.globalData.baseUrl}/lottery/reset`,
      method: 'POST',
      data: {
        openId: tt.getStorageSync('open_id')
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        console.log(`重置 调用成功 res`);
        hideLoading()
        tt.showToast({
          title: '重置成功',
        })
        that.getUserBetInfo()
        that.getPrizeList()
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
  submit() {
    let voteList = []
    for (let key in this.data.betList) {
      let value = this.data.betList[key];
      voteList.push({
        rewardId: key,
        voteCount: value,
      })
    }
    var that = this
    loading()
    tt.request({
      url: `${app.globalData.baseUrl}/lottery/vote`,
      method: 'POST',
      data: {
        openId: tt.getStorageSync('open_id'),
        voteList: voteList,
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        hideLoading()
        tt.showToast({
          title: '提交成功',
        })
        that.getUserBetInfo()
        that.getPrizeList()
      },
      fail(res) {
        console.log(`request 调用失败`);
        hideLoading()
      }
    })
  },
  checkDetail(event) {
    let prize = event.target.dataset['prize']
    let currentItem = {
      ...prize,
      candidateList: prize.rewardTicketRelDtoList,
      winnerList: prize.winnerDtoList.map(w => ({ name: w.winnerName, headPictureUrl: w.winnerHeadPicture }))
    }
    this.setData({
      currentItem: currentItem,
      showDetail: true,
    })
  },
  openPrize(event) {

    if (!this.data.isOver) {
      tt.showModal({
        title: '警告',
        content: '还没到开奖时间哦！',
        showCancel: false,
      })
      return
    }
    let prize = event.target.dataset['prize']
    var that = this
    tt.showModal({
      title: '即将开奖',
      content: '确定要进行开奖吗',
      success(res) {
        if (res.confirm) {
          loading()
          tt.request({
            url: `${app.globalData.baseUrl}/lottery/lottery`,
            method: 'POST',
            data: {
              id: prize.id,
            },
            header: {
              'content-type': 'application/json'
            },
            success(res) {
              console.log(`开奖 调用成功 ${res}`);
              if (res.data.code == 200) {
                hideLoading()
                let winnerList = res.data.data[0].userList
                let candidateList = prize.rewardTicketRelDtoList
                let currentItem = {
                  ...prize,
                  winnerList: winnerList,
                  candidateList: candidateList,
                }
                that.setData({
                  currentItem: currentItem,
                  showDetail: true,
                })
              } else {
                tt.showToast({
                  title: '开奖 失败',
                  icon: 'none'
                })
              }

            },
            fail(res) {
              tt.showToast({
                title: '开奖 调用失败',
              })
              hideLoading()
            }
          })
        } else if (res.cancel) {
          console.log('cancel, cold')
        } else {
          // what happend?
        }
      },
    })
  },
  getPrizeList() {
    var that = this
    // loading()
    let task = tt.request({
      url: `${app.globalData.baseUrl}/lottery/getRewardList`,
      method: 'POST',
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        // console.log(`request 调用成功 ${JSON.stringify(res)}`);
        let group = groupBy(res.data.data, 'level')
        let covertData = []
        for (let index in group) {
          let i = group[index]
          let categoryName = ['特等奖', '一等奖', '二等奖', '三等奖'][i[0].level]
          covertData.push({
            categoryName: categoryName,
            prizeList: i,
          })
        }
        that.setData({
          prizes: covertData
        })

      },
      fail(res) {
        console.log(`request 调用失败${JSON.stringify(res)}`);

      }
    });
  },
  getUserBetInfo() {
    let openId = tt.getStorageSync('open_id')
    console.log('local openId,', openId)
    var that = this
    if (!!openId) {
      tt.request({
        url: `${app.globalData.baseUrl}/lottery/getUserDetail`,
        method: 'POST',
        data: {
          openId: openId
        },
        header: {
          'content-type': 'application/json'
        },
        success(res) {
          console.log(`用户下注信息 调用成功 ${JSON.stringify(res)}`);
          let userBetInfo = res.data.data;
          let betList = {}
          for (let i of userBetInfo.rewardTicketRelDtoList) {
            betList[i.rewardId] = i.voteCount
          }
          that.setData({
            userBetInfo: userBetInfo,
            betList: betList,
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
    } else {
      this.login()
    }
  },
  getUserInfo: function () {
    var that = this;
    let localUserInfo = tt.getStorageSync('userInfo')
    console.log('local userinfo', localUserInfo)
    if (!!localUserInfo.nickName) {
      this.setData({
        userInfo: localUserInfo,
        isHost: hosts.indexOf(localUserInfo.nickName) > -1
      })
    } else {
      tt.getUserInfo({
        success(res) {
          console.log(res)
          tt.setStorageSync('userInfo', res.userInfo)
          that.setData({
            userInfo: res.userInfo,
            isHost: hosts.indexOf(res.userInfo.nickName) > -1
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
          userInfo: ures.userInfo,
          isHost: hosts.indexOf(ures.userInfo.nickName) > -1
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
                  method: 'POST',
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
  checkIsExpired() {
    let currentTime = Number(new Date())
    if (currentTime >= expireTime) {
      tt.showModal({
        title: '投票已结束！',
        content: '2月3日年会现场将进行每个奖品的开奖，公示中奖名单，中奖几率取决于你的投票数',
        showCancel: false,
      })
      this.setData({
        isOver: true,
      })
    }
  },
  onLoad: function () {
    this.checkIsExpired()

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
    this.getUserBetInfo()
    this.startPolling()
    this.playMusic()
  },
  playMusic() {
    const innerAudioContext = tt.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.src = 'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/bgmusic.mp3';
    innerAudioContext.loop = true;
    innerAudioContext.onPlay(() => {
      console.log('开始播放');
    });
    innerAudioContext.onError((error) => {
      console.log(error)
    });
  },
  onUnload() {
    clearInterval(pollingTimer)
  },
  reload() {
    var that = this
    this.login()
  },
  startPolling() {
    this.getPrizeList()
    var that = this
    pollingTimer = setInterval(() => {
      that.getPrizeList()
    }, 2000)
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
  },
  clearStorage(event) {
    var that = this
    if (event.type == 'longpress') {
      tt.showModal({
        title: '即将清除缓存',
        content: '清除你的本地缓存并重载数据',
        showCancel: false,
        success(res) {
          tt.clearStorageSync()
          that.reload()
        },
        fail(res) {
          console.log(`showModal调用失败`);
        }
      })
    }
  }
})
