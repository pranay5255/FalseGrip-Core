import type { Chat, Client, Message } from 'whatsapp-web.js';

import type { OpenRouterClient } from './openrouter';
import { SUMMARY_PROMPT_TEMPLATE, SUMMARY_SYSTEM_PROMPT } from './modulePrompt';

interface SummarizeChatOptions {
  client: Client;
  openRouterClient: OpenRouterClient;
  jid: string;
  chat?: Chat;
  lookbackMs?: number;
  maxMessages?: number;
  summaryPreference?: string;
}

const DEFAULT_LOOKBACK_MS = 24 * 60 * 60 * 1000;
const DEFAULT_MAX_MESSAGES = 50;
const MAX_PROMPT_CHARS = 9_000;

export const summarizeRecentChat = async ({
  client,
  openRouterClient,
  jid,
  chat,
  lookbackMs = DEFAULT_LOOKBACK_MS,
  maxMessages = DEFAULT_MAX_MESSAGES,
  summaryPreference,
}: SummarizeChatOptions): Promise<void> => {
  if (!openRouterClient.isEnabled()) {
    console.warn('⚠️  OpenRouter client disabled. Skipping chat summary.');
    return;
  }

  const targetJid = chat?.id?._serialized ?? jid;

  try {
    const chatWithHistory = chat ?? (await client.getChatById(targetJid));
    const messages = await chatWithHistory.fetchMessages({ limit: maxMessages });
    const cutoff = Date.now() - lookbackMs;

    const recentMessages = messages
      .filter((message) => Boolean(message.timestamp) && message.timestamp! * 1000 >= cutoff)
      .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

    if (!recentMessages.length) {
      await client.sendMessage(targetJid, 'ℹ️ No messages from the last 24 hours to summarize.');
      return;
    }

    const transcript = buildTranscript(recentMessages);
    const prompt = buildSummaryPrompt(transcript, summaryPreference);
    const summary = await openRouterClient.generateText(prompt, SUMMARY_SYSTEM_PROMPT);

    await client.sendMessage(
      targetJid,
      `📝 *Last 24h Summary*\n${summary.trim()}`,
    );
  } catch (error) {
    console.error(`❌ Failed to summarize chat ${targetJid}:`, error);
    await client.sendMessage(targetJid, '⚠️ Unable to generate the chat summary right now. Please try again later.');
  }
};

const buildTranscript = (messages: Message[]): string => {
  const rows = messages.map((message) => {
    const timestamp = message.timestamp ? new Date(message.timestamp * 1000).toISOString() : 'unknown-time';
    const author = resolveAuthorLabel(message);
    const body = resolveMessageBody(message);
    return `[${timestamp}] ${author}: ${body}`;
  });

  const transcript = rows.join('\n');
  if (transcript.length <= MAX_PROMPT_CHARS) {
    return transcript;
  }

  return transcript.slice(transcript.length - MAX_PROMPT_CHARS);
};

const resolveAuthorLabel = (message: Message): string => {
  if (message.fromMe) {
    return 'Me';
  }

  const withMeta = message as Message & { _data?: { notifyName?: string; pushname?: string } };
  return withMeta._data?.notifyName ?? withMeta._data?.pushname ?? message.author ?? message.from ?? 'Contact';
};

const resolveMessageBody = (message: Message): string => {
  if (message.body) {
    return sanitizeWhitespace(message.body);
  }

  if (message.hasMedia) {
    return '[media message]';
  }

  return '[no text]';
};

const sanitizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();

const buildSummaryPrompt = (transcript: string, summaryPreference?: string): string =>
  SUMMARY_PROMPT_TEMPLATE
    .replace('{{SUMMARY_PREF}}', summaryPreference?.trim() || 'not provided')
    .replace('{{CONTEXT_BLOCK}}', transcript);
