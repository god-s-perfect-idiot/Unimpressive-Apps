export type AspectRatio = '1x1' | '2x1' | '2x2';

export interface Widget {
  id: string;
  name: string;
  prompt: string;
  html: string;
  aspectRatio: AspectRatio;
  createdAt: number;
  updatedAt: number;
}

