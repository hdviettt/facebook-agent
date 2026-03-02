export interface WebhookQueryParams {
  "hub.mode"?: string;
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
}

export interface WebhookBody {
  object: string;
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  id: string;
  time: number;
  messaging: MessagingEvent[];
}

export interface MessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: Array<{
      type: string;
      payload: { url?: string };
    }>;
    quick_reply?: { payload: string };
  };
  postback?: {
    title: string;
    payload: string;
  };
}

export interface ParsedMessage {
  senderId: string;
  messageText: string;
  timestamp: number;
}

export interface QuickReply {
  content_type: "text";
  title: string;
  payload: string;
}
