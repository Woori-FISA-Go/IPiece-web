import type { CSSProperties } from 'react';

import heartIcon from '@/assets/heart_icon.svg';

export const HEART_MASK_BASE_STYLE: CSSProperties = {
  display: 'block',
  width: 24,
  height: 24,
  maskImage: `url(${heartIcon.src})`,
  WebkitMaskImage: `url(${heartIcon.src})`,
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskPosition: 'center',
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
};

export const buildHeartMaskStyle = (
  backgroundColor: string,
  opacity: number,
): CSSProperties => ({
  ...HEART_MASK_BASE_STYLE,
  backgroundColor,
  opacity,
});
