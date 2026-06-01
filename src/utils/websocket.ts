import { ref } from 'vue';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Notification as AppNotification } from '@/types/reminder';

class WebSocketService {
  private client: Client;
  private _connected = ref(false);
  private notifications = ref<AppNotification[]>([]);
  private noteSummaries = ref<any[]>([]);

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8090/ws'),
      connectHeaders: {},
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('WebSocket connected');
      this._connected.value = true;

      // 个人提醒（任务到期 + 自定义提醒）
      this.client.subscribe('/user/queue/reminders', (message) => {
        const reminderData = JSON.parse(message.body);
        this.handleReminder(reminderData);
      });

      // 笔记摘要完成通知
      this.client.subscribe('/user/queue/note-summary', (message) => {
        const data = JSON.parse(message.body);
        this.handleNoteSummary(data);
      });

      // 全局广播提醒
      this.client.subscribe('/topic/reminders', (message) => {
        const reminderData = JSON.parse(message.body);
        this.handleReminder(reminderData);
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.onWebSocketError = (event) => {
      console.error('WebSocket error: ', event);
    };

    this.client.onDisconnect = () => {
      console.log('WebSocket disconnected');
      this._connected.value = false;
    };
  }

  connect() {
    if (!this.client.active) {
      try {
        this.client.activate();
      } catch (error) {
        console.error('WebSocket连接激活失败:', error);
      }
    }
  }

  disconnect() {
    if (this.client.active) {
      try {
        this.client.deactivate();
      } catch (error) {
        console.error('WebSocket断开连接失败:', error);
      }
    }
  }

  subscribeToNoteSummary(username: string) {
    if (this.client.active) {
      this.client.publish({
        destination: '/app/note-subscribe',
        body: JSON.stringify({ username })
      });
    }
  }

  private handleReminder(reminderData: any) {
    try {
      const notification: AppNotification = {
        id: Date.now(),
        title: reminderData.title || reminderData.type === 'TASK_DUE' ? '任务到期提醒' : '自定义提醒',
        content: reminderData.message || '您有一个任务需要处理',
        type: reminderData.type === 'TASK_DUE' ? 'warning' : 'info',
        timestamp: new Date().toISOString(),
        isRead: false
      };

      this.notifications.value.unshift(notification);
      this.showBrowserNotification(notification);
    } catch (error) {
      console.error('处理提醒消息时出错:', error);
    }
  }

  private handleNoteSummary(data: any) {
    console.log('收到笔记摘要:', data);
    this.noteSummaries.value.unshift(data);
    window.dispatchEvent(new CustomEvent('note-summary-ready', { detail: data }));
  }

  private showBrowserNotification(notification: AppNotification) {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.content,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.content,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }
  }

  getNotifications() {
    return this.notifications.value;
  }

  getNoteSummaries() {
    return this.noteSummaries.value;
  }

  markAsRead(notificationId: number) {
    const notification = this.notifications.value.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  clearNotifications() {
    this.notifications.value = [];
  }

  getConnectionStatus() {
    return this._connected.value;
  }

  isConnected(): boolean {
    return this._connected.value;
  }
}

let instance: WebSocketService | null = null;

export function useWebSocket(): WebSocketService {
  if (!instance) {
    instance = new WebSocketService();
  }
  return instance;
}
