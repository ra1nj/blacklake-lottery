Page({
  data: {
    userInfo:{
      userName:'',
    }
  },
  enterProfile:()=>{
    tt.enterProfile({
      openid: '********',
      success (res) {
        console.log(`enterProfile 调用成功`);
      },
      fail (res) {
        console.log(`enterProfile 调用失败`);
      }
    });
  },
  login: ()=>{
    tt.login({
      success:(res)=>{
        console.log(`login success, ${res.code}`)
      },
      fail:(res)=>{
        console.log('login fail')
      }
    })
  },
  getUserInfo: function (){
    tt.getUserInfo({
      success (res) {
        console.log(res)
      },
      fail(res){
        console.log('fail to get userinfo')
      }
    })
  },
  onLoad: function () {

    console.log('Welcome to Mini Code')
  },
})
