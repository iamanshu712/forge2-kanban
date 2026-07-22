const axios = require('axios');

class KanbanTools {
  constructor(baseUrl, apiToken) {
    this.baseUrl = (baseUrl || 'http://127.0.0.1:8000').replace(/\/+$/, '') + '/api';
    this.apiToken = apiToken;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.apiToken}`
    };
  }

  async getContext() {
    const response = await axios.get(`${this.baseUrl}/agent/context`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createTask({ board_id, column_name, title, description, priority, due_date }) {
    const context = await this.getContext();
    const board = board_id 
      ? context.boards.find(b => b.id == board_id) 
      : context.boards[0];

    if (!board) throw new Error('No Kanban board found.');

    let column = board.columns.find(c => c.name.toLowerCase() === (column_name || 'to do').toLowerCase());
    if (!column) {
      column = board.columns[0];
    }

    if (!column) throw new Error(`Column "${column_name}" not found on board.`);

    const payload = {
      title,
      description: description || null,
      priority: priority || 'medium',
      due_date: due_date || null
    };

    const response = await axios.post(`${this.baseUrl}/columns/${column.id}/tasks`, payload, {
      headers: this.getHeaders()
    });

    return {
      task: response.data,
      board: board.name,
      column: column.name
    };
  }

  async listTasks({ board_id, column_name }) {
    const context = await this.getContext();
    const board = board_id 
      ? context.boards.find(b => b.id == board_id) 
      : context.boards[0];

    if (!board) throw new Error('No board found.');

    let columns = board.columns;
    if (column_name) {
      columns = columns.filter(c => c.name.toLowerCase() === column_name.toLowerCase());
    }

    const result = columns.map(col => ({
      column: col.name,
      tasks: col.tasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        assigned_to: t.assignee ? t.assignee.name : 'Unassigned'
      }))
    }));

    return { board: board.name, columns: result };
  }

  async moveTask({ task_id, target_column_name }) {
    const context = await this.getContext();
    let targetTask = null;
    let targetBoard = null;

    for (const board of context.boards) {
      for (const col of board.columns) {
        const found = col.tasks.find(t => t.id == task_id || t.title.toLowerCase().includes(String(task_id).toLowerCase()));
        if (found) {
          targetTask = found;
          targetBoard = board;
          break;
        }
      }
      if (targetTask) break;
    }

    if (!targetTask) throw new Error(`Task "${task_id}" not found.`);

    const destCol = targetBoard.columns.find(c => c.name.toLowerCase() === target_column_name.toLowerCase());
    if (!destCol) throw new Error(`Target column "${target_column_name}" not found.`);

    const payload = {
      column_id: destCol.id,
      position: destCol.tasks.length
    };

    const response = await axios.patch(`${this.baseUrl}/tasks/${targetTask.id}/move`, payload, {
      headers: this.getHeaders()
    });

    return {
      task: response.data,
      from_column: targetTask.column_id,
      to_column: destCol.name
    };
  }

  async assignTask({ task_id, email, name }) {
    const context = await this.getContext();
    let targetTask = null;

    for (const board of context.boards) {
      for (const col of board.columns) {
        const found = col.tasks.find(t => t.id == task_id || t.title.toLowerCase().includes(String(task_id).toLowerCase()));
        if (found) {
          targetTask = found;
          break;
        }
      }
      if (targetTask) break;
    }

    if (!targetTask) throw new Error(`Task "${task_id}" not found.`);

    const payload = {};
    if (email) payload.email = email;
    if (name) payload.name = name;

    const response = await axios.post(`${this.baseUrl}/tasks/${targetTask.id}/assign`, payload, {
      headers: this.getHeaders()
    });

    return response.data;
  }
}

module.exports = KanbanTools;
