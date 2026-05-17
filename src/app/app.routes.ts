import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent),
    canActivate: [guestGuard],
    title: 'Connexion — Artisanat Marocain'
  },
  {
    path: 'feed',
    loadComponent: () => import('./components/feed/feed.component').then(m => m.FeedComponent),
    canActivate: [authGuard],
    title: 'Accueil — Artisanat Marocain'
  },
  {
    path: 'search',
    loadComponent: () => import('./components/search/search.component').then(m => m.SearchComponent),
    canActivate: [authGuard],
    title: 'Recherche — Artisanat Marocain'
  },
  {
    path: 'notifications',
    loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [authGuard],
    title: 'Notifications — Artisanat Marocain'
  },
  {
    path: 'trending',
    loadComponent: () => import('./components/trending/trending.component').then(m => m.TrendingComponent),
    canActivate: [authGuard],
    title: 'Tendances — Artisanat Marocain'
  },
  {
    path: 'members',
    loadComponent: () => import('./components/members/members.component').then(m => m.MembersComponent),
    canActivate: [authGuard],
    title: 'Artisans — Artisanat Marocain'
  },
  {
    path: 'profile/:username',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'Profil — Artisanat Marocain'
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];
