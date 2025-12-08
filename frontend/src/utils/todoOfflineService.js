// Offline Todo Service using IndexedDB
// Stores todos locally and syncs with backend when online

const DB_NAME = 'Thrive360Todos';
const DB_VERSION = 1;
const STORE_NAME = 'todos';
const SYNC_QUEUE_STORE = 'syncQueue';

class TodoOfflineService {
  constructor() {
    this.db = null;
    this.syncInProgress = false;
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create todos store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const todoStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: false });
          todoStore.createIndex('user_id', 'user_id', { unique: false });
          todoStore.createIndex('is_completed', 'is_completed', { unique: false });
          todoStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Create sync queue store (for pending operations)
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const syncStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('operation', 'operation', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Check if online
  isOnline() {
    return navigator.onLine;
  }

  // Get all todos from IndexedDB
  async getAllTodos() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Get todos by user_id
  async getTodosByUserId(userId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('user_id');
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Clear todos for a specific user (when user logs out or switches)
  async clearTodosForUser(userId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('user_id');
      const request = index.openCursor(IDBKeyRange.only(userId));

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear sync queue (when user changes, clear all pending operations)
  async clearSyncQueue() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Save todo to IndexedDB
  async saveTodo(todo) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Add sync flag
      const todoWithSync = {
        ...todo,
        _synced: false,
        _lastModified: Date.now()
      };
      
      const request = store.put(todoWithSync);

      request.onsuccess = () => resolve(todoWithSync);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete todo from IndexedDB
  async deleteTodo(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Add operation to sync queue
  async addToSyncQueue(operation, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      
      const queueItem = {
        operation, // 'create', 'update', 'delete', 'toggle'
        data,
        timestamp: Date.now(),
        retries: 0
      };

      const request = store.add(queueItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get all pending sync operations
  async getSyncQueue() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_QUEUE_STORE], 'readonly');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove item from sync queue
  async removeFromSyncQueue(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync todos with backend
  async syncWithBackend(apiBaseUrl, authToken, userId) {
    if (!this.isOnline() || this.syncInProgress || !userId) {
      return { synced: false, message: 'Offline or sync in progress or no user' };
    }

    this.syncInProgress = true;
    const results = { synced: true, created: 0, updated: 0, deleted: 0, errors: [] };

    try {
      // 1. Fetch latest todos from backend (already filtered by user_id on server)
      const response = await fetch(`${apiBaseUrl}/todos`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const serverTodos = await response.json();
        
        // Get local todos for this user only
        const localTodos = await this.getTodosByUserId(userId);
        
        // Clear existing todos for this user and save server todos
        await this.clearTodosForUser(userId);
        for (const serverTodo of serverTodos) {
          await this.saveTodo({ ...serverTodo, _synced: true });
        }

        // Add local-only todos (created offline) to server
        for (const localTodo of localTodos) {
          if (!localTodo._synced && localTodo.id.toString().startsWith('local_')) {
            // This is a new todo created offline
            try {
              const createResponse = await fetch(`${apiBaseUrl}/todos`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  title: localTodo.title,
                  description: localTodo.description,
                  priority: localTodo.priority
                })
              });

              if (createResponse.ok) {
                const newTodo = await createResponse.json();
                // Delete old local todo and save server version
                await this.deleteTodo(localTodo.id);
                await this.saveTodo({ ...newTodo, _synced: true });
                results.created++;
              }
            } catch (error) {
              results.errors.push(`Failed to create todo: ${error.message}`);
            }
          }
        }
      }

      // 2. Process sync queue
      const syncQueue = await this.getSyncQueue();
      for (const queueItem of syncQueue) {
        try {
          const { operation, data } = queueItem;
          
          switch (operation) {
            case 'create':
              // Already handled above
              break;
            case 'update':
              const updateResponse = await fetch(`${apiBaseUrl}/todos/${data.id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  title: data.title,
                  description: data.description,
                  priority: data.priority,
                  is_completed: data.is_completed
                })
              });
              if (updateResponse.ok) {
                const updatedTodo = await updateResponse.json();
                await this.saveTodo({ ...updatedTodo, _synced: true });
                await this.removeFromSyncQueue(queueItem.id);
                results.updated++;
              }
              break;
            case 'delete':
              const deleteResponse = await fetch(`${apiBaseUrl}/todos/${data.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                }
              });
              if (deleteResponse.ok) {
                await this.removeFromSyncQueue(queueItem.id);
                results.deleted++;
              }
              break;
            case 'toggle':
              const toggleResponse = await fetch(`${apiBaseUrl}/todos/${data.id}/toggle`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                }
              });
              if (toggleResponse.ok) {
                const toggledTodo = await toggleResponse.json();
                await this.saveTodo({ ...toggledTodo, _synced: true });
                await this.removeFromSyncQueue(queueItem.id);
                results.updated++;
              }
              break;
          }
        } catch (error) {
          queueItem.retries++;
          if (queueItem.retries < 3) {
            // Keep in queue for retry
            results.errors.push(`Sync failed for ${operation}: ${error.message}`);
          } else {
            // Remove after max retries
            await this.removeFromSyncQueue(queueItem.id);
            results.errors.push(`Max retries reached for ${operation}`);
          }
        }
      }

      // 3. Final sync - get latest from server
      const finalResponse = await fetch(`${apiBaseUrl}/todos`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (finalResponse.ok) {
        const finalTodos = await finalResponse.json();
        // Clear existing todos for this user and repopulate with server data
        await this.clearTodosForUser(userId);
        
        for (const todo of finalTodos) {
          await this.saveTodo({ ...todo, _synced: true });
        }
      }

    } catch (error) {
      results.synced = false;
      results.errors.push(`Sync error: ${error.message}`);
    } finally {
      this.syncInProgress = false;
    }

    return results;
  }

  // Load todos (offline-first)
  async loadTodos(apiBaseUrl, authToken, userId) {
    if (!userId) return [];
    
    // Always load from IndexedDB first (instant) - filtered by user_id
    const localTodos = await this.getTodosByUserId(userId);
    
    // If online, sync in background
    if (this.isOnline()) {
      this.syncWithBackend(apiBaseUrl, authToken, userId).catch(err => {
        console.warn('Background sync failed:', err);
      });
    }

    // Return local todos immediately (remove internal fields)
    return localTodos.map(t => {
      const { _synced, _lastModified, ...todo } = t;
      return todo;
    });
  }
}

// Export singleton instance
export const todoOfflineService = new TodoOfflineService();

