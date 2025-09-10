
import { InputImage } from "../types";

export const fileToInputImage = <T,>(file: File): Promise<InputImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('FileReader did not return a string.'));
      }
      // result is "data:mime/type;base64,..."
      const base64String = reader.result.split(',')[1];
      resolve({
        base64: base64String,
        mimeType: file.type,
        name: file.name,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
