import { useEffect, useRef } from 'react';

interface UseAutoScrollOptions {
  enabled?: boolean;
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
}

export const useAutoScroll = <T extends HTMLElement>(
  dependencies: any[] = [],
  options: UseAutoScrollOptions = {}
) => {
  const elementRef = useRef<T>(null);
  const {
    enabled = true,
    behavior = 'smooth',
    block = 'start',
    inline = 'nearest'
  } = options;

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const timeoutId = setTimeout(() => {
      elementRef.current?.scrollIntoView({
        behavior,
        block,
        inline,
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [...dependencies, enabled]);

  return elementRef;
};

export const useScrollToTop = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return scrollToTop;
};

export const useScrollToElement = () => {
  const scrollToElement = (elementId: string, options?: ScrollIntoViewOptions) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        ...options,
      });
    }
  };

  return scrollToElement;
};