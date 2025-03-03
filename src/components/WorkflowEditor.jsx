import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import { AppBar, Toolbar, Typography, Button, Stack, Snackbar, Alert } from '@mui/material';
import { PlayArrow, Save, WorkspacesOutlined } from '@mui/icons-material';
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
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const graphRef = useRef(Graph.fromEdges(initialEdges));
  const [nodeCallbacks, setNodeCallbacks] = useState({});

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

  const executeAiScraper = useCallback(async (businessType, location) => {
    try {
      console.log(`Executing AI Scraper for: ${businessType} in ${location}`);
      const response = await fetch(
        `http://localhost:8080/api/scrape?businessType=${businessType}&location=${location}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("📥 Raw Response:", responseText);
      
      // Create a structured response object
      let scrapedData;
      try {
        scrapedData = JSON.parse(responseText);
      } catch {
        // If not JSON, create a formatted response object
        scrapedData = {
          status: 'success',
          message: responseText,
          timestamp: new Date().toISOString()
        };
      }

      console.log('Processed Scraped Data:', scrapedData);
      setSuccess('Scraping completed successfully');
      return scrapedData;

    } catch (error) {
      console.error('Scraper Error:', error);
      setError('Failed to execute scraping');
      
      // Return structured error object
      const errorData = {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      throw errorData;
    }
  }, []);

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
    console.log(`Registering callback for ${nodeType}`, callback);
    setNodeCallbacks(prev => ({
      ...prev,
      [nodeType]: callback
    }));
  }, []);

  const getChatCallback = useCallback((nodeType) => {
    console.log(`Getting callback for ${nodeType}`, nodeCallbacks[nodeType]);
    return nodeCallbacks[nodeType];
  }, [nodeCallbacks]);

  const handleAiScraper = useCallback(async () => {
    try {
      // Get the chat callback
      const askQuestion = getChatCallback('ChatTrigger');
      if (!askQuestion) {
        throw new Error('Chat Trigger not connected or callback not registered');
      }

      // Ask questions through chat
      const businessType = await askQuestion('What type of business are you looking for?');
      if (!businessType) throw new Error('Business type is required');

      const location = await askQuestion('Where would you like to search?');
      if (!location) throw new Error('Location is required');

      // Execute the scraping
      return executeAiScraper(businessType, location);
    } catch (error) {
      console.error('AI Scraper Error:', error);
      throw error;
    }
  }, [getChatCallback, executeAiScraper]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Create node data based on type
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
          onExecute: handleAiScraper
        };
      }

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'custom',
        position,
        data: nodeData,
      };

      console.log('Creating new node:', newNode);
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, onNodeDelete, registerCallback, getChatCallback, handleAiScraper]
  );

  const handleWorkspaceClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // const runWorkflow = useCallback(async () => {
  //   console.group('🚀 Running Workflow');
    
  //   try {
  //     // Find Chat Trigger node
  //     const chatTriggerNode = nodes.find(node => 
  //       node.data.type === "Chat Trigger"
  //     );

  //     if (!chatTriggerNode) {
  //       throw new Error("Chat Trigger node not found");
  //     }

  //     // Find AI Scraper node
  //     const aiScraperNode = nodes.find(node => 
  //       node.data.type === "AI Scraper"
  //     );

  //     if (!aiScraperNode) {
  //       console.log("Available nodes:", nodes.map(n => ({ id: n.id, type: n.data.type })));
  //       throw new Error("AI Scraper node not found");
  //     }

  //     // Check if they're connected
  //     const isConnected = edges.some(edge => 
  //       (edge.source === chatTriggerNode.id && edge.target === aiScraperNode.id) ||
  //       (edge.source === aiScraperNode.id && edge.target === chatTriggerNode.id)
  //     );

  //     if (!isConnected) {
  //       throw new Error("Chat Trigger and AI Scraper must be connected");
  //     }

  //     console.log("Starting workflow execution...");
  //     console.log("Registered callbacks:", nodeCallbacks);

  //     // Execute the AI Scraper
  //     if (aiScraperNode.data.onExecute) {
  //       await aiScraperNode.data.onExecute();
  //     } else {
  //       throw new Error("AI Scraper node has no execute function");
  //     }

  //   } catch (error) {
  //     console.error('Workflow Error:', error);
  //     setError(error.message);
  //   }
  //   console.groupEnd();
  // }, [nodes, edges, nodeCallbacks]);
  const runWorkflow = useCallback(async () => {
    console.group('🚀 Running Workflow');
    
    try {
      // Find ClickTriggerNode or ChatTriggerNode
      const clickTriggerNode = nodes.find(node => node.data.type === "Click Trigger");
      const chatTriggerNode = nodes.find(node => node.data.type === "Chat Trigger");
  
      let inputData;
  
      // Use ClickTriggerNode if available
      if (clickTriggerNode) {
        inputData = await clickTriggerNode.data.onExecute();
        if (!inputData || !Array.isArray(inputData)) {
          throw new Error("Invalid input data from Click Trigger");
        }
        inputData = inputData[0]; // Use the first configuration
      }
      // Use ChatTriggerNode if ClickTriggerNode is not available
      else if (chatTriggerNode) {
        // No input data needed, as ChatTriggerNode will prompt the user
        inputData = null;
      } else {
        throw new Error("No trigger node (Click Trigger or Chat Trigger) found");
      }
  
      // Find AiScraperNode
      const aiScraperNode = nodes.find(node => node.data.type === "AI Scraper");
      if (!aiScraperNode) {
        throw new Error("AI Scraper node not found");
      }
  
      // Execute AiScraperNode with input data
      if (typeof aiScraperNode.data.onExecute === "function") {
        await aiScraperNode.data.onExecute(inputData);
      } else {
        throw new Error("AI Scraper node has no execute function");
      }
  
    } catch (error) {
      console.error('Workflow Error:', error);
      setError(error.message);
    }
    console.groupEnd();
  }, [nodes, edges]);

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
