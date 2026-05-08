import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () =>
            import('./auth/auth.module')
                .then(m => m.AuthModule)
    },
    {
        path: 'clothes',
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        loadChildren: () =>
            import('./clothes/clothes.module')
                .then(m => m.ClothesModule)

    },
    {
        path: 'recomendation',
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        loadChildren: () =>
            import('./recomendation/recomendation.module')
                .then(m => m.RecomendationModule)
    },
    {
        path: '**',
        redirectTo: ''
    }
];