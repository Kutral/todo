import { useCallback, useRef, useState } from 'react';

export function useLongPress(
    onLongPress: (e: React.MouseEvent | React.TouchEvent) => void,
    onClick: (e: React.MouseEvent | React.TouchEvent) => void,
    { shouldPreventDefault = true, delay = 500 } = {}
) {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const start = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            timeout.current = setTimeout(() => {
                onLongPress(event);
                setLongPressTriggered(true);
            }, delay);
        },
        [onLongPress, delay]
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
        },
        [onClick, longPressTriggered]
    );

    return {
        onMouseDown: (e: React.MouseEvent) => start(e),
        onTouchStart: (e: React.TouchEvent) => start(e),
        onMouseUp: (e: React.MouseEvent) => clear(e),
        onMouseLeave: (e: React.MouseEvent) => clear(e, false),
        onTouchEnd: (e: React.TouchEvent) => clear(e),
        onTouchMove: (e: React.TouchEvent) => clear(e, false), // Cancel on scroll/move
        onContextMenu: (e: React.MouseEvent | React.TouchEvent) => {
            if (shouldPreventDefault) {
                e.preventDefault();
            }
        }
    };
}
