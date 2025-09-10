export enum GenerationMode {
  TextToImage = "文字生成圖片",
  ImageToImage = "圖片生成圖片",
  MultiImage = "多圖參考",
  Figurine = "公仔生成",
}

export interface InputImage {
  base64: string;
  mimeType: string;
  name: string;
}