App({
  onLaunch: function () {
    var that = this
    tt.checkSession({
      success (res) {
        console.log(`session 未过期`);
        that.globalData.hasLogin = true;
      },
      fail (res) {
        console.log(`session 已过期，需要重新登录`);
        tt.login({
          success(res){
            console.log('login success')
            tt.setStorageSync('login.code',res.code)
            tt.getUserInfo({
              success(userRes){
                console.log('get userInfo success')
                tt.setStorageSync('userInfo',userRes.userInfo)
                that.globalData.userInfo = userRes.userInfo
              },
              fail(){
                console.log('get userInfo fail')
              }
            })
          },
          fail(){
            console.log('login fail')
          }
        })
      }
    })
  },
  globalData: {
    userInfo:null,
    hasLogin: false,
    openid: null,
    appId: 'cli_a09b9ba2a47dd00e',

  }
})
