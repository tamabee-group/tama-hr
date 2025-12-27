import loadImage from "blueimp-load-image";

export async function compressImageToWebP(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.85,
): Promise<File> {
  const MAX_OUTPUT_SIZE = 1 * 1024 * 1024; // 1MB

  if (!file.type.startsWith("image/")) {
    throw new Error("File không phải là ảnh");
  }

  return new Promise((resolve, reject) => {
    loadImage(
      file,
      (img) => {
        if (img instanceof Event) {
          reject(new Error("Không thể load ảnh"));
          return;
        }

        const canvas = img as HTMLCanvasElement;

        const compressWithQuality = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Không thể convert ảnh sang WebP"));
                return;
              }

              // Nếu vẫn quá 1MB và quality > 0.3, giảm quality
              if (blob.size > MAX_OUTPUT_SIZE && q > 0.3) {
                compressWithQuality(q - 0.1);
                return;
              }

              const webpFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, ".webp"),
                { type: "image/webp" },
              );
              resolve(webpFile);
            },
            "image/webp",
            q,
          );
        };

        compressWithQuality(quality);
      },
      {
        maxWidth,
        canvas: true,
        orientation: true, // Auto-rotate iPhone images
      },
    );
  });
}
