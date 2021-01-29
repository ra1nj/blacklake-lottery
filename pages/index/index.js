const app = getApp()

Page({
  data: {
    userInfo:undefined,
    remainTicketAmount:11,
    prizes:[
      {
        categoryName:'特等奖',
        prizeList:[
          {
            name:'Apple iPhone 12 Pro Max',
            imgurl:'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/抽奖奖品/一等奖PS5.jpg',
            prizeStatus:0,
            totalBetNum:122,
            candidateList:[
              {
                id:1,
                nickName:'rain',
                avatarUrl:'xxx',
              },
            ],
            winnerList:[
              {
                id:1,
                nickName:'rain',
                avatarUrl:'xxx',
              },
            ],
    
          }
        ],
      }
    ],
    betList:{},
    openingPrize:false,
    showDetail:false,
    currentItem:{},
    isAnimate:false,
    left:-7000,
    candidateList:new Array(100),
  },
  showRule(){
    tt.showModal({
      title: '抽奖规则',
      showCancel:false,
      content: '每个账号只有11张投票券，可以任意投给奖池里面的38种奖品（至少1张，最多11张），可以实时自行修改投票，每种奖品2人获奖。2月2日24：00停止投票',
    })
  },
  startAnimation(){

    let singleAvatarLength = 70;
    let totalLength = singleAvatarLength * 100 ;
    let singleMoveLength = totalLength / 9
    let speed = 0;
    let isBrake = false;
    let left = this.data.left;
  
    let timer = setInterval(()=>{
      if(speed == 3) isBrake = true;
      speed = speed + (isBrake? -1: +1);
      if(speed == 0 && timer != null){
        clearInterval(timer)
      }
      left += speed * singleMoveLength
      console.log('moving,current speed',speed)
      this.setData({
        left: left
      })
    },1000)
    // this.setData({
    //   isAnimate:!this.data.isAnimate,
    // })
  },
  handleModel() {
    this.setData({
      showDetail: !this.data.showDetail
    })
  },
  closeDetail:function(event){
    this.setData({
      showDetail:false,
    })
  },
  checkDetail:function(event){
    let item = event.target.dataset['item']

    this.setData({
      currentItem:item,
      showDetail:true,
    })
    this.animate()
  },
  bet:function(event){
    let betList = this.data.betList;
    let betId = event.target.dataset['bet'].id
    if(betList[betId]){
      betList[betId] += 1
    }else{
      betList[betId] = 1
    }
    this.setData({
      remainTicketAmount: this.data.remainTicketAmount - 1,
      betList:betList,
    })
  },
  clearBet:function(){
    this.setData({
      betList:{},
      remainTicketAmount:11,
    })
    this.startAnimation();
  },
  getUserInfo: function (){
    var that = this;
    tt.getUserInfo({
      success (res) {
        console.log(res)
        that.setData({
          userInfo:res.userInfo
        },()=>{
          that.showWelcome()
        })
      },
      fail(res){
        console.log('fail to get userinfo')
      }
    })
  },
  onLoad: function () {
    let userInfo = tt.getStorageSync('userInfo')
    this.setData({
      userInfo:userInfo,
    })
    if(this.data.userInfo.nickName){
      this.showWelcome()
    }else{
      this.getUserInfo();
    }
    // this.getPrizeList()
  },
  getPrizeList(){
    var that = this
    let task = tt.request({
      url: 'http://172.168.2.69:8099/lottery/getRewardList',
      method:'POST',
      data:{},
      header: {
          'content-type': 'application/json'
      },
      success (res) {
          console.log(`request 调用成功 ${JSON.stringify(res)}`);
          that.setData({
            prizeList:res.data.data,
          })
      },
      fail (res) {
          console.log(`request 调用失败${JSON.stringify(res)}`);
      }
  });

  },
  showWelcome: function () {
    tt.showToast({
      title:`Welcome to Balcklake Casino,${this.data.userInfo.nickName}`,
      icon:'none',
      duration:2000,
    })
  }
})
