import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Notification } from '../../models';
import { UserService } from '../../services/user.service';
import { TimeAgoPipe } from '../../pipes/pipes';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, TimeAgoPipe],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isLoading = true;
  private subs = new Subscription();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.subs.add(
      this.userService.getNotifications().subscribe(notifs => {
        this.notifications = notifs;
        this.unreadCount = notifs.filter(n => !n.isRead).length;
        this.isLoading = false;
      })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  markAllRead(): void { this.userService.markAllAsRead(); }

  markRead(id: string): void { this.userService.markAsRead(id); }

  notifIcon(type: Notification['type']): string {
    const icons: Record<Notification['type'], string> = {
      like:    '❤️',
      retweet: '🔁',
      comment: '💬',
      follow:  '👤',
      mention: '📣'
    };
    return icons[type];
  }

  notifMessage(n: Notification): string {
    const messages: Record<Notification['type'], string> = {
      like:    `a mis votre création en favori`,
      retweet: `a partagé votre création`,
      comment: `a commenté votre création`,
      follow:  `a commencé à vous suivre`,
      mention: `vous a mentionné dans une publication`
    };
    return messages[n.type];
  }

  notifColor(type: Notification['type']): string {
    const colors: Record<Notification['type'], string> = {
      like:    '#ff6b9d',
      retweet: '#4ade80',
      comment: '#6c63ff',
      follow:  '#38bdf8',
      mention: '#fbbf24'
    };
    return colors[type];
  }

  trackByNotif(_: number, n: Notification): string { return n.id; }
}
