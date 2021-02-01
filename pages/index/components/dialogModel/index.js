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
          // this.starAnimation()
        } else {
          this.setData({
            left: 0,
            tip: '开奖中...',
            status: 0,
          })
        }
      }
    },
    currentItem: {
      type: Object,
      value: null,
      observer: function (newVal, oldVal, changedPath) {
        if (!!newVal.winnerList) {
          let hasShowAnimation = tt.getStorageSync(`reward_${newVal.id}`)
          let winnerList = newVal.winnerList;
          let tip = `恭喜 ${winnerList.map((w) => w.name + ' ')} 同学中奖！`
          if (!!hasShowAnimation) {
            this.setData({
              status: 2,
              tip: tip,
            })
          } else {
            this.starAnimation()
          }
        }

      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    left: 0,
    round: new Array(10).fill('1'), //转的圈数
    duration: 16, //转的时间 需要可以被开方
    tip: '开奖中...',
    status: 0, //0 未知 1 开奖中 2 已开
  },
  /**
   * 组件的方法列表
   */
  methods: {
    closeModel() {
      this.triggerEvent('closeModel')
    },
    starAnimation() {
      this.setData({
        status: 1,
      })
      console.log('Animation start,')
      const openingSound = tt.createInnerAudioContext()
      openingSound.src = 'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/openingPrize.mp3'
      openingSound.autoplay = true;
      openingSound.loop = true;
      let candidateList = this.properties.currentItem.candidateList;
      let winnerList = this.properties.currentItem.winnerList;
      // let winnerIndex
      // for(let index in candidateList){
      //   let c = candidateList[index]
      //   if(winnerList[0].id == c.id){
      //     winnerIndex = index
      //   }
      // }
      let totalStep = Number(this.data.round.length * candidateList.length) + 2
      console.log(' total step', totalStep)
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
          openingSound.stop()
          clearInterval(timer)
          this.setData({
            tip: `恭喜 ${winnerList.map((w) => w.name + ' ')} 同学中奖！`,
            status: 2,
          })
          tt.setStorageSync(`reward_${this.properties.currentItem.id}`, true)
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
