import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post, User } from '../../models';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { PostFormComponent } from '../post-form/post-form.component';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, PostFormComponent, PostCardComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;

  posts: Post[] = [];
  suggestions: User[] = [];
  isLoading = true;
  isLoadingMore = false;
  hasMore = true;
  currentPage = 1;
  readonly PAGE_SIZE = 6;

  private observer!: IntersectionObserver;

  constructor(
    private postService: PostService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    this.loadSuggestions();
  }

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  private setupObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.isLoadingMore && this.hasMore) {
          this.loadMore();
        }
      },
      { threshold: 0.1 }
    );
    this.attachObserver();
  }

  private attachObserver(): void {
    // setTimeout pour attendre que le DOM soit mis à jour après le rendu conditionnel
    setTimeout(() => {
      if (this.scrollAnchor?.nativeElement) {
        this.observer.disconnect();
        this.observer.observe(this.scrollAnchor.nativeElement);
      }
    }, 0);
  }

  loadPosts(): void {
    this.isLoading = true;
    this.postService.getPosts(1, this.PAGE_SIZE).subscribe(res => {
      this.posts = res.posts;
      this.hasMore = res.hasMore;
      this.currentPage = 1;
      this.isLoading = false;
      this.attachObserver();
    });
  }

  loadMore(): void {
    if (this.isLoadingMore || !this.hasMore) return;
    this.isLoadingMore = true;
    this.currentPage++;
    this.postService.getPosts(this.currentPage, this.PAGE_SIZE).subscribe(res => {
      this.posts = [...this.posts, ...res.posts];
      this.hasMore = res.hasMore;
      this.isLoadingMore = false;
      this.attachObserver(); // ré-observer après chaque chargement
    });
  }

  loadSuggestions(): void {
    this.userService.getSuggestedUsers().subscribe(users => {
      this.suggestions = users;
    });
  }

  onPostCreated(): void { this.loadPosts(); }

  onPostDeleted(id: string): void {
    this.posts = this.posts.filter(p => p.id !== id);
  }

  followUser(userId: string): void {
    this.userService.toggleFollow(userId).subscribe(isFollowing => {
      this.suggestions = this.suggestions.map(u =>
        u.id === userId ? { ...u, isFollowing } : u
      );
      if (isFollowing) {
        this.suggestions = this.suggestions.filter(u => u.id !== userId);
        this.userService.getSuggestedUsers().subscribe(users => {
          const newSuggestions = users.filter(u => !this.suggestions.find(s => s.id === u.id));
          if (newSuggestions.length > 0) {
            this.suggestions.push(newSuggestions[0]);
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}