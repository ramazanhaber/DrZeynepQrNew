import { UPLOAD_API_BASE_URL, UPLOAD_API_KEY } from "@/lib/config";

export async function uploadJsonFile(input: {
  sirketKod: string;
  subeKod: string;
  fileName: string;
  jsonContent: string;
}) {
  const response = await fetch(`${UPLOAD_API_BASE_URL}/api/qr-files/upload-json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": UPLOAD_API_KEY,
    },
    body: JSON.stringify({
      SirketKod: input.sirketKod,
      SubeKod: input.subeKod,
      FileName: input.fileName,
      JsonContent: input.jsonContent,
    }),
  });

  if (!response.ok) {
    throw new Error(`Json upload API hatasi (${response.status})`);
  }

  return (await response.json()) as {
    publicUrl: string;
    folderName: string;
    fileName: string;
  };
}

export async function uploadBinaryFile(input: {
  sirketKod: string;
  subeKod: string;
  fileName: string;
  bytes: Blob;
}) {
  const formData = new FormData();
  formData.set("SirketKod", input.sirketKod);
  formData.set("SubeKod", input.subeKod);
  formData.set("FileName", input.fileName);
  formData.set("File", input.bytes, input.fileName);

  const response = await fetch(`${UPLOAD_API_BASE_URL}/api/qr-files/upload`, {
    method: "POST",
    headers: {
      "X-Api-Key": UPLOAD_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload API hatasi (${response.status})`);
  }

  return (await response.json()) as {
    publicUrl: string;
    folderName: string;
    fileName: string;
  };
}
