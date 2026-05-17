import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Post, User } from '../../models';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { PostCardComponent } from '../post-card/post-card.component';
import { TimeAgoPipe, FormatCountPipe } from '../../pipes/pipes';

type SearchTab = 'posts' | 'users';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCardComponent, TimeAgoPipe, FormatCountPipe],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  query = '';
  activeTab: SearchTab = 'posts';
  posts: Post[] = [];
  users: User[] = [];
  isLoading = false;
  hasSearched = false;

  private search$ = new Subject<string>();
  private subs = new Subscription();

  constructor(
    private postService: PostService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Read query param
    this.subs.add(
      this.route.queryParamMap.subscribe(params => {
        const q = params.get('q') || '';
        if (q) { this.query = q; this.runSearch(q); }
      })
    );

    // Debounced search
    this.subs.add(
      this.search$.pipe(
        debounceTime(350),
        distinctUntilChanged()
      ).subscribe(q => this.runSearch(q))
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  onQueryChange(): void {
    this.router.navigate([], { queryParams: { q: this.query }, replaceUrl: true });
    this.search$.next(this.query);
  }

  runSearch(q: string): void {
    if (!q.trim()) {
      this.posts = []; this.users = []; this.hasSearched = false;
      return;
    }
    this.isLoading = true;
    this.hasSearched = true;

    this.postService.searchPosts(q).subscribe(posts => {
      this.posts = posts;
      if (this.activeTab === 'posts') this.isLoading = false;
    });

    this.userService.searchUsers(q).subscribe(users => {
      this.users = users;
      if (this.activeTab === 'users') this.isLoading = false;
    });
  }

  setTab(tab: SearchTab): void {
    this.activeTab = tab;
  }

  followUser(userId: string): void {
    this.userService.toggleFollow(userId).subscribe(() => {
      this.users = this.users.map(u =>
        u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u
      );
    });
  }

  onPostDeleted(id: string): void {
    this.posts = this.posts.filter(p => p.id !== id);
  }

  clearQuery(): void {
    this.query = '';
    this.posts = []; this.users = []; this.hasSearched = false;
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  get resultCount(): number {
    return this.activeTab === 'posts' ? this.posts.length : this.users.length;
  }
}
