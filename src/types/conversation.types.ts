export interface ConversationMessage {
  id: number;
  sender_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}
