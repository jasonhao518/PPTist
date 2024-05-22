<template>
  <div class="element-outline">
    <div class="row" v-if="!fixed">
      <div style="width: 40%;">启用模版：</div>
      <div class="switch-wrapper" style="width: 60%;">
        <Switch 
          :value="hasOutline" 
          @update:value="value => toggleOutline(value)" 
        />
      </div>
    </div>
    <template v-if="hasOutline && outline">
      <div class="row" v-if="!fixed">
        <div style="width: 40%;">主元素：</div>
        <div class="switch-wrapper" style="width: 60%;">
          <Switch 
            :value="outline.main || false" 
            @update:value="value => updateOutline({ main: value })"
          />
        </div>
      </div>
      <div class="row" v-if="!fixed">
        <div style="width: 40%;">聚合：</div>
        <div class="switch-wrapper" style="width: 60%;">
          <Switch 
            :value="outline.aggregate || false" 
            @update:value="value => updateOutline({ aggregate: value })"
          />
        </div>
      </div>
      <div class="row">
        <div style="width: 40%;">数据类型：</div>
        <Select 
          style="width: 60%;" 
          :value="outline.accept || ''" 
          @update:value="value => updateOutline({ accept: value as 'Heading' | 'HeadingNum' | 'Paragraph' | 'ListItem' | 'Image' | 'Text' | 'StrongEmphasis' })"
          :options="[
            { label: '标题', value: 'Heading' },
            { label: '标题序号', value: 'HeadingNum' },
            { label: '段落', value: 'Paragraph' },
            { label: '段落标题', value: 'StrongEmphasis' },
            { label: '列表项', value: 'ListItem' },
            { label: '文本', value: 'Text' },
            { label: '图片', value: 'Image' },
          ]"
        />
      </div>
      <div class="row" v-if="handleElement.groupId && outline.main">
        <div style="width: 40%;">组合数据类型：</div>
        <Select 
          style="width: 60%;" 
          :value="outline.groupAccept || ''" 
          @update:value="value => updateOutline({ groupAccept: value as 'Heading' | 'Paragraph' | 'ListItem' | 'Image' })"
          :options="[
            { label: '标题', value: 'Heading' },
            { label: '段落', value: 'Paragraph' },
            { label: '列表项', value: 'ListItem' },
            { label: '图片', value: 'Image' },
          ]"
        />
      </div>
      <div class="row">
        <div style="width: 40%;">模版：</div>
        <Input 
          style="width: 60%;" 
          :value="outline.template || handleElement.content" 
          @update:value="value => updateOutline({ template: value })"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTElementPlaceholder } from '@/types/slides'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import ColorButton from './ColorButton.vue'
import ColorPicker from '@/components/ColorPicker/index.vue'
import Switch from '@/components/Switch.vue'
import NumberInput from '@/components/NumberInput.vue'
import Select from '@/components/Select.vue'
import Input from '@/components/Input.vue'
import Popover from '@/components/Popover.vue'

withDefaults(defineProps<{
  fixed?: boolean
}>(), {
  fixed: false,
})

const slidesStore = useSlidesStore()
const { theme } = storeToRefs(slidesStore)
const { handleElement } = storeToRefs(useMainStore())

const outline = ref<PPTElementPlaceholder>()
const hasOutline = ref(false)

watch(handleElement, () => {
  if (!handleElement.value) return
  outline.value = 'placeholder' in handleElement.value ? handleElement.value.placeholder : undefined
  hasOutline.value = !!outline.value
}, { deep: true, immediate: true })

const { addHistorySnapshot } = useHistorySnapshot()

const updateOutline = (outlineProps: Partial<PPTElementPlaceholder>) => {
  if (!handleElement.value) return
  const props = { placeholder: { ...outline.value, ...outlineProps } }
  slidesStore.updateElement({ id: handleElement.value.id, props })
  addHistorySnapshot()
}

const toggleOutline = (checked: boolean) => {
  if (!handleElement.value) return
  if (checked) {
    const _outline: PPTElementPlaceholder = {}
    slidesStore.updateElement({ id: handleElement.value.id, props: { placeholder: _outline } })
  }
  else {
    slidesStore.removeElementProps({ id: handleElement.value.id, propName: 'placeholder' })
  }
  addHistorySnapshot()
}
</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.switch-wrapper {
  text-align: right;
}
</style>