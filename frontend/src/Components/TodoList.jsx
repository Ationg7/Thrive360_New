import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Form, Modal, Card, Badge } from 'react-bootstrap';
import { Plus, CheckCircle, Circle, Trash2, Edit3 , BookOpen } from 'lucide-react';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 1
  });

  const loadTodos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://127.0.0.1:8000/api/todos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTodo = async () => {
    if (!formData.title.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      const url = editingTodo 
        ? `http://127.0.0.1:8000/api/todos/${editingTodo.id}`
        : 'http://127.0.0.1:8000/api/todos';
      
      const method = editingTodo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadTodos();
        setShowModal(false);
        setEditingTodo(null);
        setFormData({ title: '', description: '', priority: 1 });
      }
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://127.0.0.1:8000/api/todos/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadTodos();
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://127.0.0.1:8000/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadTodos();
      }
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
    loadTodos();
  }, []);

  return (
    <>

<Card className="mb-3 right-sidebar-card position-relative">
  <Card.Header className="d-flex justify-content-between align-items-center" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold' }}>
    <div className="d-flex align-items-center">
      <BookOpen size={20} className="me-2" />
      To Do List
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
          <div className="scrollable-wrapper">
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
          </div>
          // SCROLLABLE WRAPPER END
        )}
      </Card>

      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setEditingTodo(null);
        setFormData({ title: '', description: '', priority: 1 });
      }} centered>
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
