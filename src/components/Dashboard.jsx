import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import '../styles/dashboard.css';
import { useNavigate } from "react-router-dom";

const Dashboard = ({ section }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [workflows, setWorkflows] = useState(() => {
    const savedWorkflows = localStorage.getItem('workflows');
    return savedWorkflows ? JSON.parse(savedWorkflows) : [];
  });
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    projectName: '',
    description: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation
  const [workflowToDelete, setWorkflowToDelete] = useState(null); // ID of the workflow to delete
  
  const deleteConfirmRef = useRef(null); // Create a ref for the delete confirmation
  const navigate = useNavigate();

  // Save workflows to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('workflows', JSON.stringify(workflows));
  }, [workflows]);

  // Close delete confirmation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteConfirmRef.current && !deleteConfirmRef.current.contains(event.target)) {
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper function to format relative time
  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days} days ago`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const now = new Date();
    const newWorkflow = {
      ...formData,
      id: Date.now(),
      createdAt: now.toISOString(),
      displayCreatedAt: now.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long'
      }),
      lastUpdatedAt: now.toISOString(),
      lastUpdated: 'today'
    };
    
    setWorkflows([newWorkflow, ...workflows]);
    setShowCreateForm(false);
    setFormData({ projectName: '', description: '' });
    
    // Navigate to the workflow editor
    navigate(`/workflow/${newWorkflow.id}`);
  };

  // Update the relative times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkflows((currentWorkflows) => 
        currentWorkflows.map(workflow => ({
          ...workflow,
          lastUpdated: getRelativeTime(workflow.lastUpdatedAt)
        }))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, [workflows]); // Added `workflows` to dependency array

  const handleSort = (order) => {
    setSortOrder(order);
    const sortedWorkflows = [...workflows].sort((a, b) => {
      const dateA = new Date(order === 'newest' ? a.lastUpdatedAt : a.createdAt);
      const dateB = new Date(order === 'newest' ? b.lastUpdatedAt : b.createdAt);
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
    setWorkflows(sortedWorkflows);
    setShowSortDropdown(false);
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const searchLower = searchQuery.toLowerCase();
    return (
      workflow.projectName.toLowerCase().includes(searchLower) ||
      workflow.description.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = (id) => {
    setWorkflows(workflows.filter(workflow => workflow.id !== id));
    setShowDeleteConfirm(false);
    setWorkflowToDelete(null);
  };

  const handleWorkflowClick = (workflowId) => {
    navigate(`/workflow/${workflowId}`);
  };

  return (
    <div className="main-content">
      <div className="top-status-bar">
        <div className="status-content">
          
        </div>
      </div>
      
      {section === "overview" && (
        <div className="overview-container">
          <div className="overview-header">
            <div className="header-left">
              <h1>Overview</h1>
              <p className="subtitle">All the workflows you have access to</p>
            </div>
            <button 
              className="create-workflow-btn"
              onClick={() => setShowCreateForm(true)}
            >
              Create Workflow
            </button>
          </div>
          
          {showCreateForm && (
            <div className="popup-overlay" onClick={(e) => {
              if (e.target.classList.contains('popup-overlay')) { // Fixed class check
                setShowCreateForm(false);
              }
            }}>
              <div className="create-workflow-popup">
                <h2>Create Workflow</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-field">
                    <label>Project Name</label>
                    <input
                      type="text"
                      value={formData.projectName}
                      onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Enter project description"
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowCreateForm(false)} className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="tab-navigation">
            <button className="tab-btn active">Workflows</button>
          </div>

          <div className="search-bar">
            <div className="search-input-container">
              <input 
                type="text" 
                placeholder="Search workflows..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="sort-dropdown">
              <button onClick={() => setShowSortDropdown(!showSortDropdown)}>
                Sort by last updated ▼
              </button>
              {showSortDropdown && (
                <div className="sort-menu">
                  <button 
                    className={sortOrder === 'newest' ? 'active' : ''} 
                    onClick={() => handleSort('newest')}
                  >
                    Newest first
                  </button>
                  <button 
                    className={sortOrder === 'oldest' ? 'active' : ''} 
                    onClick={() => handleSort('oldest')}
                  >
                    Oldest first
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="workflows-list">
            {filteredWorkflows.length > 0 ? (
              filteredWorkflows.map((workflow) => (
                <div 
                  key={workflow.id} 
                  className="workflow-item"
                  onClick={() => handleWorkflowClick(workflow.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="workflow-info">
                    <h3>{workflow.projectName}</h3>
                    <p>
                      Last updated {workflow.lastUpdated} | Created {workflow.displayCreatedAt}
                    </p>
                  </div>
                  <div className="workflow-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown">
                      <button 
                        onClick={() => {
                          setShowDeleteConfirm(!showDeleteConfirm);
                          setWorkflowToDelete(workflow.id);
                        }} 
                        className="more-btn"
                      >
                        ⋮
                      </button>
                      {showDeleteConfirm && workflowToDelete === workflow.id && (
                        <div className="delete-confirmation" ref={deleteConfirmRef}>
                          <button onClick={() => handleDelete(workflow.id)} className="delete-btn">Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : searchQuery ? (
              <div className="no-results">No workflows found matching &ldquo;{searchQuery}&rdquo;</div>
            ) : null}
          </div>
        </div>
      )}

      {section === "admin" && (
        <div className="dashboard-content">
          <h2>Admin Panel</h2>
        </div>
      )}
    </div>
  );
};

Dashboard.propTypes = {
  section: PropTypes.oneOf(["overview", "admin"]).isRequired,
};

export default Dashboard;
