import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket;
  public messages: Subject<string>;

  constructor() {
    this.messages = new Subject<string>();
    this.socket = new WebSocket('ws://localhost:8091/ws/messages');

    this.socket.onmessage = (event) => {
      this.messages.next(event.data); // Pass message directly as a string
    };

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  sendMessage(message: string) {
    this.socket.send(message);
  }
}
