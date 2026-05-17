import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Post, TrendingHashtag, User } from '../models';
import { UserService } from './user.service';

function randomDate(daysAgo: number): Date {
  return new Date(Date.now() - Math.random() * daysAgo * 86_400_000);
}

@Injectable({ providedIn: 'root' })
export class PostService {

  private _posts$ = new BehaviorSubject<Post[]>([]);

  constructor(private userService: UserService) {
    this._initPosts();
  }

  private _initPosts(): void {
    this.userService.getUsers().subscribe(users => {
      const me = this.userService.currentUser();
      const allUsers = [me, ...users];

      const rawPosts: Omit<Post, 'id'>[] = [
        {
          author: users[0],
          content: '🧶 Nouvelle collection de tapis berbères disponible ! Chaque pièce est tissée à la main avec de la laine naturelle. Les motifs racontent l\'histoire de nos ancêtres de l\'Atlas. #tissage #berbere #artisanat',
          createdAt: randomDate(0.1),
          likesCount: 142, retweetsCount: 38, commentsCount: 12,
          isLiked: false, isRetweeted: false, isBookmarked: false,
          hashtags: ['tissage', 'berbere', 'artisanat']
        },
        {
          author: users[1],
          content: 'La céramique bleue de Fès n\'est pas juste un art, c\'est une transmission de génération en génération 🏺✨ Mon fils commence à apprendre le tour de potier ce mois-ci ! #poterie #fes #savoirfaire',
          createdAt: randomDate(0.3),
          likesCount: 89, retweetsCount: 21, commentsCount: 7,
          isLiked: true, isRetweeted: false, isBookmarked: false,
          hashtags: ['poterie', 'fes', 'savoirfaire']
        },
        {
          author: users[2],
          content: 'La broderie de Rabat au fil d\'or — un travail de patience et d\'amour ❤️\n\nThread sur les techniques ancestrales ⬇️ #broderie #Rabat #artisanat',
          createdAt: randomDate(0.5),
          likesCount: 267, retweetsCount: 94, commentsCount: 31,
          isLiked: false, isRetweeted: true, isBookmarked: true,
          hashtags: ['broderie', 'Rabat', 'artisanat']
        },
        {
          author: me,
          content: 'Je viens de terminer une pièce unique en cuir tanné naturellement. Le processus prend 3 semaines mais le résultat est incomparable 🙌 #maroquinerie #cuir #marrakech',
          createdAt: randomDate(0.8),
          likesCount: 54, retweetsCount: 11, commentsCount: 5,
          isLiked: false, isRetweeted: false, isBookmarked: false,
          hashtags: ['maroquinerie', 'cuir', 'marrakech']
        },
        {
          author: users[3],
          content: 'Le zellige de Meknès — chaque carreau est découpé et posé à la main 🔷 Un projet de 6 mois pour cette fontaine traditionnelle. Qui a dit que l\'artisanat est mourant ? #zellige',
          createdAt: randomDate(1),
          likesCount: 198, retweetsCount: 67, commentsCount: 23,
          isLiked: false, isRetweeted: false, isBookmarked: false,
          hashtags: ['zellige', 'meknes', 'mosaique']
        },
        {
          author: users[4],
          content: 'Le thuya d\'Essaouira sent le paradis 🪵 J\'ai créé ce coffret en 40 heures de travail. La marqueterie en nacre et citronnier, c\'est notre signature ! #thuya #essaouira #bois',
          createdAt: randomDate(1.2),
          likesCount: 321, retweetsCount: 112, commentsCount: 44,
          isLiked: true, isRetweeted: true, isBookmarked: true,
          hashtags: ['thuya', 'essaouira', 'bois']
        },
        {
          author: users[5],
          content: '💍 Nouvelle parure berbère en argent massif avec corail naturel de la Méditerranée. Les bijoux racontent notre identité. On ne laissera pas cet art disparaître ! #bijoux #argent #berbere',
          createdAt: randomDate(1.5),
          likesCount: 445, retweetsCount: 238, commentsCount: 19,
          isLiked: false, isRetweeted: true, isBookmarked: false,
          hashtags: ['bijoux', 'argent', 'berbere']
        },
        {
          author: users[6],
          content: 'Le cuivre ciselé de Fès — des heures à frapper le métal pour créer ces motifs géométriques arabesques 🔔 La dinanderie est un art méditatif. #dinanderie #cuivre #fes',
          createdAt: randomDate(2),
          likesCount: 176, retweetsCount: 52, commentsCount: 15,
          isLiked: false, isRetweeted: false, isBookmarked: true,
          hashtags: ['dinanderie', 'cuivre', 'fes']
        },
        {
          author: users[7],
          content: 'Atelier ouvert ce weekend à Marrakech ! Venez apprendre le tissage traditionnel 🧶 Places limitées, inscription en message privé. Tous niveaux bienvenus ! #atelier #tissage #marrakech',
          createdAt: randomDate(2.5),
          likesCount: 203, retweetsCount: 78, commentsCount: 28,
          isLiked: false, isRetweeted: false, isBookmarked: false,
          hashtags: ['atelier', 'tissage', 'marrakech']
        },
        {
          author: users[0],
          content: 'Rappel : l\'artisanat marocain est inscrit à l\'UNESCO. Ce n\'est pas qu\'un métier, c\'est notre patrimoine vivant 🌟 Soutenons les artisans locaux ! #patrimoine #artisanat #maroc',
          createdAt: randomDate(3),
          likesCount: 88, retweetsCount: 19, commentsCount: 33,
          isLiked: true, isRetweeted: false, isBookmarked: false,
          hashtags: ['patrimoine', 'artisanat', 'maroc']
        },
        {
          author: users[1],
          content: 'La poterie noire de Tamegroute — une technique unique dans tout le Maroc 🏺 La couleur noire vient du manganèse naturel du Draa. #poterie #tamegroute #draa',
          createdAt: randomDate(3.5),
          likesCount: 134, retweetsCount: 45, commentsCount: 18,
          isLiked: false, isRetweeted: false, isBookmarked: false,
          hashtags: ['poterie', 'tamegroute', 'draa']
        },
        {
          author: users[2],
          content: 'Proverbe marocain du jour : « يد واحدة ما تصفق » — Une seule main ne peut applaudir. C\'est aussi vrai pour préserver notre artisanat 🤝 Ensemble, on transmet ! #sagesse #artisanat',
          createdAt: randomDate(4),
          likesCount: 312, retweetsCount: 145, commentsCount: 42,
          isLiked: false, isRetweeted: false, isBookmarked: true,
          hashtags: ['sagesse', 'artisanat', 'maroc']
        },
      ];

      const posts: Post[] = rawPosts.map((p, i) => ({ ...p, id: `post-${i + 1}` }));
      this._posts$.next(posts);
    });
  }

  getPosts(page: number = 1, pageSize: number = 10): Observable<{ posts: Post[], total: number, hasMore: boolean }> {
    return this._posts$.pipe(
      map(posts => {
        const sorted = [...posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const start = (page - 1) * pageSize;
        const slice = sorted.slice(start, start + pageSize);
        return { posts: slice, total: posts.length, hasMore: start + pageSize < posts.length };
      }),
      delay(200)
    );
  }

  getPostById(id: string): Observable<Post | undefined> {
    return this._posts$.pipe(map(posts => posts.find(p => p.id === id)), delay(100));
  }

  getPostsByUser(username: string): Observable<Post[]> {
    return this._posts$.pipe(
      map(posts => posts.filter(p => p.author.username === username || p.retweetedBy === username)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())),
      delay(150)
    );
  }

  getLikedPostsByUser(username: string): Observable<Post[]> {
    return this._posts$.pipe(
      map(posts => posts.filter(p => p.isLiked).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())),
      delay(150)
    );
  }

  createPost(content: string, imageUrls: string[] = []): Observable<Post> {
    const me = this.userService.currentUser();
    const hashtags = (content.match(/#\w+/g) || []).map(h => h.slice(1));
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: me,
      content,
      createdAt: new Date(),
      likesCount: 0, retweetsCount: 0, commentsCount: 0,
      isLiked: false, isRetweeted: false, isBookmarked: false,
      hashtags,
      ...(imageUrls.length > 0 ? { imageUrls } : {})
    };
    this._posts$.next([newPost, ...this._posts$.value]);
    return of(newPost).pipe(delay(100));
  }

  updatePost(id: string, content: string): Observable<Post> {
    const posts = this._posts$.value.map(p => {
      if (p.id !== id) return p;
      const hashtags = (content.match(/#\w+/g) || []).map(h => h.slice(1));
      return { ...p, content, hashtags };
    });
    this._posts$.next(posts);
    const updated = posts.find(p => p.id === id)!;
    return of(updated).pipe(delay(100));
  }

  deletePost(id: string): Observable<void> {
    this._posts$.next(this._posts$.value.filter(p => p.id !== id));
    return of(void 0).pipe(delay(100));
  }

  toggleLike(id: string): Observable<boolean> {
    const me = this.userService.currentUser();
    let isLiked = false;
    const posts = this._posts$.value.map(p => {
      if (p.id !== id) return p;
      isLiked = !p.isLiked;
      return { ...p, isLiked, likesCount: p.likesCount + (isLiked ? 1 : -1) };
    });
    this._posts$.next(posts);
    if (isLiked) {
      const likedPost = posts.find(p => p.id === id);
      if (likedPost && likedPost.author.id !== me.id) {
        this.userService.addNotification({ type: 'like', actor: me, recipientId: likedPost.author.id, postId: likedPost.id, postContent: likedPost.content });
      }
    }
    return of(isLiked).pipe(delay(80));
  }

  toggleRetweet(id: string): Observable<boolean> {
    const me = this.userService.currentUser();
    let isRetweetedNow = false;
    let currentPosts = [...this._posts$.value];
    const targetPostIndex = currentPosts.findIndex(p => p.id === id && !p.retweetedBy);
    if (targetPostIndex === -1) return of(false);
    const targetPost = currentPosts[targetPostIndex];
    isRetweetedNow = !targetPost.isRetweeted;
    currentPosts[targetPostIndex] = { ...targetPost, isRetweeted: isRetweetedNow, retweetsCount: targetPost.retweetsCount + (isRetweetedNow ? 1 : -1) };
    if (isRetweetedNow) {
      const retweetPost: Post = {
        id: `rt-${Date.now()}-${id}`,
        author: targetPost.author, content: targetPost.content, createdAt: new Date(),
        likesCount: targetPost.likesCount, retweetsCount: targetPost.retweetsCount + 1,
        commentsCount: targetPost.commentsCount, isLiked: targetPost.isLiked,
        isRetweeted: true, isBookmarked: targetPost.isBookmarked,
        hashtags: targetPost.hashtags, retweetedBy: me.username, originalPost: targetPost
      };
      currentPosts = [retweetPost, ...currentPosts];
    } else {
      currentPosts = currentPosts.filter(p => !(p.retweetedBy === me.username && p.originalPost?.id === id));
    }
    this._posts$.next(currentPosts);
    if (isRetweetedNow && targetPost.author.id !== me.id) {
      this.userService.addNotification({ type: 'retweet', actor: me, recipientId: targetPost.author.id, postId: targetPost.id, postContent: targetPost.content });
    }
    return of(isRetweetedNow).pipe(delay(80));
  }

  toggleBookmark(id: string): Observable<boolean> {
    let isBookmarked = false;
    const posts = this._posts$.value.map(p => {
      if (p.id !== id) return p;
      isBookmarked = !p.isBookmarked;
      return { ...p, isBookmarked };
    });
    this._posts$.next(posts);
    return of(isBookmarked).pipe(delay(80));
  }

  searchPosts(query: string): Observable<Post[]> {
    const q = query.toLowerCase().trim();
    if (!q) return of([]);
    return this._posts$.pipe(
      map(posts => posts.filter(p =>
        p.content.toLowerCase().includes(q) ||
        p.hashtags.some(h => h.toLowerCase().includes(q.replace('#', '')))
      )),
      delay(120)
    );
  }

  getTrendingHashtags(): Observable<TrendingHashtag[]> {
    const tags: TrendingHashtag[] = [
      { id: 't1', tag: 'tissage',      postsCount: 8400,  category: 'Textile',    trend: 'up' },
      { id: 't2', tag: 'poterie',      postsCount: 12700, category: 'Céramique',  trend: 'up' },
      { id: 't3', tag: 'zellige',      postsCount: 6200,  category: 'Mosaïque',   trend: 'stable' },
      { id: 't4', tag: 'maroquinerie', postsCount: 9800,  category: 'Cuir',       trend: 'up' },
      { id: 't5', tag: 'broderie',     postsCount: 7300,  category: 'Textile',    trend: 'stable' },
      { id: 't6', tag: 'thuya',        postsCount: 4600,  category: 'Bois',       trend: 'down' },
      { id: 't7', tag: 'bijoux',       postsCount: 15400, category: 'Joaillerie', trend: 'up' },
      { id: 't8', tag: 'artisanat',    postsCount: 34100, category: 'Général',    trend: 'up' },
      { id: 't9', tag: 'maroc',        postsCount: 28700, category: 'Général',    trend: 'stable' },
      { id: 't10', tag: 'dinanderie',  postsCount: 3200,  category: 'Métal',      trend: 'down' },
    ];
    return of(tags).pipe(delay(100));
  }
}
