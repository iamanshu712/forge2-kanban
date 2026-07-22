const KanbanTools = require('./tools');

class OpenClawAgent {
  constructor(baseUrl, apiToken) {
    this.tools = new KanbanTools(baseUrl, apiToken);
  }

  /**
   * Process a natural language instruction from Hermes/Slack.
   */
  async processCommand(text) {
    const trimmed = text.trim();

    // 1. Create Task Command
    // Example: "create task Build Auth in To Do priority high"
    if (/^create\s+task/i.test(trimmed) || /^add\s+task/i.test(trimmed)) {
      const titleMatch = trimmed.match(/(?:create|add)\s+task\s+["']?([^"']+)["']?/i);
      const colMatch   = trimmed.match(/in\s+["']?([^"']+)["']?/i);
      const prioMatch  = trimmed.match(/priority\s+(low|medium|high)/i);
      const assignMatch = trimmed.match(/assigned?\s+to\s+([^\s]+)/i);

      const title = titleMatch ? titleMatch[1].trim() : 'New Slack Task';
      const column_name = colMatch ? colMatch[1].trim() : 'To Do';
      const priority = prioMatch ? prioMatch[1].toLowerCase() : 'medium';
      const assigned_to = assignMatch ? assignMatch[1] : null;

      const result = await this.tools.createTask({
        title,
        column_name,
        priority
      });

      if (assigned_to) {
        try {
          await this.tools.assignTask({ task_id: result.task.id, email: assigned_to, name: assigned_to });
        } catch (e) {
          // ignore if user resolution fails
        }
      }

      return `✅ *Task Created Successfully*\n• *ID*: #${result.task.id}\n• *Title*: ${result.task.title}\n• *Column*: ${result.column}\n• *Priority*: ${result.task.priority}`;
    }

    // 2. List Tasks Command
    // Example: "list tasks" or "list tasks in In Progress"
    if (/^list\s+tasks/i.test(trimmed) || /^show\s+tasks/i.test(trimmed) || /^tasks$/i.test(trimmed)) {
      const colMatch = trimmed.match(/(?:in|for)\s+["']?([^"']+)["']?/i);
      const column_name = colMatch ? colMatch[1].trim() : null;

      const result = await this.tools.listTasks({ column_name });

      let output = `📋 *Kanban Board: ${result.board}*\n\n`;
      for (const col of result.columns) {
        output += `*${col.column}* (${col.tasks.length})\n`;
        if (col.tasks.length === 0) {
          output += `  _(No tasks)_\n`;
        } else {
          for (const t of col.tasks) {
            output += `  • #${t.id} *${t.title}* [${t.priority}] (Assignee: ${t.assigned_to})\n`;
          }
        }
        output += `\n`;
      }
      return output.trim();
    }

    // 3. Move Task Command
    // Example: "move task 1 to Done"
    if (/^move\s+task/i.test(trimmed)) {
      const match = trimmed.match(/move\s+task\s+#?(\d+|[^\s]+)\s+to\s+["']?([^"']+)["']?/i);
      if (!match) {
        return `⚠️ *Usage*: \`move task <id> to <column_name>\``;
      }

      const task_id = match[1];
      const target_column_name = match[2].trim();

      const result = await this.tools.moveTask({ task_id, target_column_name });
      return `🚚 *Task Moved Successfully*\n• *Task ID*: #${task_id}\n• *Destination*: ${result.to_column}`;
    }

    // 4. Assign Task Command
    // Example: "assign task 1 to demo@forgekanban.com"
    if (/^assign\s+task/i.test(trimmed)) {
      const match = trimmed.match(/assign\s+task\s+#?(\d+|[^\s]+)\s+to\s+([^\s]+)/i);
      if (!match) {
        return `⚠️ *Usage*: \`assign task <id> to <email_or_name>\``;
      }

      const task_id = match[1];
      const assigneeStr = match[2].trim();

      const isEmail = assigneeStr.includes('@');
      const result = await this.tools.assignTask({
        task_id,
        email: isEmail ? assigneeStr : null,
        name: isEmail ? null : assigneeStr
      });

      return `👤 *Task Assigned Successfully*\n• *Task ID*: #${task_id}\n• *Assigned To*: ${result.task.assignee ? result.task.assignee.name : assigneeStr}`;
    }

    // Fallback help response
    return `🤖 *OpenClaw Kanban Agent Help*\n\nAvailable commands:\n• \`create task "Title" in "Column" priority high\`\n• \`list tasks\`\n• \`move task <id> to "Done"\`\n• \`assign task <id> to user@email.com\``;
  }
}

module.exports = OpenClawAgent;
