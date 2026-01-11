import {Injectable, signal} from '@angular/core';
import {APP_CONSTANTS} from '../constants';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    message: string;
    type: ToastType;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private readonly defaultDuration = APP_CONSTANTS.TOAST_DURATION;
    
    readonly toast = signal<ToastMessage | null>(null);
    private timeoutId: number | null = null;

    /**
     * Show a toast message
     * @param message - The message to display (can be a translation key or plain text)
     * @param type - The type of toast (success, error, warning, info)
     * @param duration - Optional duration in milliseconds (defaults to APP_CONSTANTS.TOAST_DURATION)
     */
    show(message: string, type: ToastType = 'info', duration?: number): void {
        // Clear any existing timeout
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        const toastMessage: ToastMessage = {
            message,
            type,
            duration: duration ?? this.defaultDuration
        };

        this.toast.set(toastMessage);

        // Auto-hide after duration
        this.timeoutId = window.setTimeout(() => {
            this.hide();
        }, toastMessage.duration);
    }

    /**
     * Show a success toast
     */
    success(message: string, duration?: number): void {
        this.show(message, 'success', duration);
    }

    /**
     * Show an error toast
     */
    error(message: string, duration?: number): void {
        this.show(message, 'error', duration);
    }

    /**
     * Show a warning toast
     */
    warning(message: string, duration?: number): void {
        this.show(message, 'warning', duration);
    }

    /**
     * Show an info toast
     */
    info(message: string, duration?: number): void {
        this.show(message, 'info', duration);
    }

    /**
     * Hide the current toast
     */
    hide(): void {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.toast.set(null);
    }
}
