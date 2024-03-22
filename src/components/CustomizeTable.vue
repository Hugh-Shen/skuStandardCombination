<script lang="jsx">
import { ref, defineComponent } from "vue"
import { ElTable, ElTableColumn, ElPagination } from 'element-plus'
import CellBar from './CellBar.vue'


export default defineComponent({
  props: {
    columnList: {
      type: Array,
      default: () => []
    },
    tableData: {
      type: Array,
      default: () => []
    },
    pagesConfig: {
      type: Object,
      default: () => ({ total: 0, pageSize: 10 })
    },
    showCell: {
      type:Boolean,
      default: true,
    },
  },
  emits: ['paginationChange', 'cellBar'], 
  setup: (props, { emit }) => {
    const handleClickCellBar = (val) => {
      emit('cellBar', val)
    }
    const paginatioChange = (val) => {
      emit('paginationChange', val)
    }

    return () => (
      <div>
        {
          props.showCell && <CellBar onClick={ (val) => handleClickCellBar(val) } />
        }
        <ElTable data={ props.tableData } style={{ width: '100%' }}>
          {
            props.columnList.map((item) => {
              return item.children ?
                <ElTableColumn
                  prop={ item.prop }
                  width={ item.width || 180 }
                  fixed={ item.fixed }
                  label={ item.label } 
                  v-slots={{
                    default: ({ column, row }) => item.children(row, column)
                  }}
                />
                : <ElTableColumn prop={ item.prop } fixed={ item.fixed } label={ item.label } />
            })
          }
        </ElTable>
        {
          props.pagesConfig.total ?
            <ElPagination
              background
              layout="prev, pager, next"
              class="mt-20"
              { ...props.pagesConfig }
              onCurrentChange={ (val) => paginatioChange(val) }
            /> : null
        }
      </div>
    )
  }
})
</script>

<style lang="scss" scoped></style>
