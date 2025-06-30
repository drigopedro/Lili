import { useState, useEffect, useRef, RefObject } from 'react';

interface GestureState {
  isSwipeLeft: boolean;
  isSwipeRight: boolean;
  isSwipeUp: boolean;
  isSwipeDown: boolean;
  isPullToRefresh: boolean;
  isDoubleTap: boolean;
}

interface UseGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => void;
  onDoubleTap?: () => void;
  swipeThreshold?: number;
  pullThreshold?: number;
}

export const useGestures = (
  elementRef: RefObject<HTMLElement>,
  options: UseGesturesOptions = {}
) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    onDoubleTap,
    swipeThreshold = 50,
    pullThreshold = 100,
  } = options;

  const [gestureState, setGestureState] = useState<GestureState>({
    isSwipeLeft: false,
    isSwipeRight: false,
    isSwipeUp: false,
    isSwipeDown: false,
    isPullToRefresh: false,
    isDoubleTap: false,
  });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const pullStartRef = useRef<number>(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      // Check for pull-to-refresh at top of page
      if (window.scrollY === 0 && touch.clientY < 100) {
        pullStartRef.current = touch.clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - pullStartRef.current;

      // Handle pull-to-refresh
      if (window.scrollY === 0 && deltaY > 0 && deltaY < pullThreshold * 2) {
        e.preventDefault();
        setGestureState(prev => ({ ...prev, isPullToRefresh: deltaY > pullThreshold }));
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Reset pull-to-refresh state
      if (gestureState.isPullToRefresh) {
        setGestureState(prev => ({ ...prev, isPullToRefresh: false }));
        if (Math.abs(deltaY) > pullThreshold && onPullToRefresh) {
          onPullToRefresh();
        }
      }

      // Handle double tap
      const now = Date.now();
      if (now - lastTapRef.current < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        setGestureState(prev => ({ ...prev, isDoubleTap: true }));
        setTimeout(() => setGestureState(prev => ({ ...prev, isDoubleTap: false })), 100);
        if (onDoubleTap) {
          onDoubleTap();
        }
      }
      lastTapRef.current = now;

      // Handle swipes (only if not a quick tap)
      if (deltaTime > 100) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > swipeThreshold && absX > absY) {
          // Horizontal swipe
          if (deltaX > 0) {
            setGestureState(prev => ({ ...prev, isSwipeRight: true }));
            setTimeout(() => setGestureState(prev => ({ ...prev, isSwipeRight: false })), 100);
            if (onSwipeRight) onSwipeRight();
          } else {
            setGestureState(prev => ({ ...prev, isSwipeLeft: true }));
            setTimeout(() => setGestureState(prev => ({ ...prev, isSwipeLeft: false })), 100);
            if (onSwipeLeft) onSwipeLeft();
          }
        } else if (absY > swipeThreshold && absY > absX) {
          // Vertical swipe
          if (deltaY > 0) {
            setGestureState(prev => ({ ...prev, isSwipeDown: true }));
            setTimeout(() => setGestureState(prev => ({ ...prev, isSwipeDown: false })), 100);
            if (onSwipeDown) onSwipeDown();
          } else {
            setGestureState(prev => ({ ...prev, isSwipeUp: true }));
            setTimeout(() => setGestureState(prev => ({ ...prev, isSwipeUp: false })), 100);
            if (onSwipeUp) onSwipeUp();
          }
        }
      }

      touchStartRef.current = null;
      pullStartRef.current = 0;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPullToRefresh, onDoubleTap, swipeThreshold, pullThreshold, gestureState.isPullToRefresh]);

  return gestureState;
};