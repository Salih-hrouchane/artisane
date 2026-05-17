import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  currentUser: User | null = null;
  unreadCount = 0;
  private sub!: Subscription;

  navItems = [
    { path: '/feed',          icon: '🏠', label: 'Accueil',        badge: false },
    { path: '/search',        icon: '🔍', label: 'Rechercher',     badge: false },
    { path: '/notifications', icon: '🔔', label: 'Notifications',  badge: true  },
    { path: '/trending',      icon: '🔥', label: 'Tendances',      badge: false },
    { path: '/members',       icon: '🧑‍🎨', label: 'Artisans',      badge: false },
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.userService.currentUser();
    this.sub = this.userService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
