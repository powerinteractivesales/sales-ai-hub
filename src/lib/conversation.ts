import type { ConversationMessage } from '@/types/dashboard';

// ============================================
// DELIMITER PATTERNS (Old + New)
// ============================================

const DELIMITER_PATTERNS = [
  // Old Meta delimiters
  { pattern: /AI Initial Outreach:/gi, role: 'ai' as const, messageType: 'initial_outreach' as const },
  { pattern: /AI Reply:/gi, role: 'ai' as const, messageType: 'reply' as const },
  { pattern: /PEOPLE WHO FILLED OUT FORM AGAIN - /gi, role: 'ai' as const, messageType: 'reply' as const },

  // Old Website delimiters
  { pattern: /Human inital message - /gi, role: 'human_initial' as const, messageType: 'form_response' as const },
  { pattern: /Initial Outreach:/gi, role: 'ai' as const, messageType: 'initial_outreach' as const },
  { pattern: /Lead message:/gi, role: 'human_initial' as const, messageType: 'form_response' as const },

  // Old Customer delimiter
  { pattern: /Customer Reply:/gi, role: 'customer' as const, messageType: 'customer_reply' as const },

  // New delimiters (all sources)
  { pattern: /Initial Outreach by AI -/gi, role: 'ai' as const, messageType: 'initial_outreach' as const },
  { pattern: /Reply by Power Interactive -/gi, role: 'ai' as const, messageType: 'reply' as const },
  { pattern: /Customer Reply -/gi, role: 'customer' as const, messageType: 'customer_reply' as const },
  { pattern: /Initial Form Response -/gi, role: 'human_initial' as const, messageType: 'form_response' as const },

  // Follow-ups - OLD format (with colon, no timestamp)
  { pattern: /follow up 1 :/gi, role: 'followup' as const, messageType: 'followup_1' as const },
  { pattern: /follow up 2 :/gi, role: 'followup' as const, messageType: 'followup_2' as const },
  { pattern: /follow up 3 :/gi, role: 'followup' as const, messageType: 'followup_3' as const },
  { pattern: /follow up 4 :/gi, role: 'followup' as const, messageType: 'followup_4' as const },

  // Follow-ups - NEW format (with dash + timestamp)
  { pattern: /follow up 1 -/gi, role: 'followup' as const, messageType: 'followup_1' as const },
  { pattern: /follow up 2 -/gi, role: 'followup' as const, messageType: 'followup_2' as const },
  { pattern: /follow up 3 -/gi, role: 'followup' as const, messageType: 'followup_3' as const },
  { pattern: /follow up 4 -/gi, role: 'followup' as const, messageType: 'followup_4' as const },
];

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Detects if conversation_history is new JSON format
 */
export function isStructuredConversation(conversationHistory: string): boolean {
  if (!conversationHistory) return false;

  try {
    const parsed = JSON.parse(conversationHistory);
    return (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed[0].role !== undefined &&
      parsed[0].content !== undefined
    );
  } catch {
    return false;
  }
}

/**
 * Parses old string format into structured messages
 * Handles both line-separated and inline delimiters (legacy format)
 */
function parseStringFormat(conversationHistory: string): ConversationMessage[] {
  const messages: ConversationMessage[] = [];

  // Build a combined regex that matches any delimiter
  const allDelimiters = DELIMITER_PATTERNS.map(d => d.pattern.source).join('|');
  const delimiterRegex = new RegExp(`(${allDelimiters})`, 'gi');

  // Split by delimiters while preserving them
  const parts = conversationHistory.split(delimiterRegex);

  let currentDelimiter: { role: string; messageType: string; timestamp: string | null } | null = null;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    // Check if this part is a delimiter
    let matchedDelimiter = null;
    for (const delim of DELIMITER_PATTERNS) {
      delim.pattern.lastIndex = 0;
      if (delim.pattern.test(part)) {
        matchedDelimiter = delim;
        break;
      }
    }

    if (matchedDelimiter) {
      // This is a delimiter - save any previous message first
      if (currentDelimiter) {
        // Look back at previous parts to gather content
        // (This handles legacy format where delimiter might be inline)
      }

      // Extract timestamp - check current part AND next part
      let extractedTimestamp = null;

      // First, try to find timestamp in the current delimiter part
      let timestampMatch = part.match(/(\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}\s+[AP]M)/i);

      // If not found, check the next part (timestamp might be after delimiter)
      if (!timestampMatch && i + 1 < parts.length) {
        timestampMatch = parts[i + 1].match(/(\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}\s+[AP]M)/i);
      }

      if (timestampMatch) {
        // n8n sends UTC timestamps in format "2025-12-26 01:56 PM"
        // Parse as UTC and convert to ISO string
        try {
          const utcTimeString = timestampMatch[1];
          // Explicitly parse as UTC by appending 'UTC' to ensure correct interpretation
          const utcDate = new Date(utcTimeString + ' UTC');
          extractedTimestamp = utcDate.toISOString();
        } catch {
          // Fallback if parsing fails - use null to indicate no timestamp found
          extractedTimestamp = null;
        }
      }

      currentDelimiter = {
        role: matchedDelimiter.role,
        messageType: matchedDelimiter.messageType,
        timestamp: extractedTimestamp,
      };
    } else if (currentDelimiter) {
      // This is content for the current message
      let content = part.trim();

      // Remove timestamp from content if present (it's already extracted to the message timestamp)
      content = content.replace(/^\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}\s+[AP]M\s*/i, '');

      if (content) {
        // Clean customer replies (remove email signatures)
        let cleanedContent = content;
        if (currentDelimiter.role === 'customer') {
          cleanedContent = content
            .replace(/\[cid:[^\]]+\]/g, '')
            .replace(/^E:.*$/gm, '')
            .replace(/^M:.*$/gm, '')
            .replace(/^T:.*$/gm, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        }

        if (cleanedContent) {
          // For legacy messages without timestamps, use a placeholder old date
          // instead of current time (which would be misleading)
          const timestamp = currentDelimiter.timestamp || '2024-01-01T00:00:00.000Z';

          messages.push({
            role: currentDelimiter.role as any,
            content: cleanedContent,
            timestamp: timestamp,
            messageType: currentDelimiter.messageType as any,
          });
        }

        currentDelimiter = null; // Reset for next message
      }
    }
  }

  return messages;
}

/**
 * Main parsing function - handles both JSON and string formats
 */
export function parseConversation(conversationHistory: string): ConversationMessage[] {
  if (!conversationHistory) return [];

  // Try parsing as new JSON format first
  if (isStructuredConversation(conversationHistory)) {
    return JSON.parse(conversationHistory);
  }

  // Parse old string format
  const messages = parseStringFormat(conversationHistory);

  // If parsing failed, return entire string as system message (fallback)
  if (messages.length === 0) {
    return [{
      role: 'ai',
      content: conversationHistory,
      timestamp: new Date().toISOString(),
      messageType: 'initial_outreach',
    }];
  }

  return messages;
}

/**
 * Groups messages by date for UI rendering
 */
export function groupMessagesByDate(
  messages: ConversationMessage[]
): Record<string, ConversationMessage[]> {
  const groups: Record<string, ConversationMessage[]> = {};

  messages.forEach(msg => {
    const date = new Date(msg.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });

  return groups;
}

/**
 * Gets a human-readable label for message type
 */
export function getMessageLabel(message: ConversationMessage): string {
  switch (message.messageType) {
    case 'initial_outreach':
      return 'AI Assistant';
    case 'reply':
      return 'Power Interactive';
    case 'customer_reply':
      return 'Customer';
    case 'form_response':
      return 'Initial Inquiry';
    case 'followup_1':
      return 'Follow-up 1';
    case 'followup_2':
      return 'Follow-up 2';
    case 'followup_3':
      return 'Follow-up 3';
    case 'followup_4':
      return 'Follow-up 4';
    default:
      return message.role === 'ai' ? 'AI Assistant' : 'Customer';
  }
}
