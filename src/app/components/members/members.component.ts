import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../models';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { FormatCountPipe } from '../../pipes/pipes';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, RouterLink, FormatCountPipe],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  users: User[] = [];
  isLoading = true;
  followingInProgress = new Set<string>();

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.isLoading = false;
    });
  }

  toggleFollow(userId: string): void {
    if (this.followingInProgress.has(userId)) return;
    this.followingInProgress.add(userId);

    this.userService.toggleFollow(userId).subscribe(isFollowing => {
      this.users = this.users.map(u =>
        u.id === userId
          ? { ...u, isFollowing, followersCount: u.followersCount + (isFollowing ? 1 : -1) }
          : u
      );
      this.followingInProgress.delete(userId);
    });
  }

  get registeredUsers(): User[] {
    // Utilisateurs inscrits : IDs commencent par 'user_'
    return this.users.filter(u => u.id.startsWith('user_'));
  }

  get staticUsers(): User[] {
    return this.users.filter(u => !u.id.startsWith('user_'));
  }
}
