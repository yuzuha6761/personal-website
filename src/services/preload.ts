export const preloadImages = (
  sources: string[],
  onProgress?: (loaded: number, total: number) => void,
): Promise<void> => {
  if (sources.length === 0) {
    onProgress?.(0, 0)
    return Promise.resolve()
  }

  let loaded = 0
  const total = sources.length

  return Promise.all(
    sources.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image()

          const finish = () => {
            loaded++
            onProgress?.(loaded, total)
            resolve()
          }

          img.onload = finish
          img.onerror = finish
          img.src = src
        }),
    ),
  ).then(() => {})
}
