import type { ChatMessage } from "@/types";

export async function chat(messageList: ChatMessage[], apiKey: string) {
  try {
    const result = await fetch("http://localhost:8080/chatgpt/v1/chat/completions", {
      method: "post",
      // signal: AbortSignal.timeout(8000),
      // 开启后到达设定时间会中断流式输出
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: messageList,
      }),
    });
    return result;
  } catch (error) {
    throw error;
  }
}
