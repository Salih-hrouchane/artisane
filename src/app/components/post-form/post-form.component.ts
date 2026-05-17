import { Component, Output, EventEmitter, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models';

const MAX_CHARS = 280;
const MAX_IMAGES = 4;

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {
  @Output() postCreated = new EventEmitter<void>();
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  get currentUser(): User | undefined { return this.userService.currentUser(); }
  content = '';
  isSubmitting = false;
  isFocused = false;
  readonly MAX_CHARS = MAX_CHARS;
  readonly MAX_IMAGES = MAX_IMAGES;

  selectedImages: { file: File; previewUrl: string }[] = [];

  constructor(
    private postService: PostService,
    private userService: UserService
  ) {}

  ngOnInit(): void {}

  get charsLeft(): number  { return MAX_CHARS - this.content.length; }
  get isOverLimit(): boolean { return this.content.length > MAX_CHARS; }
  get isEmpty(): boolean    { return this.content.trim().length === 0 && this.selectedImages.length === 0; }
  get progress(): number    { return Math.min((this.content.length / MAX_CHARS) * 100, 100); }
  get canAddMoreImages(): boolean { return this.selectedImages.length < MAX_IMAGES; }

  get ringColor(): string {
    if (this.isOverLimit) return '#f87171';
    if (this.charsLeft <= 20) return '#fbbf24';
    return '#6c63ff';
  }

  triggerFileInput(): void {
    this.fileInputRef.nativeElement.click();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const remaining = MAX_IMAGES - this.selectedImages.length;
    const toAdd = files.slice(0, remaining);

    toAdd.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImages.push({
          file,
          previewUrl: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  submit(): void {
    if (this.isEmpty || this.isOverLimit || this.isSubmitting) return;
    this.isSubmitting = true;

    const imageUrls = this.selectedImages.map(img => img.previewUrl);

    this.postService.createPost(this.content.trim(), imageUrls).subscribe(() => {
      this.content = '';
      this.selectedImages = [];
      this.isSubmitting = false;
      this.isFocused = false;
      this.postCreated.emit();
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      this.submit();
    }
  }
}
