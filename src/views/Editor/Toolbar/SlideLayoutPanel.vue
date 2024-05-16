<template>
  <div class="element-outline">
    <div class="row">
      <div style="width: 40%;">布局类型：</div>
      <Select 
        style="width: 60%;" 
        :value="currentSlide.type || ''" 
         @update:value="value => currentSlide.type = value as 'cover' | 'toc' | 'ending' | 'level1' | 'level2' | 'level3' | 'content' "
        :options="[
          { label: '默认', value: 'common' },
          { label: '封面', value: 'cover' },
          { label: '目录', value: 'toc' },
          { label: '一级标题', value: 'level1' },
          { label: '二级标题', value: 'level2' },
          { label: '内容', value: 'content' },
          { label: '结尾', value: 'ending' },
        ]"
      />
    </div>
    <div class="row">
      <div style="width: 40%;">布局ID：</div>
      <Input 
        style="width: 60%;" 
        :value="currentSlide.id || ''" 
         @update:value="value => currentSlide.id = value  "
      />
    </div>
    <div class="row">
      <div style="width: 40%;">布局名称：</div>
      <Input 
        style="width: 60%;" 
        :value="currentSlide.name || ''" 
         @update:value="value => currentSlide.name = value  "
      />
    </div>
    <div class="row">
      <Button style="flex: 1;" @click="saveLayout(currentSlide)">保存布局</Button>
    </div>
  </div>
  <div class="layout-pool">
    <div class="list">
      <div 
        v-for="slide in layouts" 
        :key="slide.id"
      >
        <div v-if="currentSlide.data && slide.type === slideType && currentSlide.data.blocks === slide.blocks && currentSlide.data.list === slide.list" class="layout-item">
          <ThumbnailSlide class="thumbnail" :slide="slide" :size="180" />

          <div class="btns">
            <Button  class="btn" type="primary" size="small" @click="applyTemplate(slide)">应用模板</Button>       
          </div>
        </div>
      </div>
    </div>
    </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useSlidesStore } from '@/store'
import type { Slide } from '@/types/slides'
import useSlideHandler from '@/hooks/useSlideHandler'
import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue'
import Button from '@/components/Button.vue'
import Select from '@/components/Select.vue'
import Input from '@/components/Input.vue'
import useSlideTheme from '@/hooks/useSlideTheme'
const {
  applySlideTemplate,
} = useSlideHandler()

const {
  saveLayout,
} = useSlideTheme()

const slidesStore = useSlidesStore()
const { layouts, slideType, currentSlide } = storeToRefs(slidesStore)
const applyTemplate = (slide: Slide) => {
  applySlideTemplate(slide)
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
.layout-pool {
  width: 382px;
  height: 500px;
}
.header {
  height: 40px;
  margin: -10px -10px 8px -10px;
  padding: 10px 12px 0 12px;
  background-color: $lightGray;
  border-bottom: 1px solid $borderColor;
}
.list {
  height: calc(100% - 40px);
  padding: 2px;
  margin-right: -10px;
  padding-right: 10px;
  overflow: auto;
  @include flex-grid-layout();
}
.layout-item {
  position: relative;
  @include flex-grid-layout-children(2, 48%);

  &:nth-last-child(2), &:last-child {
    margin-bottom: 0;
  }

  &:hover .btns {
    opacity: 1;
  }

  &:hover .thumbnail {
    outline-color: $themeColor;
  }

  .btns {
    @include absolute-0();

    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: flex;
    background-color: rgba($color: #000, $alpha: .25);
    opacity: 0;
    transition: opacity $transitionDelay;
  }

  .thumbnail {
    outline: 2px solid $borderColor;
    transition: outline $transitionDelay;
    border-radius: $borderRadius;
    cursor: pointer;
  }
}
</style>