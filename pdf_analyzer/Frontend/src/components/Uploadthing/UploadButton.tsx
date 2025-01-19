import { generateReactHelpers, generateUploadButton } from "@uploadthing/react";
const API_URL = import.meta.env.VITE_API_URL;

export const UploadButton = generateUploadButton({
  url: `${API_URL}/api/uploadthing`,
});


export const { useUploadThing, uploadFiles } =
  generateReactHelpers<any>({
    url: `${API_URL}/api/uploadthing`
  });
