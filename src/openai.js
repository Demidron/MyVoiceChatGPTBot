import { Configuration, OpenAIApi } from "openai";
import { createReadStream } from "fs";
import config from "config";

class OpenAI {
  roles = {
    ASSISTANT: "assistant",
    USER: "user",
    SYSTEM: "system",
  };
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async chat(messages) {
    try {
      const responce = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages
      })
      return responce.data.choices[0].message
    } catch (error) {
      console.log("Error while chating", error.message);
    }
  }

  async transcription(filepath) {
    try {
      const responce = await this.openai.createTranscription(
        createReadStream(filepath),
        "whisper-1"
      );
      return responce.data.text;
    } catch (error) {
      console.log("Error while transcription", error.message);
    }
  }
}

export const openai = new OpenAI(config.get("OPENAI_KEY"));
