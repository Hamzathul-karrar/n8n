import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import { AppBar, Toolbar, Typography, Button, Stack, Snackbar, Alert, Fab } from '@mui/material';
import { PlayArrow, Save, WorkspacesOutlined, Chat as ChatIcon } from '@mui/icons-material';
// import PropTypes from 'prop-types';
import 'reactflow/dist/style.css';
import 'reactflow/dist/base.css';
import '../styles/workflow.css';
import '../styles/reactflow.css';
import CustomNode from './CustomNode';
import Sidebar from './WorkFlowSidebar';
import { useParams, useNavigate } from 'react-router-dom';
import CustomEdge from './CustomEdge';
import Graph from '../utils/GraphUtils';
import ChatBox from './ChatBox';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [];
const initialEdges = [];

export default function WorkflowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeCallbacks, setNodeCallbacks] = useState({});
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const graphRef = useRef(Graph.fromEdges(initialEdges));
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    console.log("📡 Edges Updated: ", edges);
    graphRef.current = Graph.fromEdges(edges);
  }, [edges]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const executeAiScraper = useCallback(async (inputData) => {
    console.group('🤖 AI Scraper Execution');
    try {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      const aiScraperNode = currentNodes.find(n => n.data.type === "AI Scraper");
      if (!aiScraperNode) {
        throw new Error("AI Scraper node not found");
      }

      const connectedTrigger = currentEdges.find(edge => edge.target === aiScraperNode.id);
      if (!connectedTrigger) {
        throw new Error("No trigger connected to AI Scraper");
      }

      const triggerNode = currentNodes.find(node => node.id === connectedTrigger.source);
      if (!triggerNode) {
        throw new Error("Connected trigger node not found");
      }

      // Execute the node's registered handler
      await aiScraperNode.data.onExecute(inputData, nodeCallbacks);

    } catch (error) {
      console.error('AI Scraper Error:', error);
      setError(error.message);
      throw error;
    } finally {
      console.groupEnd();
    }
  }, [nodeCallbacks]);

  const onNodeDelete = useCallback((nodeId) => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
    setEdges((edges) => edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ));
  }, [setNodes, setEdges]);

  // Load workflow
  const [workflow] = useState(() => {
    const savedWorkflows = JSON.parse(localStorage.getItem('workflows') || '[]');
    const savedWorkflow = savedWorkflows.find(w => w.id === parseInt(id)) || null;
    
    // Reattach callbacks to saved nodes if they exist
    if (savedWorkflow?.nodes) {
      savedWorkflow.nodes = savedWorkflow.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onDelete: onNodeDelete,
        }
      }));
    }
    
    return savedWorkflow;
  });

  useEffect(() => {
    if (workflow?.nodes) {
      setNodes(workflow.nodes);
    }
    if (workflow?.edges) {
      setEdges(workflow.edges);
    }
  }, [workflow, setNodes, setEdges]);

  // Update graph when edges change
  useEffect(() => {
    const newGraph = Graph.fromEdges(edges);
    graphRef.current = newGraph;
  }, [edges]);

  const saveWorkflow = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!workflow?.id) {
        const error = new Error("No workflow ID found");
        console.warn(error.message);
        reject(error);
        return;
      }

      try {
        const savedWorkflows = JSON.parse(localStorage.getItem('workflows') || '[]');
        const workflowIndex = savedWorkflows.findIndex(w => w.id === workflow.id);

        const updatedWorkflow = {
          ...workflow,
          nodes: nodes,
          edges: edges,
          lastModified: new Date().toISOString()
        };

        if (workflowIndex !== -1) {
          savedWorkflows[workflowIndex] = updatedWorkflow;
        } else {
          savedWorkflows.push(updatedWorkflow);
        }

        localStorage.setItem('workflows', JSON.stringify(savedWorkflows));
        setSuccess('Workflow saved successfully');
        console.log('Workflow saved successfully');
        resolve(updatedWorkflow);
      } catch (error) {
        console.error('Error saving workflow:', error);
        setError('Failed to save workflow');
        reject(error);
      }
    });
  }, [workflow, nodes, edges]);

  const onConnect = useCallback((params) => {
    // Check if source node already has an outgoing connection
    const sourceHasConnection = edges.some(edge => edge.source === params.source);
    
    // Check if target node already has an incoming connection
    const targetHasConnection = edges.some(edge => edge.target === params.target);
    
    // Get the target node to check its type
    const targetNode = nodes.find(node => node.id === params.target);
    
    // Prevent incoming connections to Click Trigger
    if (targetNode?.data.type === "Click Trigger") {
      setError("Click Trigger node cannot have incoming connections");
      return;
    }
    
    if (sourceHasConnection) {
      setError("This node already has an outgoing connection");
      return;
    }

    if (targetHasConnection) {
      setError("This node already has an incoming connection");
      return;
    }

    console.log("🔗 New connection:", params);
    setEdges((eds) =>{
     const newEdges =  addEdge({
        ...params,
        type: 'custom',
        animated: true,
        style: { stroke: '#ff6d5a', strokeWidth: 2 }
      }, eds)
      console.log("🔄 Updated edges:", newEdges);
      return newEdges;
    });
  }, [edges, nodes, setEdges]);

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge,
  }), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const registerCallback = useCallback((nodeType, callback) => {
    console.log(`Registering callback for ${nodeType}:`, callback);
    setNodeCallbacks(prev => {
      const newCallbacks = {
        ...prev,
        [nodeType]: callback
      };
      console.log('Updated callbacks:', newCallbacks);
      return newCallbacks;
    });
  }, []);

  const getChatCallback = useCallback((nodeType) => {
    console.log(`Getting callback for ${nodeType}`, nodeCallbacks[nodeType]);
    return nodeCallbacks[nodeType];
  }, [nodeCallbacks]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = `node_${Date.now()}`;

      // Create base node data
      let nodeData = {
        label: type,
        type: type,
        onDelete: onNodeDelete,
        registerCallback: registerCallback,
        getChatCallback: getChatCallback,
      };

      // Add specific properties based on node type
      if (type === 'AI Scraper') {
        nodeData = {
          ...nodeData,
          registerExecute: (type, handler) => {
            nodeData.onExecute = handler;
          },
          checkConnections: () => {
            // Use the current edges and nodes from refs
            const currentEdges = edgesRef.current;
            const currentNodes = nodesRef.current;
            
            // Find edges where this node is the source
            const nodeEdges = currentEdges.filter(edge => edge.source === newNodeId);
            
            if (nodeEdges.length === 0) {
              return { type: 'none' };
            }

            // Check connections
            for (const edge of nodeEdges) {
              const targetNode = currentNodes.find(n => n.id === edge.target);
              if (!targetNode) continue;
              
              if (targetNode.data.type === 'Microsoft Excel') {
                return { type: 'excel' };
              }
              if (targetNode.data.type === 'Email') {
                // Get the email node's execute function
                const emailNode = currentNodes.find(n => n.id === edge.target);
                return { 
                  type: 'email',
                  emailHandler: emailNode?.data?.onExecute
                };
              }
            }

            return { type: 'none' };
          }
        };
      }

      const newNode = {
        id: newNodeId,
        type: 'custom',
        position,
        data: nodeData,
      };

      console.log('Creating new node:', newNode);
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, onNodeDelete, registerCallback, getChatCallback]
  );

  const handleWorkspaceClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const runWorkflow = useCallback(async () => {
    console.group('🚀 Running Workflow');
    
    try {
      const aiScraperNode = nodes.find(node => node.data.type === "AI Scraper");
      if (!aiScraperNode) {
        throw new Error("AI Scraper node not found");
      }

      const connectedTrigger = edges.find(edge => edge.target === aiScraperNode.id);
      if (!connectedTrigger) {
        throw new Error("No trigger connected to AI Scraper");
      }

      const triggerNode = nodes.find(node => node.id === connectedTrigger.source);
      if (!triggerNode) {
        throw new Error("Connected trigger node not found");
      }

      if (!aiScraperNode.data.onExecute) {
        throw new Error("AI Scraper node is not properly initialized");
      }

      let inputData = null;
      if (triggerNode.data.type === "Click Trigger") {
        inputData = await triggerNode.data.onExecute();
      } 
      // For Chat Trigger, we don't need input data as it will use the chat callback

      const result = await aiScraperNode.data.onExecute(inputData);
      console.log('Workflow execution result:', result);
      setSuccess('Workflow executed successfully');

    } catch (error) {
      console.error('Workflow Error:', error);
      setError(error.message || 'An error occurred while running the workflow');
    }
    console.groupEnd();
  }, [nodes, edges, setError, setSuccess]);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#1a1a1a'
    }}>
      <AppBar position="static" sx={{ backgroundColor: '#2a2a2a' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#fff' }}>
            {workflow ? workflow.projectName : 'My Workflow'}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button 
              startIcon={<WorkspacesOutlined />} 
              variant="outlined" 
              onClick={handleWorkspaceClick}
              sx={{ color: '#ff6d5a', borderColor: '#ff6d5a' }}
            >
              Workspace
            </Button>
            <Button 
              startIcon={<Save />} 
              variant="outlined"
              onClick={saveWorkflow}
              sx={{ color: '#ff6d5a', borderColor: '#ff6d5a' }}
            >
              Save
            </Button>
            <Button 
              startIcon={<PlayArrow />} 
              variant="contained" 
              color="primary"
              onClick={runWorkflow}
            >
              Run
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <div style={{ 
        display: 'flex', 
        flex: 1,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        height: 'calc(100vh - 64px)'
      }}>
        <Sidebar />
        <div style={{ flex: 1, position: 'relative', height: '100%' }}>
          <ReactFlow
            nodes={nodes.map(node => ({
              ...node,
              style: {
                ...node.style,
                ...(graphRef.current.processedPath?.includes(node.id) && {
                  border: '2px solid #ff6d5a',
                  boxShadow: '0 0 10px rgba(255, 109, 90, 0.5)'
                })
              }
            }))}
            edges={edges.map(edge => ({
              ...edge,
              style: {
                ...edge.style,
                ...(graphRef.current.processedPath?.includes(edge.source) && graphRef.current.processedPath.includes(edge.target) && {
                  stroke: '#ff6d5a',
                  strokeWidth: 3,
                  animation: 'flowAnimation 1s infinite'
                })
              }
            }))}
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange} 
            onConnect={onConnect} 
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes} 
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
            }}
            fitView
            style={{ background: '#1a1a1a' }}
          >
             <Controls 
              style={{ 
                button: { backgroundColor: '#2a2a2a', color: '#fff' },
                path: { fill: '#ff6d5a' }
              }} 
            />
            <MiniMap 
              style={{ 
                backgroundColor: '#2a2a2a',
                maskColor: '#1a1a1a'
              }} 
            />
          </ReactFlow>
        </div>
      </div>
      <Fab
        color="primary"
        aria-label="chat"
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: 10,
          top: 500,
          right: 20,
          bgcolor: '#ff6d5a',
          '&:hover': {
            bgcolor: '#ff8d7a',
          },
          zIndex: 1000,
        }}
      >
        <ChatIcon />
      </Fab>
      
      <ChatBox 
        open={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        nodes={nodes}
        edges={edges}
        workflow={{
          id: id,
          projectName: workflow?.projectName || 'Current Workflow',
          lastModified: workflow?.lastModified,
          nodes: nodes,
          edges: edges
        }}
      />
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={3000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="warning" 
          sx={{ 
            backgroundColor: '#2a2a2a',
            color: '#ff6d5a'
          }}
        >
          {error}
        </Alert>
      </Snackbar>
      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess(null)} 
          severity="success" 
          sx={{ 
            backgroundColor: '#2a2a2a',
            color: '#4caf50'
          }}
        >
          {success}
        </Alert>
      </Snackbar>
    </div>
  );
}
