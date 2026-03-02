export interface ConversationMessage {
  id: number;
  sender_id: string;
  role: "user" | "assistant";
  content: string;
  tool_calls: ToolCallRecord[] | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ToolCallRecord {
  name: string;
  input: Record<string, unknown>;
  result: unknown;
}
