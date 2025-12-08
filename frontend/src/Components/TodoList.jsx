import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Form, Modal, Card, Badge } from 'react-bootstrap';
import { Plus, CheckCircle, Circle, Trash2, Edit3 , BookOpen, Wifi, WifiOff } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { todoOfflineService } from '../utils/todoOfflineService';
import { useAuth } from '../AuthContext';

const TodoList = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 1
  });

  const loadTodos = async () => {
    if (!user?.id) return; // Don't load if no user
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = API_ENDPOINTS.TODOS || `${API_BASE_URL}/todos`;
      
      // Load from IndexedDB first (offline-first approach) - filtered by user_id
      const localTodos = await todoOfflineService.loadTodos(apiUrl, token, user.id);
      setTodos(Array.isArray(localTodos) ? localTodos : []);
      
      // If online, sync will happen in background via loadTodos
    } catch (error) {
      console.error('Error loading todos:', error);
      // Even if there's an error, try to get local todos for this user
      try {
        const localTodos = await todoOfflineService.getTodosByUserId(user.id);
        setTodos(localTodos.map(t => {
          const { _synced, _lastModified, ...todo } = t;
          return todo;
        }));
      } catch (localError) {
        console.error('Error loading local todos:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveTodo = async () => {
    if (!formData.title.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = API_ENDPOINTS.TODOS || `${API_BASE_URL}/todos`;
      
      if (editingTodo) {
        // Update existing todo
        const updatedTodo = {
          ...editingTodo,
          user_id: user.id, // Ensure user_id is set
          title: formData.title,
          description: formData.description,
          priority: formData.priority
        };
        
        // Save to IndexedDB immediately
        await todoOfflineService.saveTodo(updatedTodo);
        
        // Add to sync queue
        await todoOfflineService.addToSyncQueue('update', updatedTodo);
        
        // If online, try to sync immediately
        if (todoOfflineService.isOnline()) {
          try {
            const response = await fetch(`${apiUrl}/${editingTodo.id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
            });
            
            if (response.ok) {
              const serverTodo = await response.json();
              await todoOfflineService.saveTodo({ ...serverTodo, _synced: true });
            }
          } catch (error) {
            console.warn('Failed to sync update, will retry later:', error);
          }
        }
      } else {
        // Create new todo
        const newTodo = {
          id: `local_${Date.now()}`, // Temporary local ID
          user_id: user.id, // Add user_id
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          is_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Save to IndexedDB immediately
        await todoOfflineService.saveTodo(newTodo);
        
        // Add to sync queue
        await todoOfflineService.addToSyncQueue('create', newTodo);
        
        // If online, try to sync immediately
        if (todoOfflineService.isOnline()) {
          try {
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
            });
            
            if (response.ok) {
              const serverTodo = await response.json();
              // Delete local version and save server version
              await todoOfflineService.deleteTodo(newTodo.id);
              await todoOfflineService.saveTodo({ ...serverTodo, _synced: true });
            }
          } catch (error) {
            console.warn('Failed to sync create, will retry later:', error);
          }
        }
      }
      
      // Reload todos to show updated list
      await loadTodos();
      setShowModal(false);
      setEditingTodo(null);
      setFormData({ title: '', description: '', priority: 1 });
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = API_ENDPOINTS.TODOS || `${API_BASE_URL}/todos`;
      
      // Find the todo in local state
      const todo = todos.find(t => t.id === id);
      if (!todo) return;
      
      // Update locally immediately
      const updatedTodo = {
        ...todo,
        is_completed: !todo.is_completed,
        updated_at: new Date().toISOString()
      };
      
      // Save to IndexedDB immediately
      await todoOfflineService.saveTodo(updatedTodo);
      
      // Add to sync queue
      await todoOfflineService.addToSyncQueue('toggle', updatedTodo);
      
      // If online, try to sync immediately
      if (todoOfflineService.isOnline()) {
        try {
          const response = await fetch(`${apiUrl}/${id}/toggle`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const serverTodo = await response.json();
            await todoOfflineService.saveTodo({ ...serverTodo, _synced: true });
          }
        } catch (error) {
          console.warn('Failed to sync toggle, will retry later:', error);
        }
      }
      
      // Update local state immediately for instant feedback
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      
      // Reload to ensure consistency
      await loadTodos();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = API_ENDPOINTS.TODOS || `${API_BASE_URL}/todos`;
      
      // Find the todo
      const todo = todos.find(t => t.id === id);
      
      // Delete from IndexedDB immediately
      await todoOfflineService.deleteTodo(id);
      
      // Add to sync queue
      if (todo) {
        await todoOfflineService.addToSyncQueue('delete', { id });
      }
      
      // If online, try to sync immediately
      if (todoOfflineService.isOnline()) {
        try {
          const response = await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            // Remove from sync queue if successful
            const syncQueue = await todoOfflineService.getSyncQueue();
            const queueItem = syncQueue.find(item => item.operation === 'delete' && item.data.id === id);
            if (queueItem) {
              await todoOfflineService.removeFromSyncQueue(queueItem.id);
            }
          }
        } catch (error) {
          console.warn('Failed to sync delete, will retry later:', error);
        }
      }
      
      // Update local state immediately
      setTodos(todos.filter(t => t.id !== id));
      
      // Reload to ensure consistency
      await loadTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const editTodo = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority
    });
    setShowModal(true);
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 3: return 'danger';
      case 2: return 'warning';
      default: return 'secondary';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 3: return 'High';
      case 2: return 'Medium';
      default: return 'Low';
    }
  };

  useEffect(() => {
    if (!user?.id) {
      // Clear todos when user logs out
      setTodos([]);
      return;
    }
    
    // Initialize offline service and load todos for current user
    todoOfflineService.init().then(() => {
      loadTodos();
    });
    
    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      const token = localStorage.getItem('authToken');
      const apiUrl = API_ENDPOINTS.TODOS || `${API_BASE_URL}/todos`;
      todoOfflineService.syncWithBackend(apiUrl, token, user.id).then(() => {
        loadTodos();
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Periodic status check for badge (updates every 1 second for quick response)
    const statusCheckInterval = setInterval(() => {
      const currentStatus = navigator.onLine;
      setIsOnline(prevStatus => {
        // Only update if status actually changed to avoid unnecessary re-renders
        if (prevStatus !== currentStatus) {
          return currentStatus;
        }
        return prevStatus;
      });
    }, 1000); // Check every 1 second
    
    // Periodic sync check when online
    const syncInterval = setInterval(() => {
      if (todoOfflineService.isOnline() && user?.id) {
        const token = localStorage.getItem('authToken');
        const apiUrl = API_ENDPOINTS.TODOS || `${API_BASE_URL}/todos`;
        todoOfflineService.syncWithBackend(apiUrl, token, user.id).then(() => {
          loadTodos();
        });
      }
    }, 30000); // Sync every 30 seconds when online
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(statusCheckInterval);
      clearInterval(syncInterval);
    };
  }, [user?.id]); // Re-run when user changes

  return (
    <>

<Card className="mb-3 right-sidebar-card position-relative">
  <Card.Header className="d-flex justify-content-between align-items-center" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold' }}>
    <div className="d-flex align-items-center">
      <BookOpen size={20} className="me-2" />
      To Do List
      <Badge 
        bg={isOnline ? 'success' : 'secondary'} 
        className="ms-2 d-flex align-items-center"
        style={{ fontSize: '0.7rem', padding: '2px 6px' }}
      >
        {isOnline ? (
          <>
            <Wifi size={12} className="me-1" />
            Online
          </>
        ) : (
          <>
            <WifiOff size={12} className="me-1" />
            Offline
          </>
        )}
      </Badge>
    </div>
    <Button className="plus-button" onClick={() => setShowModal(true)}>
      <Plus size={16} />
    </Button>
  </Card.Header>
  <hr className="my-0" />

        {loading ? (
          <div className="p-3 text-center">Loading...</div>
        ) : (
          // SCROLLABLE WRAPPER START
         
            <ListGroup variant="flush">
              {todos.map((todo) => (
                <ListGroup.Item 
                  key={todo.id} 
                  className="d-flex justify-content-between align-items-center recent-activity-item"
                >
                  <div className="d-flex align-items-center flex-grow-1">
                    <Button
                      variant="link"
                      className="p-0 me-2"
                      onClick={() => toggleTodo(todo.id)}
                    >
                      {todo.is_completed ? (
                        <CheckCircle size={20} className="text-success" />
                      ) : (
                        <Circle size={20} className="text-muted" />
                      )}
                    </Button>
                    
                    <div className="flex-grow-1">
                      <div className={`${todo.is_completed ? 'text-decoration-line-through text-muted' : ''}`}>
                        {todo.title}
                      </div>
                      {todo.description && (
                        <small className="text-muted">{todo.description}</small>
                      )}
                      <div className="d-flex align-items-center mt-1">
                        <Badge bg={getPriorityVariant(todo.priority)} size="sm" className="me-2">
                          {getPriorityText(todo.priority)}
                        </Badge>
                        <small className="text-muted">
                          {new Date(todo.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex">
                    <Button
                      variant="link"
                      size="sm"
                      className="p-1 me-1"
                      onClick={() => editTodo(todo)}
                    >
                      <Edit3 size={14} />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-1 text-danger"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
              
              {todos.length === 0 && (
                <ListGroup.Item className="text-center text-muted">
                  No todos yet. Add one to get started!
                </ListGroup.Item>
              )}
            </ListGroup>
        
          // SCROLLABLE WRAPPER END
        )}
      </Card>

      <Modal 
        show={showModal} 
        onHide={() => {
          setShowModal(false);
          setEditingTodo(null);
          setFormData({ title: '', description: '', priority: 1 });
        }} 
        centered
        className="todo-modal-mobile"
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingTodo ? 'Edit Todo' : 'Add New Todo'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter todo title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              >
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModal(false);
            setEditingTodo(null);
            setFormData({ title: '', description: '', priority: 1 });
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveTodo}>
            {editingTodo ? 'Update' : 'Add'} Todo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* HIDDEN SCROLLBAR STYLES */}
      <style>{`
        .scrollable-wrapper {
  max-height: 400px;
  overflow-y: auto;

  /* Firefox */
  scrollbar-width: thin;  /* makes it thin */
  scrollbar-color: lightgrey transparent; /* track and thumb colors */
}

/* Chrome, Safari, Edge */
.scrollable-wrapper::-webkit-scrollbar {
  width: 8px; /* thin scrollbar */
}

.scrollable-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0); /* hidden by default */
  border-radius: 4px;
  transition: background-color 0.3s;
}

/* Show scrollbar on hover */
.scrollable-wrapper:hover::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.3);
}

      `}</style>
    </>
  );
};

export default TodoList;