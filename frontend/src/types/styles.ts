import { CSSProperties } from 'react';

export interface CustomCSSProperties extends CSSProperties {
  '--scrollbar-thumb-color'?: string;
  '--scrollbar-track-color'?: string;
}
