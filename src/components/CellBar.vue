<template>
  <div class="cell-bar">
    <el-button
      v-for="(item, index) in renderList"
      :key="index"
      :type="item.type"
      :size="item.size"
      :icon="item.icon"
      plain
      @click="handleClickEvent(item)"
    >
      {{ item.label }}
    </el-button>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import * as PlusIcon from '@element-plus/icons-vue'


  const props = defineProps({
    list: {
      type: Array,
      default: () => [
        {
          type: 'primary',
          size: 'small',
          icon: 'Plus',
          label: '新增',
        }
      ]
    }
  })
  
  const emits = defineEmits(['click'])

  const renderList = computed(() => {
    return props.list.map((val) => ({
      ...val,
      icon: PlusIcon[val.icon]
    }))
  })
  const handleClickEvent = (val) => {
    emits('click', val)
  }
</script>

<style lang="scss" scoped>
  .cell-bar {
    padding-bottom: 15px;
  }
</style>