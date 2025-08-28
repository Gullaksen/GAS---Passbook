
import { useEffect, useRef, useCallback } from 'react';

const AUTO_LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const useAutoLock = (lockVault: () => void, isLocked: boolean) => {
    const timer = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = useCallback(() => {
        if (timer.current) {
            clearTimeout(timer.current);
        }
        timer.current = setTimeout(() => {
            if (!isLocked) {
                lockVault();
            }
        }, AUTO_LOCK_TIMEOUT);
    }, [isLocked, lockVault]);

    useEffect(() => {
        if (isLocked) {
            if (timer.current) {
                clearTimeout(timer.current);
            }
            return;
        }

        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
        
        const eventListener = () => {
            resetTimer();
        };

        events.forEach(event => window.addEventListener(event, eventListener));
        resetTimer();

        return () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
            events.forEach(event => window.removeEventListener(event, eventListener));
        };
    }, [isLocked, resetTimer]);
};
