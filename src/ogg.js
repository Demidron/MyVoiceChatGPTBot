import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import installer from "@ffmpeg-installer/ffmpeg";
import { createWriteStream } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { removeFile } from "./utils.js";
import { openai } from "./openai.js";

const _dirName = dirname(fileURLToPath(import.meta.url));

class OggConverter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path);
  }

  async toMp3(input, output) {
    try {
      const outputPath = resolve(dirname(input), `${output}.mp3`);
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .inputOption("-t 30")
          .output(outputPath)
          .on("end", () => {
            removeFile(input);
            resolve(outputPath);
          })
          .on("error", (err) => reject(err.message))
          .run();
      });
    } catch (error) {
      console.log("Error while creating mp3", error.message);
    }
  }

  async create(url, filename) {
    try {
      const oggPath = resolve(_dirName, "../voices", `${filename}.ogg`);
      const response = await axios({
        method: "get",
        url,
        responseType: "stream",
      });
      return new Promise((resolve) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);
        stream.on("finish", () => resolve(oggPath));
      });
    } catch (error) {
      console.log("Error while creating ogg", error.message);
    }
  }

  async voiceToText(ctx) {
    try {
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);
        const oggPath = await this.create(link.href, userId);
        const mp3Path = await this.toMp3(oggPath, userId);
        return await openai.transcription(mp3Path);
    } catch (error) {
        console.log("Error while voice to text message:", error.message);
    }
  }

  async askChat(ctx, text) {
    try {
      ctx.session.messages.push({ role: openai.roles.USER, content: text });
      const responce = await openai.chat(ctx.session.messages);
      ctx.session.messages.push({
        role: openai.roles.ASSISTANT,
        content: responce.content,
      });
      return responce.content;
    } catch (error) {
      console.log("Error while ask chat", error.message);
      return "Ошибка запроса";
    }

   
  }
}

export const ogg = new OggConverter();
