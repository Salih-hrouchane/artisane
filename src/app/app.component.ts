import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { TrendingComponent } from './components/trending/trending.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, TrendingComponent, CommonModule],
  template: `
    @if (isAuthPage) {
      <router-outlet></router-outlet>
    } @else {
      <div class="app-shell">
        <app-navbar></app-navbar>
        <main class="main-feed">
          <router-outlet></router-outlet>
        </main>
        <aside class="right-panel">
          <app-trending [compact]="true"></app-trending>
        </aside>
      </div>
    }
  `
})
export class AppComponent {
  isAuthPage = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isAuthPage = e.urlAfterRedirects.startsWith('/auth');
    });
  }
}
