export interface IntroConfig {
  totalDuration: number;
  zoomDuration: number;
  zoomScale: { start: number; end: number };
  selectionDelay: number;
}

export const introConfig: IntroConfig = {
  totalDuration: 3500,
  zoomDuration: 2800,
  zoomScale: { start: 1, end: 1.15 },
  selectionDelay: 400,
};
