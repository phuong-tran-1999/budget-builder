import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
            import('@modules/home').then((c) => c.HomeComponent),
        title: 'Home',
        data: {
            title: 'home',
        },
    },
    {
        path: '**',
        redirectTo: '',
        title: 'Home',
    },
];
