export const pdfImageResizer = async (src: string): Promise<string | null> => {
  if (!src) return null

  return new Promise((resolve) => {
    const img = new window.Image()
    img.crossOrigin = "Anonymous"
    img.src = src

    img.onload = () => {
      const canvas = document.createElement("canvas")
      const targetWidth = 300
      const scale = targetWidth / img.width

      canvas.width = targetWidth
      canvas.height = img.height * scale

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/png"))
      } else {
        resolve(src)
      }
    }

    img.onerror = () => {
      console.warn("Failed to load invoice logo")
      resolve(null)
    }
  })
}
