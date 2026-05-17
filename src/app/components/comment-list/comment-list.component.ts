import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Comment } from '../../models';
import { CommentService } from '../../services/comment.service';
import { UserService } from '../../services/user.service';
import { TimeAgoPipe, FormatCountPipe } from '../../pipes/pipes';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TimeAgoPipe, FormatCountPipe],
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnInit {
  @Input() postId!: string;
  @Output() commentAdded = new EventEmitter<void>();
  
  comments: Comment[] = [];
  newComment = '';
  isSubmitting = false;
  currentUserInitials = '';
  currentUserColor = '';
  currentUserId = '';

  constructor(
    private commentService: CommentService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const me = this.userService.currentUser();
    this.currentUserInitials = me.avatarInitials;
    this.currentUserColor = me.avatarColor;
    this.currentUserId = me.id;
    this.loadComments();
  }

  loadComments(): void {
    this.commentService.getCommentsByPost(this.postId).subscribe(comments => {
      this.comments = comments;
    });
  }

  addComment(): void {
    if (!this.newComment.trim() || this.isSubmitting) return;
    this.isSubmitting = true;
    this.commentService.addComment(this.postId, this.newComment.trim()).subscribe(comment => {
      this.comments = [comment, ...this.comments];
      this.newComment = '';
      this.isSubmitting = false;
      this.commentAdded.emit();
    });
  }

  toggleLike(comment: Comment): void {
    this.commentService.toggleLike(comment.id).subscribe(liked => {
      const index = this.comments.findIndex(c => c.id === comment.id);
      if (index !== -1) {
        this.comments[index] = {
          ...this.comments[index],
          isLiked: liked,
          likesCount: this.comments[index].likesCount + (liked ? 1 : -1)
        };
      }
    });
  }

  deleteComment(id: string): void {
    this.commentService.deleteComment(id).subscribe(() => {
      this.comments = this.comments.filter(c => c.id !== id);
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.addComment();
    }
  }
}
