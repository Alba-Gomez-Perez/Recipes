import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-floating-add-button',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './floating-add-button.component.html',
    styleUrls: ['./floating-add-button.component.scss']
})
export class FloatingAddButtonComponent {
    @Output() clicked = new EventEmitter<void>();

    onClick() {
        this.clicked.emit();
    }
}
