Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: {
      type: Boolean,
      value: true
    },
    dialogId: {
      type: Number,
      value: 1
    },
    codeList:{
      type: Array,
      value:[1,2,3,4,5]
    },
    fieldNumber: {
      type: Number,
      value: 2
    },
    typeTips: {
      type: String,
      value: '将于3月8日20点来开奖哦！'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

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
  }
});
