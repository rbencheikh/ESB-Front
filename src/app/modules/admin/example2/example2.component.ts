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

export interface Elements {
  name: string;
}

@Component({
    selector     : 'example2',
    standalone   : true,
    templateUrl  : './example2.component.html',
    imports: [MatFormFieldModule, MatChipsModule, MatIconModule, HttpClientModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ElementsService]
})
export class Example2Component implements OnInit {
  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly elements = signal<Elements[]>([]);
  readonly announcer = inject(LiveAnnouncer);
  private elementsService: ElementsService = inject(ElementsService);

  
  ngOnInit() {
    this.fetchElements();
  }

  fetchElements() {
    this.elementsService.getElements().subscribe((data: Set<string>) => {
      this.elements.set(Array.from(data).map(name => ({ name })));
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

  trackElement(index: number, element: Elements): string {
    return element.name;
  }
}