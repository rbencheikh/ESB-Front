import { Component, inject, OnInit } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ElementsService } from './example2..service'; 
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy } from '@angular/core';
import { signal } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FileUploadService } from './file-upload.service';

export interface Elements {
  name: string;
}

@Component({
    selector     : 'example2',
    standalone   : true,
    templateUrl  : './example2.component.html',
    imports: [MatFormFieldModule, MatChipsModule, MatIconModule, HttpClientModule, NgFor, NgIf, NgClass],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ElementsService,FileUploadService]
})
export class Example2Component implements OnInit {
  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly elements = signal<Elements[]>([]);
  readonly announcer = inject(LiveAnnouncer);
 // private elementsService: ElementsService = inject(ElementsService);
  readonly selectedElementText = signal<string>('');
  //private http: HttpClient = inject(HttpClient); 
  file: File | null = null;
  responseMessage: string | null = null;
  fileContent: string | ArrayBuffer | null = null;


  constructor(private fileUploadService: FileUploadService,private elementsService: ElementsService,
    private http: HttpClient) { }

  
 
  ngOnInit() {
    this.fetchElements();

    // Add initial values to the elements
    const initialElements = [
      { name: '[' },
      { name: ']' },
      { name: ':' },
      { name: '{' },
      { name: '}' },
      { name: ',' },
      { name: '<' },
      { name: '>' },
      { name: '/>' },
      { name: '"' },
    ];
    this.elements.set(initialElements);
  }

  fetchElements() {
    this.elementsService.getElements().subscribe((data: Set<string>) => {
      this.elements.update(existingElements => [
        ...existingElements,
        ...Array.from(data).map(name => ({ name }))
      ]);
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.elements.update(elements => [...elements, { name: value }]);
    }
    event.chipInput!.clear();
  }

  remove(element: Elements): void {
    this.elements.update(elements => {
      const index = elements.indexOf(element);
      if (index < 0) {
        return elements;
      }
      elements.splice(index, 1);
      this.announcer.announce(`Removed ${element.name}`);
      return [...elements];
    });
  }

  edit(element: Elements, event: MatChipEditedEvent) {
    const value = event.value.trim();
    if (!value) {
      this.remove(element);
      return;
    }
    this.elements.update(elements => {
      const index = elements.indexOf(element);
      if (index >= 0) {
        elements[index].name = value;
        return [...elements];
      }
      return elements;
    });
  }

  selectElement(element: Elements) {
    const currentText = this.selectedElementText();
    this.selectedElementText.set(currentText ? `${currentText} ${element.name}` : element.name);
  }

  onTextareaInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.selectedElementText.set(target.value);
  }

  trackElement(index: number, element: Elements): string {
    return element.name;
  }

  handleKeydown(event: KeyboardEvent) {
    if (!(event.key === ' ' || event.key === 'Enter' || event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
    }
  }

  submitFile() {
    const content = this.selectedElementText();
    const blob = new Blob([content], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, 'content.txt');

    this.http.post('http://localhost:8222/messages/uploadFile1', formData).subscribe(
      response => {
        console.log('File submitted successfully', response);
      },
      error => {
        console.error('Error submitting file', error);
      }
    );
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.file = inputElement.files[0];

      // Read file content
      const reader = new FileReader();
      reader.onload = () => {
        this.fileContent = reader.result;
      };
      reader.readAsText(this.file);

      // Upload file automatically after selecting
      this.uploadFile();
      this.fetchElements();
    }
  }

  uploadFile(): void {
    if (this.file) {
      this.fileUploadService.uploadFile(this.file, 'C:/Users/rbencheikh/Desktop/Input').subscribe(
        (response) => {
          this.responseMessage = response;
        },
        (error) => {
          this.responseMessage = `Error: ${error.message}`;
        }
      );
    } else {
      this.responseMessage = 'Please select a file first.';
    }
  }

}