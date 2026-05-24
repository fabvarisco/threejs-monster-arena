export const HEADER_H = 64;
export const vpWidth = () => window.innerWidth;
export const vpHeight = () => window.innerHeight - HEADER_H;
export const vpAspect = () => vpWidth() / vpHeight();
