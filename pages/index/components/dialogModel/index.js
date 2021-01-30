Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: {
      type: Boolean,
      value: true,
      observer: function (newVal, oldVal, changedPath) {
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
        console.log('isshow', newVal)
        if (newVal == true) {
          this.starAnimation()
        }else{
          this.setData({
            left:0,
          })
        }
      }
    },
    currentItem: {
      type: Object,
      value: null,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    left: 0,
    round:new Array(10).fill('1'), //转的圈数
    duration: 16, //转的时间 需要可以被开方
    tip:'开奖中...',
  },
  /**
   * 组件的方法列表
   */
  methods: {
    preventDefault() {
      return;
    },
    closeModel() {
      this.triggerEvent('closeModel')
    },
    starAnimation() {
      console.log('Animation start')
      let candidateList = this.properties.currentItem.candidateList;
      let winnerList = this.properties.currentItem.winnerList;
      let winnerIndex
      for(let index in candidateList){
        let c = candidateList[index]
        if(winnerList[0].id == c.id){
          winnerIndex = index
        }
      }
      let totalStep = Number(((this.data.round.length -1) * candidateList.length))+Number(winnerIndex)
      console.log('winnder index',winnerIndex,' total step',totalStep)
      let singleAvatarLength = 140;
      let totalLength = singleAvatarLength * totalStep;
      let singleMoveLength = totalLength / this.data.duration
      let speed = 0;
      let isBrake = false;
      let left = this.data.left;

      let timer = setInterval(() => {
        if (speed == Math.sqrt(this.data.duration)) isBrake = true;
        speed = speed + (isBrake ? -1 : +1);
        if (speed == 0 && timer != null) {
          clearInterval(timer)
          this.setData({
            tip: `恭喜 ${winnerList[0].nickName} ${winnerList[1].nickName} 俩位同学中奖！`
          })
        }
        left -= speed * singleMoveLength
        console.log('moving,current speed', speed)
        this.setData({
          left: left
        })
      }, 1000)
    }
  }
});
