import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Post } from '../../models';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { TimeAgoPipe, FormatCountPipe } from '../../pipes/pipes';
import { CommentListComponent } from '../comment-list/comment-list.component';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TimeAgoPipe, FormatCountPipe, CommentListComponent],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent implements OnInit {
  @Input() post!: Post;
  @Output() deleted = new EventEmitter<string>();

  isEditing = false;
  editContent = '';
  showComments = false;
  isOwner = false;
  showMenu = false;
  lightboxUrl: string | null = null;

  get currentUser() { return this.userService.currentUser(); }

  constructor(
    private postService: PostService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const me = this.userService.currentUser();
    this.isOwner = this.post.author.id === me.id;
  }

  toggleLike(): void {
    this.postService.toggleLike(this.post.id).subscribe(liked => {
      this.post = { ...this.post, isLiked: liked, likesCount: this.post.likesCount + (liked ? 1 : -1) };
    });
  }

  toggleRetweet(): void {
    this.postService.toggleRetweet(this.post.id).subscribe(rt => {
      // Local update for the button state
      this.post = { 
        ...this.post, 
        isRetweeted: rt, 
        retweetsCount: this.post.retweetsCount + (rt ? 1 : -1) 
      };
    });
  }

  toggleBookmark(): void {
    this.postService.toggleBookmark(this.post.id).subscribe(bm => {
      this.post = { ...this.post, isBookmarked: bm };
    });
  }

  startEdit(): void {
    this.isEditing = true;
    this.editContent = this.post.content;
    this.showMenu = false;
  }

  cancelEdit(): void { this.isEditing = false; }

  saveEdit(): void {
    if (!this.editContent.trim() || this.editContent === this.post.content) {
      this.isEditing = false;
      return;
    }
    this.postService.updatePost(this.post.id, this.editContent.trim()).subscribe(updated => {
      this.post = updated;
      this.isEditing = false;
    });
  }

  delete(): void {
    this.postService.deletePost(this.post.id).subscribe(() => {
      this.deleted.emit(this.post.id);
    });
    this.showMenu = false;
  }

  toggleComments(): void { this.showComments = !this.showComments; }

  formatContent(text: string): string {
    return text
      .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>')
      .replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  }

  onCommentAdded(): void {
    this.post = { ...this.post, commentsCount: this.post.commentsCount + 1 };
  }

  closeMenu(): void { this.showMenu = false; }

  openImage(url: string, event: MouseEvent): void {
    event.stopPropagation();
    this.lightboxUrl = url;
  }

  closeLightbox(): void { this.lightboxUrl = null; }
}
