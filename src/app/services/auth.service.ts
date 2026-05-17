import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models';

export interface RegisteredUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  password: string;
  bio: string;
  avatarUrl?: string;
  avatarInitials: string;
  avatarColor: string;
  coverColor: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  joinedAt: string;
  following: string[];
  followers: string[];
}

export interface DbJson {
  users: RegisteredUser[];
}

const COLORS = ['#c0392b','#e67e22','#27ae60','#8e44ad','#2980b9','#d35400','#16a085','#f39c12'];
const DB_KEY = 'db.json';
const SESSION_KEY = 'auth_session';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _isAuthenticated = signal<boolean>(false);
  private _currentUser = signal<RegisteredUser | null>(null);

  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();

  constructor(private router: Router) {
    this._initDb();
    this._restoreSession();
  }

  private _initDb(): void {
    if (!localStorage.getItem(DB_KEY)) {
      const emptyDb: DbJson = { users: [] };
      localStorage.setItem(DB_KEY, JSON.stringify(emptyDb));
    }
  }

  getDb(): DbJson {
    return JSON.parse(localStorage.getItem(DB_KEY) || '{"users":[]}');
  }

  saveDb(db: DbJson): void {
    localStorage.setItem(DB_KEY, JSON.stringify(db, null, 2));
  }

  private _restoreSession(): void {
    const sessionId = localStorage.getItem(SESSION_KEY);
    if (sessionId) {
      const db = this.getDb();
      const user = db.users.find(u => u.id === sessionId);
      if (user) {
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
      }
    }
  }

  refreshCurrentUser(): void {
    const cur = this._currentUser();
    if (!cur) return;
    const db = this.getDb();
    const updated = db.users.find(u => u.id === cur.id);
    if (updated) this._currentUser.set({ ...updated });
  }

  signUp(displayName: string, username: string, email: string, password: string): { success: boolean; error?: string } {
    const db = this.getDb();

    if (db.users.find(u => u.email === email))
      return { success: false, error: 'Cet email est déjà utilisé.' };
    if (db.users.find(u => u.username === username))
      return { success: false, error: 'Ce nom d\'utilisateur est déjà pris.' };

    const idx = Math.abs(username.charCodeAt(0)) % COLORS.length;
    const newUser: RegisteredUser = {
      id: `user_${Date.now()}`,
      username,
      displayName,
      email,
      password,
      bio: 'Nouvel artisan sur la plateforme ! 🏺',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      avatarInitials: displayName.slice(0, 2).toUpperCase(),
      avatarColor: COLORS[idx],
      coverColor: COLORS[(idx + 3) % COLORS.length],
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isVerified: false,
      joinedAt: new Date().toISOString(),
      following: [],
      followers: [],
    };

    db.users.push(newUser);
    this.saveDb(db);
    this._currentUser.set(newUser);
    this._isAuthenticated.set(true);
    localStorage.setItem(SESSION_KEY, newUser.id);
    return { success: true };
  }

  login(email: string, password: string): { success: boolean; error?: string } {
    const db = this.getDb();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, error: 'Email ou mot de passe incorrect.' };
    this._currentUser.set(user);
    this._isAuthenticated.set(true);
    localStorage.setItem(SESSION_KEY, user.id);
    return { success: true };
  }

  logout(): void {
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    localStorage.removeItem(SESSION_KEY);
    this.router.navigate(['/auth']);
  }

  toUser(raw?: RegisteredUser): User | null {
    const u = raw ?? this._currentUser();
    if (!u) return null;
    return {
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
      isFollowing: false,
      joinedAt: new Date(u.joinedAt),
    };
  }
}
