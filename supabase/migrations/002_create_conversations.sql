CREATE TABLE conversations (
    id              BIGSERIAL PRIMARY KEY,
    sender_id       VARCHAR(100) NOT NULL,
    role            VARCHAR(20) NOT NULL,
    content         TEXT NOT NULL,
    tool_calls      JSONB,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_sender ON conversations(sender_id, created_at DESC);
