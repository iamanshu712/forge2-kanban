const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config();

const express = require('express');
const { App } = require('@slack/bolt');
const OpenClawAgent = require('../openclaw/agent');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.HERMES_PORT || 3001;
const LARAVEL_API_URL = process.env.KANBAN_API_URL || process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000';
const AGENT_API_TOKEN = process.env.AGENT_API_TOKEN || '4|rkG3s6M11iACXNzrgUsDHkpwExfedSukr9hjVplX29c218cf';

// Initialize OpenClaw Agent
const agent = new OpenClawAgent(LARAVEL_API_URL, AGENT_API_TOKEN);

// Optional Slack Socket Mode App if tokens provided
const slackAppToken = process.env.SLACK_APP_TOKEN;
const slackBotToken = process.env.SLACK_BOT_TOKEN;

if (slackAppToken && slackAppToken.startsWith('xapp-') && slackBotToken && slackBotToken.startsWith('xoxb-')) {
  try {
    const slackApp = new App({
      token: slackBotToken,
      appToken: slackAppToken,
      socketMode: true
    });

    slackApp.command('/kanban', async ({ command, ack, respond }) => {
      await ack();
      const reply = await agent.processCommand(command.text);
      await respond({ response_type: 'in_channel', text: reply });
    });

    slackApp.event('app_mention', async ({ event, say }) => {
      const text = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();
      const reply = await agent.processCommand(text);
      await say(reply);
    });

    (async () => {
      await slackApp.start();
      console.log('⚡️ Slack Bolt Socket Mode App started successfully!');
    })();
  } catch (err) {
    console.warn('[Slack Socket Mode Warning]', err.message);
  }
}

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({
    service: 'Hermes Orchestrator',
    status: 'running',
    openclaw_agent: 'active',
    slack_socket_mode: Boolean(slackAppToken && slackBotToken)
  });
});

/**
 * Slack Slash Command Endpoint: /slack/commands
 * Flow: Slack -> Hermes -> OpenClaw -> Laravel API -> DB
 */
app.post('/slack/commands', async (req, res) => {
  try {
    const text = req.body.text || req.body.command || '';
    const user_name = req.body.user_name || 'Slack User';

    console.log(`[Hermes Orchestrator] Received Slack command from ${user_name}: "${text}"`);

    // Delegate to OpenClaw Agent
    const reply = await agent.processCommand(text);

    // Respond back to Slack formatted as Markdown
    return res.json({
      response_type: 'in_channel',
      text: reply
    });
  } catch (error) {
    console.error('[Hermes Error]', error.message);
    return res.json({
      response_type: 'ephemeral',
      text: `❌ *Error processing Slack command*: ${error.message}`
    });
  }
});

/**
 * Slack Events Webhook Endpoint: /slack/events
 */
app.post('/slack/events', async (req, res) => {
  if (req.body.type === 'url_verification') {
    return res.json({ challenge: req.body.challenge });
  }

  try {
    const event = req.body.event || {};
    if (event.type === 'app_mention' || event.type === 'message') {
      const text = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();
      const reply = await agent.processCommand(text);
      return res.json({ status: 'ok', reply });
    }
    return res.json({ status: 'ignored' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Hermes Orchestrator running on http://127.0.0.1:${PORT}`);
  console.log(`🤖 OpenClaw AI Agent integrated & connected to Laravel API at ${LARAVEL_API_URL}`);
  console.log(`💬 Listening for Slack Webhooks on http://127.0.0.1:${PORT}/slack/commands\n`);
});
