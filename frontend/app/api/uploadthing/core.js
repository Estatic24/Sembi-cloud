import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  coverUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 }
  }).onUploadComplete(({ file, metadata }) => {
    console.log("Upload complete", file, metadata);
    if (!file) {
      console.error("Ошибка: файл не был загружен!");
      return { error: "No file uploaded" };
    }
    return { url: file.url };
  }),
  
  avatarUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 }
  }).onUploadComplete(({ file, metadata }) => {
    console.log("Upload complete", file, metadata);
    if (!file) {
      console.error("Ошибка: файл не был загружен!");
      return { error: "No file uploaded" };
    }
    return { url: file.url };
  }),
  
  audioUploader: f({
    audio: { maxFileSize: "20MB", maxFileCount: 1 }
  }).onUploadComplete(({ file }) => {
    if (!file) throw new Error("Ошибка загрузки трека");
    return { url: file.url, name: file.name };
  })
};