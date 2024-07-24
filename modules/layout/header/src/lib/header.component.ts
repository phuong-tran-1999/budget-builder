import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    viewChild,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'bb-header',
    standalone: true,
    imports: [CommonModule, NgOptimizedImage],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
    headerRef = viewChild('header', { read: ElementRef });
}
