export function triggerFileDownload(
  filename: string,
  content: string,
  mimeType = 'text/plain;charset=utf-8',
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function readFileAsDataUrl(
  file: File,
  maxBytes: number,
): Promise<{ dataUrl: string; fileName: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      const limitMb = (maxBytes / 1_000_000).toFixed(1).replace(/\.0$/, '');
      const sizeMb = (file.size / 1_000_000).toFixed(1);
      reject(
        new Error(
          `"${file.name}" is ${sizeMb} MB (max ${limitMb} MB). Host larger files externally and paste the URL.`,
        ),
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve({
          dataUrl: reader.result,
          fileName: file.name,
          mimeType: file.type,
        });
      } else {
        reject(new Error(`Unable to read "${file.name}".`));
      }
    };
    reader.onerror = () => reject(new Error(`Unable to read "${file.name}".`));
    reader.readAsDataURL(file);
  });
}
