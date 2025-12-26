type UndoAction = {
  type: 'delete';
  collection: string;
  items: any[];
  timestamp: number;
};

class UndoManager {
  private actions: UndoAction[] = [];
  private maxHistory = 10;

  addDeleteAction(collection: string, items: any[]) {
    this.actions.push({
      type: 'delete',
      collection,
      items,
      timestamp: Date.now(),
    });

    // Keep only last N actions
    if (this.actions.length > this.maxHistory) {
      this.actions.shift();
    }
  }

  getLastAction(): UndoAction | null {
    return this.actions[this.actions.length - 1] || null;
  }

  removeLastAction() {
    this.actions.pop();
  }

  clear() {
    this.actions = [];
  }
}

export const undoManager = new UndoManager();
