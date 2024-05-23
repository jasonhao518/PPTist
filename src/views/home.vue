<template>
  <div class="flex flex-col h-screen">

    <div class="sticky bottom-0 w-full p-6 pb-8 bg-gray-100">

      <div class="flex">
        <input
          class="input"
          :type="'text'"
          :placeholder="'请输入标题'"
          v-model="messageContent"
        />
        <button class="btn" :disabled="isTalking" @click="sendChatMessage()">
          {{ "发送" }}
        </button>
      </div>
    </div>

    <div class="flex-1 mx-2 mt-20 mb-2 overflow-y-scroll" ref="chatListDom">
      <div
        class="group flex flex-col px-4 py-3 hover:bg-slate-100 rounded-lg"
        v-for="item of messageList.filter((v) => v.role !== 'system')"
      >
        <div class="flex justify-between items-center mb-2">
          <div class="font-bold">{{ roleAlias[item.role] }}：</div>
        </div>
        <div>
          <div
            class="prose text-sm text-slate-600 leading-relaxed"
            v-if="item.content"
            v-html="md.render(item.content)"
          ></div>
          <Loding v-else />
        </div>
      </div>
    </div>

    <div class="sticky bottom-0 w-full p-6 pb-8 bg-gray-100">


        <button class="btn" :disabled="isTalking || messageList.length <3" @click="generatePPT()">
          生成PPT
        </button>

    </div>

  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from "@/types";
import { ref, watch, nextTick, onMounted } from "vue";
import { chat } from "@/libs/gpt";
import cryptoJS from "crypto-js";
import Loding from "@/components/Loding.vue";
import Copy from "@/components/Copy.vue";
import { md } from "@/libs/markdown";
import { useSlidesStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import useSlideTheme from '@/hooks/useSlideTheme'
const slidesStore = useSlidesStore()
const { slides, currentSlide, viewportRatio, theme, themes } = storeToRefs(slidesStore)
const router = useRouter()

const {
  applyPresetThemeToSingleSlide,
  applyPresetThemeToAllSlides,
  applyThemeToAllSlides,
} = useSlideTheme()

let apiKey = "";
let isConfig = ref(false);
let isTalking = ref(false);
let messageContent = ref("");
const chatListDom = ref<HTMLDivElement>();
const decoder = new TextDecoder("utf-8");
const roleAlias = { user: "我", assistant: "我的私有知识库智能体", system: "System" };
const messageList = ref<ChatMessage[]>([
  {
    role: "system",
    content: "你是一个文案助手，根据下面用户输入的标题，使用中文生成PPT的大纲，包含各级标题和要点,每个标题三条要点"
  },
]);

onMounted(() => {
  if (getAPIKey()) {
    switchConfigStatus();
  }
});

const sendChatMessage = async (content: string = messageContent.value) => {
  try {
    isTalking.value = true;
    while (messageList.value.length > 1) {
      messageList.value.pop();
    }
    messageList.value.push({ role: "user", content });
    clearMessageContent();
    messageList.value.push({ role: "assistant", content: "" });

    const { body, status } = await chat(messageList.value, getAPIKey());
    if (body) {
      const reader = body.getReader();
      await readStream(reader, status);
    }
  } catch (error: any) {
    appendLastMessageContent(error);
  } finally {
    isTalking.value = false;
  }
};

const readStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  status: number
) => {
  let partialLine = "";

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { value, done } = await reader.read();
    if (done) break;

    const decodedText = decoder.decode(value, { stream: true });

    if (status !== 200) {
      const json = JSON.parse(decodedText); // start with "data: "
      const content = json.error.message ?? decodedText;
      appendLastMessageContent(content);
      return;
    }

    const chunk = partialLine + decodedText;
    const newLines = chunk.split(/\r?\n/);

    partialLine = newLines.pop() ?? "";

    for (const line of newLines) {
      if (line.length === 0) continue; // ignore empty message
      if (line.startsWith(":")) continue; // ignore sse comment message
      if (line === "data: [DONE]") return; //

      const json = JSON.parse(line.substring(6)); // start with "data: "
      const content =
        status === 200
          ? json.choices[0].delta.content ?? ""
          : json.error.message;
      appendLastMessageContent(content);
    }
  }
};

const appendLastMessageContent = (content: string) =>
  (messageList.value[messageList.value.length - 1].content += content);

const generatePPT = async () => {
  try {
    isTalking.value = true
    slidesStore.loadThemes()
    await slidesStore.generate(messageList.value.map( item => {
      return {...item, name: item.role}
    })
    )
    applyPresetThemeToAllSlides(themes.value[0])
  }
  finally {
    isTalking.value = false
  }
  router.push(`/editor`)
}
const sendOrSave = () => {
  if (!messageContent.value.length) return;
  if (isConfig.value) {
    if (saveAPIKey(messageContent.value.trim())) {
      switchConfigStatus();
    }
    clearMessageContent();
  } else {
    sendChatMessage();
  }
};

const clickConfig = () => {
  if (!isConfig.value) {
    messageContent.value = getAPIKey();
  } else {
    clearMessageContent();
  }
  switchConfigStatus();
};

const getSecretKey = () => "lianginx";

const saveAPIKey = (apiKey: string) => {
  if (apiKey.slice(0, 3) !== "sk-" || apiKey.length !== 51) {
    alert("API Key 错误，请检查后重新输入！");
    return false;
  }
  const aesAPIKey = cryptoJS.AES.encrypt(apiKey, getSecretKey()).toString();
  localStorage.setItem("apiKey", aesAPIKey);
  return true;
};

const getAPIKey = () => {
  if (apiKey) return apiKey;
  const aesAPIKey = localStorage.getItem("apiKey") ?? "";
  apiKey = cryptoJS.AES.decrypt(aesAPIKey, getSecretKey()).toString(
    cryptoJS.enc.Utf8
  );
  return apiKey;
};

const switchConfigStatus = () => (isConfig.value = !isConfig.value);

const clearMessageContent = () => (messageContent.value = "");


</script>

<style scoped>
pre {
  font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica,
    "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB",
    "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN",
    "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti",
    SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
}
</style>
