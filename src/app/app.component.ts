import { SkeletonComponent } from '@modules/shared/ui/skeleton';
import { FooterComponent } from '@modules/layout/footer';
import { HeaderComponent } from '@modules/layout/header';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    standalone: true,
    imports: [
        RouterModule,
        SkeletonComponent,
        HeaderComponent,
        FooterComponent,
    ],
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    title = 'budget-builder';
}
