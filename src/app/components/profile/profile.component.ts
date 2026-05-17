import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { User, Post } from '../../models';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { PostCardComponent } from '../post-card/post-card.component';
import { FormatCountPipe } from '../../pipes/pipes';

type Tab = 'posts' | 'likes' | 'followers' | 'following';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, PostCardComponent, FormatCountPipe, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  @Input() username?: string;

  user: User | null = null;
  posts: Post[] = [];
  usersList: User[] = [];
  isLoading = true;
  activeTab: Tab = 'posts';
  isFollowLoading = false;
  followingInProgress = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const username = params.get('username') || this.username || '';
      this.loadProfile(username);
    });
  }

  loadProfile(username: string): void {
    this.isLoading = true;
    this.userService.getUserByUsername(username).subscribe(user => {
      this.user = user || null;
      if (user) this.loadTab(this.activeTab);
      this.isLoading = false;
    });
  }

  loadTab(tab: Tab): void {
    this.activeTab = tab;
    if (!this.user) return;
    
    // Reset lists
    this.posts = [];
    this.usersList = [];

    if (tab === 'posts') {
      this.postService.getPostsByUser(this.user.username).subscribe(p => this.posts = p);
    } else if (tab === 'likes') {
      this.postService.getLikedPostsByUser(this.user.username).subscribe(p => this.posts = p);
    } else if (tab === 'followers') {
      this.userService.getFollowers(this.user.id).subscribe(u => this.usersList = u);
    } else if (tab === 'following') {
      this.userService.getFollowing(this.user.id).subscribe(u => this.usersList = u);
    }
  }

  toggleFollowListUser(userId: string): void {
    if (this.followingInProgress.has(userId)) return;
    this.followingInProgress.add(userId);
    this.userService.toggleFollow(userId).subscribe(isFollowing => {
      this.usersList = this.usersList.map(u => 
        u.id === userId ? { ...u, isFollowing, followersCount: u.followersCount + (isFollowing ? 1 : -1) } : u
      );
      this.followingInProgress.delete(userId);
    });
  }

  toggleFollow(): void {
    if (!this.user || this.isFollowLoading) return;
    this.isFollowLoading = true;
    this.userService.toggleFollow(this.user.id).subscribe(isFollowing => {
      if (this.user) {
        this.user = {
          ...this.user,
          isFollowing,
          followersCount: this.user.followersCount + (isFollowing ? 1 : -1)
        };
      }
      this.isFollowLoading = false;
    });
  }

  onPostDeleted(id: string): void {
    this.posts = this.posts.filter(p => p.id !== id);
  }

  get joinedLabel(): string {
    if (!this.user) return '';
    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(this.user.joinedAt);
  }
}
