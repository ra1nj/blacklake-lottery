//index.js

Page({
    data: {
        scrollText: ['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff', 'ggg', 'hhh', 'iii', 'jjj', 'kkk'], // 滚动的文字
        animationData: null, // 绑定的动画效果
        isStart:false
    },
    // 开始滚动
    startScroll () {
        console.log('开启')
        // 创建一个动画实例
        let animation = tt.createAnimation({
            duration: 5000,
            timingFunction: 'ease'
        })
        // 获取元素总高度
        let height =  (this.data.scrollText.length - 1) * 300
        // 向上移动
        animation.translateY(-height + 'rpx').step()
        // 将动画效果赋值
        this.setData({
            animationData: animation.export(),
            isStart:true,
        })
    },
    // 重置
    reset () {
        let animation = tt.createAnimation({
            duration: 0
        })
        this.setData({
            animationData: animation.translateY(0).step().export()
        })
    }
})