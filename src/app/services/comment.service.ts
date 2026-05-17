import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Comment } from '../models';
import { UserService } from './user.service';
import { PostService } from './post.service';

@Injectable({ providedIn: 'root' })
export class CommentService {

  private _comments$ = new BehaviorSubject<Comment[]>([]);

  constructor(private userService: UserService, private postService: PostService) {
    this._initComments();
  }

  private _initComments(): void {
    this.userService.getUsers().subscribe(users => {
      const comments: Comment[] = [
        { id: 'c1', postId: 'post-1', author: users[1], content: 'Ces motifs sont magnifiques ! Le losange central est typique des tribus du Haut Atlas 🏔️', createdAt: new Date(Date.now() - 3_600_000), likesCount: 12, isLiked: false },
        { id: 'c2', postId: 'post-1', author: users[2], content: 'J\'ai acheté un de tes tapis l\'année dernière. Il est encore plus beau avec le temps !', createdAt: new Date(Date.now() - 7_200_000), likesCount: 8, isLiked: true },
        { id: 'c3', postId: 'post-1', author: users[3], content: 'Est-ce que tu livres à l\'étranger ? Des clients européens me posent la question.', createdAt: new Date(Date.now() - 10_800_000), likesCount: 3, isLiked: false },
        { id: 'c4', postId: 'post-2', author: users[0], content: 'Transmettre à son fils, c\'est la plus belle chose ! Le tour de potier s\'apprend dans la patience 🙏', createdAt: new Date(Date.now() - 1_800_000), likesCount: 7, isLiked: false },
        { id: 'c5', postId: 'post-2', author: users[4], content: 'Le bleu de Fès reste unique au monde. Aucune usine ne peut reproduire ça !', createdAt: new Date(Date.now() - 5_400_000), likesCount: 4, isLiked: false },
        { id: 'c6', postId: 'post-3', author: users[5], content: 'La broderie de Rabat au fil d\'or — j\'ai appris ça avec ma grand-mère. Des souvenirs inoubliables ❤️', createdAt: new Date(Date.now() - 900_000), likesCount: 19, isLiked: true },
        { id: 'c7', postId: 'post-3', author: users[6], content: 'Tu fais des stages pour les débutants ? Je voudrais apprendre cette technique !', createdAt: new Date(Date.now() - 2_700_000), likesCount: 11, isLiked: false },
        { id: 'c8', postId: 'post-4', author: users[0], content: 'Superbe travail ! Le cuir tanné naturellement dure des décennies. C\'est ça l\'artisanat authentique.', createdAt: new Date(Date.now() - 600_000), likesCount: 5, isLiked: false },
        { id: 'c9', postId: 'post-4', author: users[7], content: 'Les tanneurs de Fès utilisent la même méthode depuis le Moyen Âge. C\'est impressionnant 🤝', createdAt: new Date(Date.now() - 1_200_000), likesCount: 2, isLiked: false },
        { id: 'c10', postId: 'post-5', author: users[2], content: 'Le zellige demande une précision incroyable. 6 mois pour une fontaine, c\'est tout à fait normal pour ce niveau !', createdAt: new Date(Date.now() - 86_400_000), likesCount: 14, isLiked: false },
        { id: 'c11', postId: 'post-6', author: users[0], content: 'L\'odeur du thuya est incomparable. Chaque fois que j\'ouvre mon coffret, c\'est le Maroc qui s\'invite chez moi.', createdAt: new Date(Date.now() - 43_200_000), likesCount: 28, isLiked: true },
        { id: 'c12', postId: 'post-6', author: users[3], content: 'La marqueterie en nacre est vraiment rare aujourd\'hui. Merci de perpétuer cet art !', createdAt: new Date(Date.now() - 86_400_000), likesCount: 17, isLiked: false },
      ];
      this._comments$.next(comments);
    });
  }

  getCommentsByPost(postId: string): Observable<Comment[]> {
    return this._comments$.pipe(
      map(comments => comments.filter(c => c.postId === postId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())),
      delay(150)
    );
  }

  addComment(postId: string, content: string): Observable<Comment> {
    const me = this.userService.currentUser();
    const newComment: Comment = {
      id: `c-${Date.now()}`, postId, author: me, content,
      createdAt: new Date(), likesCount: 0, isLiked: false
    };
    this._comments$.next([newComment, ...this._comments$.value]);
    this.postService.getPostById(postId).subscribe(post => {
      if (post && post.author.id !== me.id) {
        this.userService.addNotification({ type: 'comment', actor: me, recipientId: post.author.id, postId: post.id, postContent: post.content });
      }
    });
    return of(newComment).pipe(delay(100));
  }

  toggleLike(commentId: string): Observable<boolean> {
    let isLiked = false;
    const updated = this._comments$.value.map(c => {
      if (c.id !== commentId) return c;
      isLiked = !c.isLiked;
      return { ...c, isLiked, likesCount: c.likesCount + (isLiked ? 1 : -1) };
    });
    this._comments$.next(updated);
    if (isLiked) {
      const likedComment = updated.find(c => c.id === commentId);
      const me = this.userService.currentUser();
      if (likedComment && likedComment.author.id !== me.id) {
        this.userService.addNotification({ type: 'like', actor: me, recipientId: likedComment.author.id, postId: likedComment.postId, postContent: likedComment.content });
      }
    }
    return of(isLiked).pipe(delay(80));
  }

  deleteComment(commentId: string): Observable<void> {
    this._comments$.next(this._comments$.value.filter(c => c.id !== commentId));
    return of(void 0).pipe(delay(100));
  }

  getCommentCount(postId: string): Observable<number> {
    return this._comments$.pipe(map(comments => comments.filter(c => c.postId === postId).length));
  }
}
