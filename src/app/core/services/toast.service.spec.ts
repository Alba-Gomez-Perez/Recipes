import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService, ToastType } from './toast.service';
import { APP_CONSTANTS } from '../constants';

describe('ToastService', () => {
    let service: ToastService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ToastService]
        });
        service = TestBed.inject(ToastService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should show a toast and auto-hide after default duration', fakeAsync(() => {
        const message = 'Test message';
        const type: ToastType = 'success';

        service.show(message, type);

        // Check that the toast is set
        let toast = service.toast();
        expect(toast).not.toBeNull();
        expect(toast?.message).toBe(message);
        expect(toast?.type).toBe(type);
        expect(toast?.duration).toBe(APP_CONSTANTS.TOAST_DURATION);

        // Fast-forward time
        tick(APP_CONSTANTS.TOAST_DURATION);

        // Check that the toast is hidden
        toast = service.toast();
        expect(toast).toBeNull();
    }));

    it('should show a toast with a custom duration', fakeAsync(() => {
        const message = 'Custom duration';
        const duration = 1000;

        service.show(message, 'info', duration);

        let toast = service.toast();
        expect(toast?.duration).toBe(duration);

        tick(duration);
        expect(service.toast()).toBeNull();
    }));

    it('should clear previous timeout when a new toast is shown', fakeAsync(() => {
        service.show('First toast', 'info', 5000);
        
        // Show another toast before the first one expires
        service.show('Second toast', 'error', 3000);

        let toast = service.toast();
        expect(toast?.message).toBe('Second toast');

        // Fast-forward past the second toast's duration
        tick(3000);
        expect(service.toast()).toBeNull();

        // Ensure the first timeout was cancelled and doesn't hide the (already hidden) toast
        tick(2000); 
    }));

    it('should hide the toast manually', fakeAsync(() => {
        service.show('A message', 'warning', 5000);
        
        expect(service.toast()).not.toBeNull();

        service.hide();
        expect(service.toast()).toBeNull();

        // Ensure the timeout is cleared and doesn't try to hide again
        tick(5000);
    }));

    it('should call show with "success" type for success() method', () => {
        spyOn(service, 'show');
        service.success('Success!', 1234);
        expect(service.show).toHaveBeenCalledWith('Success!', 'success', 1234);
    });

    it('should call show with "error" type for error() method', () => {
        spyOn(service, 'show');
        service.error('Error!', 4321);
        expect(service.show).toHaveBeenCalledWith('Error!', 'error', 4321);
    });

    it('should call show with "warning" type for warning() method', () => {
        spyOn(service, 'show');
        service.warning('Warning!', 5000);
        expect(service.show).toHaveBeenCalledWith('Warning!', 'warning', 5000);
    });

    it('should call show with "info" type for info() method', () => {
        spyOn(service, 'show');
        service.info('Info!');
        expect(service.show).toHaveBeenCalledWith('Info!', 'info', undefined);
    });

    it('should handle hide being called when no toast is active', () => {
        // Initially, no toast is active
        expect(service.toast()).toBeNull();

        // Calling hide should not throw an error
        expect(() => service.hide()).not.toThrow();
    });
});
