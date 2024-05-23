<template>
  <div class="slide-design-panel">
    <div class="theme-list">
      <div 
        class="theme-item" 
        v-for="(item, index) in themes" 
        :key="index"
        :style="{
          backgroundColor: item.background.common.color,
          backgroundImage: 'url(' +item.background.common.image + ')',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          fontFamily: item.fontname,
        }"
      >
        <div class="theme-item-content">
          <div class="text" :style="{ color: item.fontColor }">文字 Aa</div>
          <div class="colors">
            <div class="color-block" v-for="(color, index) in item.colors" :key="index" :style="{ backgroundColor: color}"></div>
          </div>

          <div class="btns">
            <Button type="primary" size="small" @click="applyPresetThemeToSingleSlide(item)">应用</Button>
            <Button type="primary" size="small" style="margin-top: 3px;" @click="applyPresetThemeToAllSlides(item)">应用全局</Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Modal
    v-model:visible="themeStylesExtractVisible" 
    :width="320"
    @closed="themeStylesExtractVisible = false"
  >
    <ThemeStylesExtract @close="themeStylesExtractVisible = false" />
  </Modal>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { SlideBackground, SlideTheme } from '@/types/slides'
// import { PRESET_THEMES } from '@/configs/theme'
import { WEB_FONTS } from '@/configs/font'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'
import useSlideTheme from '@/hooks/useSlideTheme'
import { getImageDataURL } from '@/utils/image'

import ThemeStylesExtract from './ThemeStylesExtract.vue'
import ColorButton from './common/ColorButton.vue'
import FileInput from '@/components/FileInput.vue'
import ColorPicker from '@/components/ColorPicker/index.vue'
import Divider from '@/components/Divider.vue'
import Slider from '@/components/Slider.vue'
import Button from '@/components/Button.vue'
import Select from '@/components/Select.vue'
import Input from '@/components/Input.vue'
import Popover from '@/components/Popover.vue'
import NumberInput from '@/components/NumberInput.vue'
import Modal from '@/components/Modal.vue'

const slidesStore = useSlidesStore()
const { availableFonts } = storeToRefs(useMainStore())
const { slides, currentSlide, viewportRatio, theme, themes } = storeToRefs(slidesStore)
const moreThemeConfigsVisible = ref(false)
const themeStylesExtractVisible = ref(false)
const slideType = ref('common')

const background = computed(() => {
  if (!currentSlide.value.background) {
    return {
      type: 'solid',
      value: '#fff',
    } as SlideBackground
  }
  return currentSlide.value.background
})

const { addHistorySnapshot } = useHistorySnapshot()
const {
  applyPresetThemeToSingleSlide,
  applyPresetThemeToAllSlides,
  applyThemeToAllSlides,
  saveTheme,
  saveBackground,
} = useSlideTheme()

// 设置背景模式：纯色、图片、渐变色
const updateBackgroundType = (type: 'solid' | 'image' | 'gradient') => {
  if (type === 'solid') {
    const newBackground: SlideBackground = {
      ...background.value,
      type: 'solid',
      color: background.value.color || '#fff',
    }
    slidesStore.updateSlide({ background: newBackground })
  }
  else if (type === 'image') {
    const newBackground: SlideBackground = {
      ...background.value,
      type: 'image',
      image: background.value.image || '',
      imageSize: background.value.imageSize || 'cover',
    }
    slidesStore.updateSlide({ background: newBackground })
  }
  else {
    const newBackground: SlideBackground = {
      ...background.value,
      type: 'gradient',
      gradientType: background.value.gradientType || 'linear',
      gradientColor: background.value.gradientColor || ['#fff', '#fff'],
      gradientRotate: background.value.gradientRotate || 0,
    }
    slidesStore.updateSlide({ background: newBackground })
  }
  addHistorySnapshot()
}


const updateBackgroundSlideType = (type: 'cover' | 'toc' | 'ending' | 'section' | 'paragraph' | 'level3' | 'content') => {
  slideType.value = type
}

// 设置背景图片
const updateBackground = (props: Partial<SlideBackground>) => {
  slidesStore.updateSlide({ background: { ...background.value, ...props } })
  addHistorySnapshot()
}

// 上传背景图片
const uploadBackgroundImage = (files: FileList) => {
  const imageFile = files[0]
  if (!imageFile) return
  getImageDataURL(imageFile).then(dataURL => updateBackground({ image: dataURL }))
}

// 应用当前页背景到全部页面
const applyBackgroundAllSlide = () => {
  const newSlides = slides.value.map(slide => {
    return {
      ...slide,
      background: currentSlide.value.background,
    }
  })
  slidesStore.setSlides(newSlides)
  addHistorySnapshot()
}

// 设置主题
const updateTheme = (themeProps: Partial<SlideTheme>) => {
  slidesStore.setTheme(themeProps)
}

// 设置画布尺寸（宽高比例）
const updateViewportRatio = (value: number) => {
  slidesStore.setViewportRatio(value)
}
</script>

<style lang="scss" scoped>
.slide-design-panel {
  user-select: none;
}
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  .more {
    cursor: pointer;

    .text {
      font-size: 12px;
      margin-right: 3px;
    }
  }
}
.background-image-wrapper {
  margin-bottom: 10px;
}
.background-image {
  height: 0;
  padding-bottom: 56.25%;
  border: 1px dashed $borderColor;
  border-radius: $borderRadius;
  position: relative;
  transition: all $transitionDelay;

  &:hover {
    border-color: $themeColor;
    color: $themeColor;
  }

  .content {
    @include absolute-0();

    display: flex;
    justify-content: center;
    align-items: center;
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    cursor: pointer;
  }
}

.theme-list {
  @include flex-grid-layout();
}
.theme-item {
  @include flex-grid-layout-children(2, 48%);

  padding-bottom: 30%;
  border-radius: $borderRadius;
  position: relative;
  cursor: pointer;

  .theme-item-content {
    @include absolute-0();

    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 8px;
    border: 1px solid $borderColor;
    border-radius: $borderRadius;
  }

  .text {
    font-size: 16px;
  }
  .colors {
    display: flex;
  }
  .color-block {
    margin-top: 8px;
    width: 12px;
    height: 12px;
    margin-right: 2px;
  }

  &:hover .btns {
    opacity: 1;
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
}
</style>