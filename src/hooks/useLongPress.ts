import { useCallback, useRef, useState } from 'react';

export function useLongPress(
    onLongPress: (e: React.MouseEvent | React.TouchEvent) => void,
    onClick: (e: React.MouseEvent | React.TouchEvent) => void,
    { shouldPreventDefault = true, delay = 500 } = {}
) {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const target = useRef<HTMLElement | null>(null);

    const start = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            if (shouldPreventDefault && event.target) {
                const t = event.target as HTMLElement;
                t.addEventListener('touchend', preventDefault, { passive: false });
                target.current = t;
            }
            timeout.current = setTimeout(() => {
                onLongPress(event);
                setLongPressTriggered(true);
            }, delay);
        },
        [onLongPress, delay, shouldPreventDefault]
    );

    const clear = useCallback(
        (event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
            if (timeout.current) {
                clearTimeout(timeout.current);
            }
            if (shouldTriggerClick && !longPressTriggered) {
                onClick(event);
            }
            setLongPressTriggered(false);
            if (shouldPreventDefault && target.current) {
                target.current.removeEventListener('touchend', preventDefault);
            }
        },
        [shouldPreventDefault, onClick, longPressTriggered]
    );

    return {
        onMouseDown: (e: React.MouseEvent) => start(e),
        onTouchStart: (e: React.TouchEvent) => start(e),
        onMouseUp: (e: React.MouseEvent) => clear(e),
        onMouseLeave: (e: React.MouseEvent) => clear(e, false),
        onTouchEnd: (e: React.TouchEvent) => clear(e),
    };
}

const preventDefault = (e: Event) => {
    const touchEvent = e as unknown as TouchEvent;
    if (!('touches' in touchEvent)) return;
    if (touchEvent.touches.length < 2 && touchEvent.preventDefault) {
        touchEvent.preventDefault();
    }
};
