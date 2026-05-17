import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TrendingHashtag } from '../../models';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models';
import { FormatCountPipe } from '../../pipes/pipes';

@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [CommonModule, FormatCountPipe],
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.scss']
})
export class TrendingComponent implements OnInit {
  @Input() compact = false;

  hashtags: TrendingHashtag[] = [];
  suggestions: User[] = [];
  isLoading = true;

  constructor(
    private postService: PostService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.postService.getTrendingHashtags().subscribe(tags => {
      this.hashtags = this.compact ? tags.slice(0, 5) : tags;
      this.isLoading = false;
    });
    this.userService.getSuggestedUsers().subscribe(users => {
      this.suggestions = users;
    });
  }

  searchHashtag(tag: string): void {
    this.router.navigate(['/search'], { queryParams: { q: '#' + tag } });
  }

  followUser(userId: string): void {
    this.userService.toggleFollow(userId).subscribe(() => {
      this.suggestions = this.suggestions.map(u =>
        u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u
      );
    });
  }

  goToProfile(username: string): void {
    this.router.navigate(['/profile', username]);
  }

  trendIcon(trend: TrendingHashtag['trend']): string {
    return trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  }

  trendClass(trend: TrendingHashtag['trend']): string {
    return trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'stable';
  }
}
