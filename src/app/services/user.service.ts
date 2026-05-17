import { Injectable, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, Notification } from '../models';
import { AuthService } from './auth.service';

const COLORS = ['#c0392b','#e67e22','#27ae60','#8e44ad','#2980b9','#d35400','#16a085','#f39c12'];

function makeUser(overrides: Partial<User> & Pick<User, 'id'|'username'|'displayName'>): User {
  const idx = Math.abs(overrides.id.charCodeAt(0)) % COLORS.length;
  return {
    bio: 'Artisan passionné par le savoir-faire traditionnel 🏺',
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${overrides.username}`,
    avatarInitials: overrides.displayName.slice(0, 2).toUpperCase(),
    avatarColor: COLORS[idx],
    coverColor: COLORS[(idx + 3) % COLORS.length],
    followersCount: Math.floor(Math.random() * 2000) + 50,
    followingCount: Math.floor(Math.random() * 500) + 10,
    postsCount: Math.floor(Math.random() * 300) + 5,
    isVerified: Math.random() > 0.7,
    isFollowing: false,
    joinedAt: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    ...overrides
  };
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private authService = inject(AuthService);
  private readonly NOTIFS_KEY = 'notifications_db';

  constructor() {
    this._initNotifications();
    this._setupStorageListener();
  }

  private _setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === this.NOTIFS_KEY && event.newValue) {
        const parsed = JSON.parse(event.newValue).map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) }));
        this._notifications$.next(parsed);
      }
    });
  }

  private _initNotifications(): void {
    const saved = localStorage.getItem(this.NOTIFS_KEY);
    if (!saved) {
      this._notifications$.next([]);
    } else {
      const parsed = JSON.parse(saved)
        .map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) }))
        .filter((n: any) => !/^notif-\d$/.test(n.id) && !/^notif-1\d$/.test(n.id));
      this._notifications$.next(parsed);
      this._saveNotifications(parsed);
    }
  }

  private _saveNotifications(notifs: Notification[]): void {
    localStorage.setItem(this.NOTIFS_KEY, JSON.stringify(notifs));
    this._notifications$.next(notifs);
  }

  readonly currentUser = computed<User>(() => {
    const authUser = this.authService.toUser();
    if (authUser) return authUser;
    return makeUser({ id: 'me', username: 'moi', displayName: 'Mon Atelier' });
  });

  // Artisans fictifs marocains
  private readonly _staticUsers: User[] = [
    makeUser({ id: 'u1', username: 'fatima_tissage',   displayName: 'Fatima Benali',    bio: 'Tisserande berbère 🧶 Tapis et kilims de Midelt' }),
    makeUser({ id: 'u2', username: 'hassan_poterie',   displayName: 'Hassan Ouazzani',  bio: 'Potier de Fès 🏺 Céramique bleue depuis 1990' }),
    makeUser({ id: 'u3', username: 'zineb_broderie',   displayName: 'Zineb Alaoui',     bio: 'Broderie traditionnelle | Rabat 🌸' }),
    makeUser({ id: 'u4', username: 'omar_maroquin',    displayName: 'Omar Idrissi',     bio: 'Maroquinier à Marrakech 👜 Cuir naturel tanné' }),
    makeUser({ id: 'u5', username: 'aicha_zellige',    displayName: 'Aïcha Mernissi',   bio: 'Maître zellijeur 🔷 Mosaïques de Meknès' }),
    makeUser({ id: 'u6', username: 'youssef_menuisier',displayName: 'Youssef Tazi',     bio: 'Menuisier artisan 🪵 Bois de thuya d\'Essaouira' }),
    makeUser({ id: 'u7', username: 'khadija_bijoux',   displayName: 'Khadija Fassi',    bio: 'Bijoutière berbère 💍 Argent et pierres de l\'Atlas' }),
    makeUser({ id: 'u8', username: 'mehdi_dinandier',  displayName: 'Mehdi Chraibi',    bio: 'Dinandier à Fès 🔔 Cuivre et laiton ciselés' }),
  ];

  private _notifications$ = new BehaviorSubject<Notification[]>([]);

  private _getAllUsers(currentUserId?: string): User[] {
    const db = this.authService.getDb();
    const registeredUsers: User[] = db.users
      .filter(u => u.id !== currentUserId)
      .map(u => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        bio: u.bio,
        avatarUrl: u.avatarUrl,
        avatarInitials: u.avatarInitials,
        avatarColor: u.avatarColor,
        coverColor: u.coverColor,
        followersCount: u.followersCount,
        followingCount: u.followingCount,
        postsCount: u.postsCount,
        isVerified: u.isVerified,
        isFollowing: currentUserId ? (u.followers || []).includes(currentUserId) : false,
        joinedAt: new Date(u.joinedAt),
      }));

    const currentRaw = currentUserId ? db.users.find(u => u.id === currentUserId) : null;
    const followingIds = currentRaw?.following ?? [];
    const staticWithFollow = this._staticUsers.map(u => ({
      ...u,
      isFollowing: followingIds.includes(u.id),
    }));

    return [...registeredUsers, ...staticWithFollow];
  }

  getUsers(): Observable<User[]> {
    const me = this.authService.currentUser();
    return of(this._getAllUsers(me?.id)).pipe(delay(100));
  }

  getUserByUsername(username: string): Observable<User | undefined> {
    const me = this.authService.currentUser();
    if (me && username === me.username) {
      return of(this.currentUser());
    }
    const db = this.authService.getDb();
    const regUser = db.users.find(u => u.username === username);
    if (regUser) {
      const isFollowing = me ? (regUser.followers || []).includes(me.id) : false;
      const user: User = {
        id: regUser.id, username: regUser.username, displayName: regUser.displayName,
        bio: regUser.bio, avatarUrl: regUser.avatarUrl, avatarInitials: regUser.avatarInitials,
        avatarColor: regUser.avatarColor, coverColor: regUser.coverColor,
        followersCount: regUser.followersCount, followingCount: regUser.followingCount,
        postsCount: regUser.postsCount, isVerified: regUser.isVerified,
        isFollowing, joinedAt: new Date(regUser.joinedAt),
      };
      return of(user).pipe(delay(100));
    }
    const staticUser = this._staticUsers.find(u => u.username === username);
    if (staticUser && me) {
      const dbMe = db.users.find(u => u.id === me.id);
      const isFollowing = dbMe ? (dbMe.following || []).includes(staticUser.id) : false;
      return of({ ...staticUser, isFollowing }).pipe(delay(100));
    }
    return of(staticUser).pipe(delay(150));
  }

  getUserById(id: string): Observable<User | undefined> {
    const me = this.authService.currentUser();
    const all = this._getAllUsers(me?.id);
    return of(all.find(u => u.id === id)).pipe(delay(100));
  }

  getFollowers(userId: string): Observable<User[]> {
    const db = this.authService.getDb();
    const target = db.users.find(u => u.id === userId);
    const ids = target?.followers || [];
    const me = this.authService.currentUser();
    const all = this._getAllUsers(me?.id);
    return of(all.filter(u => ids.includes(u.id))).pipe(delay(100));
  }

  getFollowing(userId: string): Observable<User[]> {
    const db = this.authService.getDb();
    const target = db.users.find(u => u.id === userId);
    const ids = target?.following || [];
    const me = this.authService.currentUser();
    const all = this._getAllUsers(me?.id);
    return of(all.filter(u => ids.includes(u.id))).pipe(delay(100));
  }

  searchUsers(query: string): Observable<User[]> {
    const q = query.toLowerCase().trim();
    if (!q) return of([]);
    const me = this.authService.currentUser();
    const all = this._getAllUsers(me?.id);
    return of(all.filter(u =>
      u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q)
    )).pipe(delay(100));
  }

  getSuggestedUsers(): Observable<User[]> {
    const me = this.authService.currentUser();
    const all = this._getAllUsers(me?.id);
    return of(all.filter(u => !u.isFollowing).slice(0, 3)).pipe(delay(100));
  }

  toggleFollow(targetId: string): Observable<boolean> {
    const meAuth = this.authService.currentUser();
    const me = this.currentUser();
    if (!meAuth) return of(false);

    const db = this.authService.getDb();
    const meDb = db.users.find(u => u.id === meAuth.id);

    if (meDb) {
      meDb.following = meDb.following || [];
      const alreadyFollowing = meDb.following.includes(targetId);

      if (alreadyFollowing) {
        meDb.following = meDb.following.filter(id => id !== targetId);
        meDb.followingCount = Math.max(0, meDb.followingCount - 1);
      } else {
        meDb.following.push(targetId);
        meDb.followingCount += 1;
      }

      const targetDb = db.users.find(u => u.id === targetId);
      if (targetDb) {
        targetDb.followers = targetDb.followers || [];
        if (alreadyFollowing) {
          targetDb.followers = targetDb.followers.filter(id => id !== me.id);
          targetDb.followersCount = Math.max(0, targetDb.followersCount - 1);
        } else {
          targetDb.followers.push(me.id);
          targetDb.followersCount += 1;
        }
      }

      this.authService.saveDb(db);
      this.authService.refreshCurrentUser();

      if (!alreadyFollowing) {
        this.addNotification({ type: 'follow', actor: me, recipientId: targetId });
      }

      return of(!alreadyFollowing).pipe(delay(80));
    }

    const staticUser = this._staticUsers.find(u => u.id === targetId);
    if (staticUser) {
      staticUser.isFollowing = !staticUser.isFollowing;
      staticUser.followersCount += staticUser.isFollowing ? 1 : -1;
      return of(staticUser.isFollowing).pipe(delay(80));
    }

    return of(false).pipe(delay(80));
  }

  getNotifications(): Observable<Notification[]> {
    return this._notifications$.pipe(
      map(notifs => notifs.filter(n => n.recipientId === this.currentUser().id))
    );
  }

  getUnreadCount(): Observable<number> {
    return this._notifications$.pipe(
      map(notifs => notifs.filter(n => n.recipientId === this.currentUser().id && !n.isRead).length)
    );
  }

  markAllAsRead(): void {
    const updated = this._notifications$.value.map(n => ({ ...n, isRead: true }));
    this._saveNotifications(updated);
  }

  markAsRead(id: string): void {
    const updated = this._notifications$.value.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this._saveNotifications(updated);
  }

  addNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): void {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date()
    };
    const updated = [newNotif, ...this._notifications$.value];
    this._saveNotifications(updated);
  }
}
