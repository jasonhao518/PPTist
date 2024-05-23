<template>
  <div class="layout-pool">
    <div class="list">
      <div 
        v-for="slide in layouts" 
        :key="slide.id"
      >
        <div class="layout-item" v-if="currentSlide.type === slide.type">
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
  height: 800px;
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