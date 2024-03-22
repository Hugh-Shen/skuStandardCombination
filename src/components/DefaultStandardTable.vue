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
    }
  },
  setup(props, { expose }) {
    const generateTableData = () => {
      const generateObject = {}

      renderColumnList.value.forEach(element => {
        generateObject[element.prop] = null
      })

      if (history.value) {
        tableData.value = history.value.map(item => item)
      } else {
        tableData.value = [{ ...generateObject }]
      }
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
    ])
    const renderColumnList = ref([])
    const tableData = ref([])
    const history = ref(null)


    watch(() => props.saleType, (cur, per) => {
      const list = columnList.value.filter(item => item.rules.includes(cur))
      renderColumnList.value = list
      
      generateTableData()
    }, { immediate: true })


    const validRulsFn = () => {
      // 验证规格是否填写
      let formValid = true
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

      if (!formValid) {
        ElMessage.error('请检查商品规格明细是否填写完成')
      }

      return formValid
    }
    const getAllTableData = (bre) => {
      // 如果携带参数直接跳过验证，返回数据
      if (bre) return tableData;

      const valid = validRulsFn()
      if (!valid) return false;

      return {
        tableData,
      }
    }
    const setComponentTableData = (val) => {
      history.value = val
    }


    expose({
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
