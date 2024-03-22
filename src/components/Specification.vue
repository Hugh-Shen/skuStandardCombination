<template>
  <div class="specification">
    <div class="header">
      <div>
        <div class="label">
          <span>*</span>
          <span>商品规格</span>
        </div>
        <div class="list">
          <div v-if="sourceData.length">
            <!--- standard -->
            <div class="standard" v-for="(item, index) in sourceData" :key="item.key">
              <div class="base">
                <div class="base-name">
                  <span>*</span>
                  <span>规格名</span>
                </div>
                <div class="base-select">
                  <div class="select">
                    <el-select
                      v-model="item.name"
                      placeholder="请选择规格名"
                      style="width: 240px"
                      :disabled="item.disabled"
                      @change="handleSelectBoxFn(item, index)"
                    >
                      <el-option
                        v-for="standard in standardList"
                        :key="standard.id"
                        :label="standard.name"
                        :value="standard.name"
                        :disabled="standard.disabled"
                      />
                    </el-select>
                    <el-icon
                      class="icon-close"
                      :style="{ cursor: item.disabled ? 'no-drop' : 'pointer' }"
                      size="20"
                      color="#b1b1b1"
                      @click="handleClickToClearRow(item, index)"
                    >
                      <CircleClose />
                    </el-icon>
                  </div>

                  <div class="addStandardPic mt-10" v-if="index === 0">
                    <el-checkbox
                      v-model="checkboxSwitch"
                      :disabled="item.disabled"
                      label="添加规格图片"
                      @change="handleCheckboxToChange"
                    />
                  </div>
                </div>
              </div>
              <!--- 规格值 -->
              <div class="base mt-15">
                <div class="base-name">
                  <span>*</span>
                  <span>规格值</span>
                </div>
                <div class="value-container">
                  <div class="base-value">
                    <div class="base-input mr-20" v-for="(v, i) in item.value" :key="v.key">
                      <div class="base-input-box">
                        <el-input
                          style="width: 120px"
                          placeholder="请输入规格值"
                          clearable
                          maxlength="25"
                          v-model="v.value"
                          :disabled="v.disabled"
                          @blur="handleInputBlur(v, i, item)"
                        />
                        <el-icon
                          class="icon-close"
                          :style="{ cursor: v.disabled ? 'no-drop' : 'pointer' }"
                          size="20"
                          color="#b1b1b1"
                          @click="removeCurrentInput(v, i, item)"
                        >
                          <CircleClose />
                        </el-icon>
                      </div>
                      <template v-if="index === 0 && checkboxSwitch">
                        <el-upload
                          class="avatar-uploader mt-10"
                          action="#"
                          :limit="1"
                          :show-file-list="false"
                          :disabled="v.disabled"
                          :before-upload="(res) => beforeAvatarUpload(res, item, i)"
                        >
                          <div v-if="v.picture || ''" class="avatar">
                            <img class="common-style" :src="v.picture"/>
                            <div v-if="!v.disabled" class="mask" @click.stop="() => {}">
                              <el-icon size="24" color="#fff" @click="previewCover(v)"><Search /></el-icon>
                              <el-icon size="24" color="#fff" @click="deleteCover(v, i, item)"><Delete /></el-icon>
                            </div>
                          </div>
                          <el-icon v-else class="avatar-uploader-icon common-style"><Plus/></el-icon>
                        </el-upload>
                      </template>
                    </div>
                    <el-button
                      type="success"
                      size="small"
                      plain
                      @click="addStandardColumnChild(item, index)"
                    >
                      添加规格值
                      <el-icon class="el-icon--right"><Plus /></el-icon>
                    </el-button>
                  </div>
                  <div v-if="index === 0 && checkboxSwitch" class="mt-15">
                    仅支持为第一组规格设置规格图片（最多20张图），买家选择不同规格会看到对应规格图片，建议尺寸：800 x 800像素
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <el-button type="primary" @click="addStandardColumn" :disabled="isAllow">添加规格项目</el-button>
          </div>
          <div style="margin-top: 10px">若有颜色、尺码、型号等多种规格供买家选择，可添加商品规格。</div>
          <div style="margin-top: 5px">请先确认要添加规格名，在编辑规格明细</div>
          <div style="margin-top: 5px">请不要在同规格名下添加多个重复的值</div>
        </div>
      </div>
      <!--- 默认 SKU -->
      <div class="default-box" v-if="!sourceData.length">
        <DefaultStandardTable ref="defaultTableRef" :saleType="saleType" />
      </div>
    </div>
    <!-- 规格明细 -->
    <div class="detail mt-15" v-if="sourceData.length">
      <div class="label">
        <span>*</span>
        <span>规格明细</span>
      </div>
      <div class="detail-content">
        <StandardTable
          ref="standardTableRef"
          :sourceData="sourceData"
          :saleType="saleType"
          :productStatus="productStatus"
          @operatEvent="handleToOperatEvent"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" append-to-body>
      <img class="image-preview" w-full :src="previewPicture" alt="图片预览" />
    </el-dialog>
  </div>
</template>

<script setup>
  import { computed, onBeforeMount, onMounted, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus, Search, Delete } from '@element-plus/icons-vue'
  import StandardTable from './StandardTable.vue'
  import DefaultStandardTable from './DefaultStandardTable.vue'
  // import { uploadImageFn } from '@/utils/upload.js'


  const getStandardList = (params) => {
    const list = [
      {
          id: 14,
          name: '黄瓜',
          disabled: false,
      },
      {
          id: 13,
          name: '西红柿',
          disabled: false,
      }
    ]

    standardList.value = list
  }
  const setSkuOfStatus = (params) => {
  }


  const props = defineProps({
    saleType: Number,
    productStatus: {
      type: Number,
      default: 0,
    },
  })

  const emits = defineEmits(['needResetPage'])

  const defaultTableRef = ref(null)
  const standardTableRef = ref(null)
  const standardList = ref([])
  const sourceData = ref([])
  const checkboxSwitch = ref(false)
  const dialogVisible = ref(false)
  const isAllow = ref(false)
  const previewPicture = ref('')


  const genNonDuplicateID = (randomLength = 0) => {
    let idStr = Date.now().toString(36)
    idStr += Math.random().toString(36).substring(2, randomLength)
    return idStr
  }
  const clearNotSelected = () => {
    const list = sourceData.value.map(item => item.id)

    standardList.value.forEach(item => {
      if (!list.includes(item.id)) {
        item.disabled = false
      }
    })
  }
  const handleSelectBoxFn = (val, i) => {
    const { name } = val

    const index = standardList.value.findIndex(item => item.name === name)
    standardList.value[index].disabled = true

    
    // 添加 id 关联表单数据
    sourceData.value[i].id = standardList.value[index].id
    sourceData.value[i].sum = sourceData.value[i].sum ? (sourceData.value[i].sum + 1) : 1
    clearNotSelected()
  }
  const handleClickToClearRow = (val, i) => {
    if (val.disabled) return;

    if (val.name) {
      const index = standardList.value.findIndex(item => item.name === val.name)
      standardList.value[index].disabled = false
    }
    // const index = sourceData.value.findIndex(item => item.key === val.key)
    // sourceData.value.splice(index, 1)
    sourceData.value.splice(i, 1)
    standardTableRef.value.delColumnListFn(val)
  }
  const addStandardColumn = () => {
    if (sourceData.value.length < 5) {
      const key = genNonDuplicateID()
      const column = {
        name: '',
        key,
        value: [],
      }
      sourceData.value.push(column)
    } else {
      ElMessage.error('规格项目最多只能五项')
    }
  }
  const addStandardColumnChild = (val, index) => {
    const key = genNonDuplicateID(4)
    const current = sourceData.value[index]

    if (current.value.length < 20) {
      current.value.push({
        key,
        value: '',
      })
    } else {
      ElMessage.error('通规格名下最多只能添加20项')
    }
  }
  const removeCurrentInput = (val, i, parent) => {
    if (val.disabled) return;
    // const index = parent.value.findIndex((item) => item.key === val.key)
    parent.value.splice(i, 1)
  }
  const handleInputBlur = (val, i, parent) => {
    const list = []
    parent.value.map((item, index) => {
      if (val.key !== item.key) {
        if (item.value === val.value) {
          list.push(i)
        }
      }
    })
    
    if (list.length) {
      const find = sourceData.value.findIndex(item => item.id === parent.id)

      list.forEach(key => {
        sourceData.value[find].value[key].value = ''
      })
    }
  }
  const previewCover = (val) => {
    previewPicture.value = val.picture
    dialogVisible.value = true
  }
  const deleteCover = (val, i, parent) => {
    parent.value[i].picture = ''
  }
  const handleCheckboxToChange = (val) => {
    // 清空所有的规格图片
    if (!val) {
      const list = sourceData.value[0].value.map(item => ({ ...item, picture: '' }))
      sourceData.value[0].value = list
    }
  }
  const beforeAvatarUpload = async (file, row, index) => {
    const { type } = file
    const imageType = type.split('/')[1]
    if (!['png', 'jpeg', 'jpg'].includes(imageType)) {
      ElMessage.error('上传文件格式错误')
    } else {
      // const res = await uploadImageFn(file)

      // const fi = sourceData.value.findIndex(item => item.key === row.key)
      // sourceData.value[fi].value[index].picture = res.fullPath

      ElMessage.error('不允许上传文件')
    }
    
    return false
  }
  const disabledSatandard = (list) => {
    setTimeout(() => {
      list.forEach(key => {
        const fi = standardList.value.findIndex(v => v.id === key)
        standardList.value[fi].disabled = true
      })
    }, 300)
  }
  const handleToOperatEvent = (val) => {
    setSkuOfStatus({
      productSkuIdList: [val.id],
      type: val.status === 3 ? 4 : 3
    })
  }
  const parseStandard = (val) => {
    const standardList = []

    val.forEach(item => {
      standardList.push(item.specsItemList)
    })

    const flatStandard = standardList.flat(Infinity)
    const tree = {}
    const list = []
    const disabledList = []
    let haveStandardPicture = false


    flatStandard.forEach(item => {
      // 是否开启图片开关逻辑判断
      if (!haveStandardPicture) {
        if (item.picture) {
          haveStandardPicture = true
        }
      }

      if (tree[item.code]) {
        // 去重 value -> 规格值一样的数据
        const current = tree[item.code]
        const result = current.value.some(cur => cur.value === item.value)

        if (!result) {
          current.value.push({
            value: item.value,
            picture: item.picture,
            key: genNonDuplicateID(4),
            disabled: true 
          })
        }
      } else {
        tree[item.code] = {
          key: genNonDuplicateID(4),
          id: +item.code,
          name: item.name,
          value: [{ value: item.value, picture: item.picture, key: genNonDuplicateID(4), disabled: true }],
          disabled: true,
        }

        list.push(tree[item.code])

        disabledList.push(+item.code)
      }
    })

    sourceData.value = [...list]
    checkboxSwitch.value = haveStandardPicture
    disabledSatandard(disabledList)
  }
  const parseStandardTable = (val) => {
    const data = val.map(item => {
      const params = {
        ...item,
      }

      item.specsItemList.forEach(item => {
        params[item.code] = item.value
      })
      return params
    })

    setTimeout(() => {
      standardTableRef.value.setComponentTableData(data)
    }, 1000)
  }
  const setComponentData = (val) => {
    const { defaultSkuVOList, skuVOList } = val

    if (Array.isArray(defaultSkuVOList) && defaultSkuVOList.length) {
      isAllow.value = true
      defaultTableRef.value.setComponentTableData(defaultSkuVOList)
      return
    }

    parseStandard(skuVOList)
    parseStandardTable(skuVOList)
  }
  const getComponentsForData = () => {
    const type = sourceData.value.length > 0
    let data = type ? standardTableRef.value.getAllTableData()
      : defaultTableRef.value.getAllTableData()

    // 如果开启规格图片，检查填加规格值是否全部携带图片
    if (type && checkboxSwitch.value) {
      const result = sourceData.value[0].value.every(item => item.picture)
      
      if (!result) {
        data = false
        ElMessage.error('请检查对应的规格值下面是否携带了规格图片')
      }
    }
    
    return { type: type ? 'skuVOList' : 'defaultSkuVOList' , data }
  }

  onBeforeMount(() => {
    getStandardList()
  })
  defineExpose({
    getComponentsForData,
    setComponentData,
    getDefStandardRef: () => defaultTableRef.value,
    getStandardRef: () => standardTableRef.value,
  })
</script>

<style lang="scss" scoped>
.specification {
  padding-bottom: 20px;
  .label {
    flex-shrink: 0;
    width: 120px;
    padding-right: 10px;
    text-align: right;
    color: #606260;
    font-size: 14px;
    font-weight: 700;
    & > span:first-child {
      margin-right: 10px;
      color: red;
    }
  }
  .header {
    & > div:first-child {
      display: flex;
      font-size: 12px;
      color: #888888;
      .list {
        width: 100%;
        overflow: hidden;
        .standard:last-child {
          margin-bottom: 20px;
        }
        .standard {
          margin-top: 15px;
          .base {
            display: flex;
            .icon-close {
              margin-left: 10px;
            }
            .value-container {
              width: 100%;
            }
            &-name {
              flex-shrink: 0;
              margin-top: 8px;
              margin-right: 10px;
              & > span:first-child {
                color: red;
                margin-right: 5px;
              }
            }
            &-value {
              display: flex;
              min-width: 110px;
              width: calc(100% - 80px);
              padding-bottom: 10px;
              overflow-x: scroll;
            }
            &-select {
              .select {
                display: flex;
                align-items: center;
              }
            }
            &-input {
              &-box {
                display: flex;
                align-items: center;
              }
            }
          }
        }
      }
    }
    .default-box {
      padding: 15px 50px;
    }
  }
  .detail {
    display: flex;
    &-content {
      width: calc(100% - 120px);
    }
  }
}

.avatar-uploader {
  .common-style {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    &:hover {
      border-color: var(--el-color-primary);
    }
  }
  .avatar {
    width: 120px;
    height: 120px;
    display: block;
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    & > img {
      width: 100%;
      height: 100%;
    }
    &:hover {
      .mask {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
        background: rgba($color: #5a5a5a, $alpha: 0.3);
        gap: 0 15px;
      }
    }
  }
}
.picture-list {
  display: flex;
}
.el-icon.avatar-uploader-icon {
 font-size: 28px;
 color: #8c939d;
 width: 120px;
 height: 120px;
 text-align: center;
}
.image-preview {
  width: 100%;
  height: 100%;
}
</style>