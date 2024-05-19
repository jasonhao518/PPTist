<template>
  <div class="pptist-editor">
    <EditorHeader class="layout-header" />
    <div class="layout-content">
      <Thumbnails class="layout-content-left" />
      <div class="layout-content-center">
        <CanvasTool class="center-top" />
        <Canvas class="center-body" :style="{ height: `calc(100% - ${remarkHeight + 40}px)` }" />
        <Remark
          class="center-bottom" 
          v-model:height="remarkHeight" 
          :style="{ height: `${remarkHeight}px` }"
        />
      </div>
      <Toolbar class="layout-content-right" />
    </div>
  </div>

  <SelectPanel v-if="showSelectPanel" />
  <SearchPanel v-if="showSearchPanel" />
  <NotesPanel v-if="showNotesPanel" />

  <Modal
    :visible="!!dialogForExport" 
    :width="680"
    @closed="closeExportDialog()"
  >
    <ExportDialog />
  </Modal>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUpdated } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import useGlobalHotkey from '@/hooks/useGlobalHotkey'
import usePasteEvent from '@/hooks/usePasteEvent'

import EditorHeader from './EditorHeader/index.vue'
import Canvas from './Canvas/index.vue'
import CanvasTool from './CanvasTool/index.vue'
import Thumbnails from './Thumbnails/index.vue'
import Toolbar from './Toolbar/index.vue'
import Remark from './Remark/index.vue'
import ExportDialog from './ExportDialog/index.vue'
import SelectPanel from './SelectPanel.vue'
import SearchPanel from './SearchPanel.vue'
import NotesPanel from './NotesPanel.vue'
import Modal from '@/components/Modal.vue'
const slidesStore = useSlidesStore()
const { currentSlide } = storeToRefs(slidesStore)
const mainStore = useMainStore()
const { dialogForExport, showSelectPanel, showSearchPanel, showNotesPanel } = storeToRefs(mainStore)
const closeExportDialog = () => mainStore.setDialogForExport('')

const router = useRouter()
const remarkHeight = ref(40)

useGlobalHotkey()
usePasteEvent()

onMounted(() => {
  setTimeout(() => {
    const id = router.currentRoute.value.params.id
    console.log(id)
    if (currentSlide.presentationId !== id) {
      // reload
      console.log('reload')
      slidesStore.reload(id)
    }
  }, 500)
  
})

</script>

<style lang="scss" scoped>
.pptist-editor {
  height: 100%;
}
.layout-header {
  height: 40px;
}
.layout-content {
  height: calc(100% - 40px);
  display: flex;
}
.layout-content-left {
  width: 160px;
  height: 100%;
  flex-shrink: 0;
}
.layout-content-center {
  width: calc(100% - 160px - 260px);

  .center-top {
    height: 40px;
  }
}
.layout-content-right {
  width: 40%;
  height: 100%;
}
</style>