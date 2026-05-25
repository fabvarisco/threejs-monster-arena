export const HEADER_H = 64;
export const vpWidth = () => window.innerWidth;
export const vpHeight = () => window.innerHeight - HEADER_H;
export const vpAspect = () => vpWidth() / vpHeight();

export function coverTexture(texture, canvasAspect) {
  const imageAspect = texture.image.width / texture.image.height;
  if (canvasAspect > imageAspect) {
    texture.repeat.set(1, imageAspect / canvasAspect);
    texture.offset.set(0, (1 - imageAspect / canvasAspect) / 2);
  } else {
    texture.repeat.set(canvasAspect / imageAspect, 1);
    texture.offset.set((1 - canvasAspect / imageAspect) / 2, 0);
  }
}
