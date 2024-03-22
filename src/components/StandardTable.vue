<script lang="jsx">
import { defineComponent, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CustomizeTable from './CustomizeTable.vue'

export default defineComponent({
  props: {
    sourceData: {
      type: Array,
      default: () => ([])
    },
    saleType: {
      type: Number,
      default: 5,
    },
    productStatus: Number,
  },
  emits: ['operatEvent'],
  setup(props, { expose, emit }) {
    /** 工具方法 */
    const addDataWhileEditing = (data) => {
      const map = {}
      const historyMap = {}

      if (Array.isArray(history.value)) {
        history.value.forEach(item => {
          map[item.id] = {}
          historyMap[item.id] = item

          item.specsItemList.forEach(child => {
            map[item.id][child.code] = child.value
          })
        })

        
        for (const key in map) {
          if (Object.hasOwnProperty.call(map, key)) {
            const element = map[key]
            
            const kList = Object.keys(element) // key 值列表
            let result = true

            // 循环 key 值列表，知道可以完全匹配项
            for (let i = 0; i < data.length; i++) {
              const dataItem = data[i]
              
              for (let index = 0; index < kList.length; index++) {
                const c = kList[index]
                
                if (element[c] !== dataItem[c]) {
                  result = false

                  break;
                }
              }

              // key 值列表循环完成结果为真代表匹配
              if (result) {
                data[i] = { ...historyMap[key], ...data[i] }
              }

              result = true
            }
          }
        }
      }
      return data
    }
    const generateTableData = (data) => {
      let combine = function (...chunks) {
        let res = []
          
        let helper = function (chunkIndex, prev) {
          let chunk = chunks[chunkIndex]
          let isLast = chunkIndex === chunks.length - 1

          for (let val of chunk) {
            let cur = { ...prev, [val.id]: val.value  }
            cur.name = cur.name ? (cur.name + (val.value || '')) : val.value
            cur.combin = cur.combin ? cur.combin.concat({ ...val, code: val.id, name: val.label }) 
              : [{ ...val, code: val.id, name: val.label }]
              
            if (isLast) {
              // 如果已经处理到数组的最后一项了 则把拼接的结果放入返回值中
              res.push(cur)
            } else {
              helper(chunkIndex + 1, cur)
            }
          }
        }
      
        // 从属性数组下标为 0 开始处理
        // 并且此时的 prev 是个空数组
        helper(0, {})
      
        return res
      }

      const combineData = addDataWhileEditing(combine(...data))
      tableData.value = combineData
    }
    const generateHeaderAndColumn = (list) => {
      // 遍历所有添加的规格 (过滤没有选择名字的规格)
      const newList = list.filter(item => item.name).map(item => ({
        label: item.name,
        prop: item.id,
        id: item.id,
        value: item.value,
        sum: item.sum || 1,
      }))

      let updateList = [] // 待更新数据列表

      for (let index = 0; index < newList.length; index++) {
        const nl = newList[index]
        let isHas = false
        let childIndex = 0

        for (let j = 0; j < renderColumnList.value.length; j++) {
          const current = renderColumnList.value[j]
          childIndex = j

          if (current.rules) {
            break
          }
          if (nl.prop === current.prop) {
            isHas = true
          }
        }

        console.log('nl', nl);
        // 如果没有添加过 renderColumnList
        if (!isHas) {
          if (nl.sum <= 1) {
            renderColumnList.value.splice(childIndex, 0, nl)
          } else {
            renderColumnList.value.splice(childIndex - 1, 1, nl)
          }
        } else {  
          let add = []
          nl.value.forEach(element => {
            add.push(element.value)
          })

          updateList.push(add.map((item, index) => ({
            label: nl.label,
            id: nl.id,
            value: item,
            picture: nl.value[index].picture || ''
          })))
        }
      }

      if (updateList.length) {
        generateTableData(updateList)
      }
    }
    const isRenderOperatColumn = (cur) => {
      const list = columnList.value.filter(item => item.rules.includes(cur))
      if (props.productStatus !== 3) {
        list.splice(-1, 1)
      }
      renderColumnList.value = list
    }


    const columnList = ref([
      {
        label: '* sku名称',
        prop: 'name',
        rules: [1, 2, 5],
        valid: true,
        children: (row, data) => {
          return (
            <el-input maxlength="45" v-model={ row.name } />
          )
        }
      },
      {
        label: '* 市场价',
        prop: 'marketCurrentcyPrice',
        rules: [1],
        valid: true,
        children: (row, data) => {
          return (
            <el-input-number
              v-model={ row.marketCurrentcyPrice }
              min={ 0 }
              controls-position="right"
            />
          )
        }
      },
      {
        label: '* 价格(橙汁)',
        prop: 'salePointPrice',
        rules: [1],
        valid: true,
        children: (row, data) => {
          return (
            <el-input-number
              v-model={ row.salePointPrice }
              min={ 0 }
              controls-position="right"
            />
          )
        }
      },
      {
        label: '会员价(橙汁)',
        prop: 'memberPointPrice',
        rules: [1],
        children: (row, data) => {
          return (
            <el-input-number
              v-model={ row.memberPointPrice }
              min={ 0 }
              controls-position="right"
            />
          )
        }
      },
      {
        label: '* 价格',
        prop: 'saleCurrencyPrice',
        rules: [2],
        children: (row, data) => {
          return (
            <el-input-number
              v-model={ row.saleCurrencyPrice }
              min={ 0 }
              controls-position="right"
            />
          )
        }
      },
      {
        label: '会员价',
        prop: 'memberCurrencyPrice',
        rules: [2],
        children: (row, data) => {
          return (
            <el-input-number
              v-model={ row.memberCurrencyPrice }
              min={ 0 }
              controls-position="right"
            />
          )
        }
      },
      {
        label: '商家编码',
        prop: 'businessCode',
        rules: [1, 2, 5],
        children: (row, data) => {
          return (
            <el-input maxlength="20" v-model={ row.businessCode } />
          )
        }
      },
      {
        label: '商品条形码',
        prop: 'barCode',
        rules: [1, 2, 5],
        children: (row, data) => {
          return (
            <el-input maxlength="20" v-model={ row.barCode } />
          )
        }
      },
      {
        label: '操作',
        prop: 'operat',
        rules: [1, 2, 5],
        children: (row, data) => {
          const styles = {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '60px',
            height: '35px',
            borderRadius: '5px',
            color: '#fff',
            cursor: 'pointer',
          }
          const setUpAndRemoveProducts = (val) => {
            emit('operatEvent', val)
          }
          return (
            [1, 3, 4].includes(row.status) ?
              <div style={{ display: 'flex' }}>
                { [1, 4].includes(row.status) &&
                  <div
                    style={{ ...styles, background: '#4093ef', marginRight: '5px' }}
                    onClick={ () => setUpAndRemoveProducts(row) }
                  >
                    上架
                  </div>
                }
                { [1, 3].includes(row.status) &&
                  <div
                    style={{ ...styles, background: '#f56c6c' }}
                    onClick={ () => setUpAndRemoveProducts(row) }
                  >
                    下架
                  </div>
                }
              </div>
              : null
          )
        }
      },
    ])
    const renderColumnList = ref([])
    const tableData = ref([])
    const history = ref(null)


    watch(() => props.sourceData, (cur, pre) => {
      generateHeaderAndColumn(cur)
    }, { deep: true })
    watch(() => props.saleType, (cur, per) => {
      isRenderOperatColumn(cur)
      
      if (props.sourceData.length) {
        generateHeaderAndColumn(props.sourceData)
      }
    }, { immediate: true })
    watch(() => props.productStatus, () => {
      isRenderOperatColumn(props.saleType)
    })


    const delColumnListFn = (val) => {
      if (val.id) {
        const index = renderColumnList.value.findIndex(item => item.id === val.id)

        renderColumnList.value.splice(index, 1)
      }
    }
    const validRulsFn = () => {
      // 验证规格是否填写
      let result = true
      let formValid = true
      for (let index = 0; index < props.sourceData.length; index++) {
        const standard = props.sourceData[index]
        
        if (!standard.name || !standard.value.length) {
          result = false
          break
        }
        if (standard.value.length) {
          result = standard.value.every(item => item.value)
        }
      }

      if (!result) {
        ElMessage.error('请检查商品规格是否填写完成')
      } else {
        const validList = []

        renderColumnList.value.forEach(item => {
          if (item.valid) {
            validList.push(item.prop)
          }
        })
        validList.forEach(key => {
          for (let index = 0; index < tableData.value.length; index++) {
            const current = tableData.value[index]
            if (!current[key]) {
              formValid = false
              break
            }
          }
        })
      }

      if (!formValid) {
        ElMessage.error('请检查商品规格明细是否填写完成')
      }

      return result && formValid
    }
    const getAllTableData = () => {
      const valid = validRulsFn()
      
      if (!valid) return false;

      return {
        tableData,
      }
    }
    const setComponentTableData = (val) => {
      tableData.value = val
      history.value = val
    }


    expose({
      delColumnListFn,
      getAllTableData,
      setComponentTableData,
    })

    return () => (
      <CustomizeTable
        showCell={ false }
        columnList={ renderColumnList.value }
        tableData={ tableData.value }
      />
    )
  },
})
</script>
<style lang="scss" scoped>
  :deep(.el-input-number) {
    width: 100% !important;
  }
</style>
