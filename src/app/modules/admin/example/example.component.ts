import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { WebSocketService } from './exemple..service';

@Component({
    selector     : 'example',
    standalone   : true,
    templateUrl  : './example.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ExampleComponent implements OnInit
{
    messageContent: string = '';
  messageDetails: string = '';
  transformedMessage: string = '';

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    this.webSocketService.messages.subscribe((message: string) => {
      console.log('Received message:', message);
      this.handleMessage(message);
    });
  }

  handleMessage(message: string) {
    this.messageContent = message;
    this.messageDetails = '';
    this.transformedMessage = '';
    
    // Example: Displaying the message directly
    this.transformedMessage = message;
  }
}
