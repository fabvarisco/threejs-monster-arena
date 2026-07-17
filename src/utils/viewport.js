export const headerH = () => {
  const h = document
    .querySelector("app-header")
    ?.getBoundingClientRect().height;
  return (
    h || parseFloat(getComputedStyle(document.documentElement).fontSize) * 4
  );
};

export function addViewportListeners(handler) {
  const delayed = () => setTimeout(handler, 300);
  window.addEventListener("resize", handler);
  window.addEventListener("orientationchange", delayed);
  window.visualViewport?.addEventListener("resize", handler);
  return () => {
    window.removeEventListener("resize", handler);
    window.removeEventListener("orientationchange", delayed);
    window.visualViewport?.removeEventListener("resize", handler);
  };
}

export const vpWidth = () => window.innerWidth;
export const vpHeight = () => window.innerHeight - headerH();
export const vpAspect = () => vpWidth() / vpHeight();

const BASE_ASPECT = 16 / 9;
export function vpFov(baseFov = 60, maxFov = 80) {
  const aspect = vpAspect();
  if (aspect >= BASE_ASPECT) return baseFov;
  const baseFovRad = (baseFov * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(baseFovRad / 2) * BASE_ASPECT);
  const vFov = 2 * Math.atan(Math.tan(hFov / 2) / aspect);
  return Math.min((vFov * 180) / Math.PI, maxFov);
}

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
