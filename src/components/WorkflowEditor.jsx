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

  const handleAiScraper = useCallback(async (inputData) => {
    console.group('🤖 AI Scraper Execution');
    try {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      const aiScraperNode = currentNodes.find(n => n.data.type === "AI Scraper");
      if (!aiScraperNode) {
        throw new Error("AI Scraper node not found");
      }

      const connectedTrigger = currentEdges.find(edge => edge.target === aiScraperNode.id);
      console.log('Connected edges:', currentEdges);
      console.log('AI Scraper node:', aiScraperNode);
      console.log('Connected trigger:', connectedTrigger);

      if (!connectedTrigger) {
        throw new Error("No trigger connected to AI Scraper");
      }

      const triggerNode = currentNodes.find(node => node.id === connectedTrigger.source);
      if (!triggerNode) {
        throw new Error("Connected trigger node not found");
      }

      let businessType, location;

      if (triggerNode.data.type === "Click Trigger") {
        if (!inputData || !Array.isArray(inputData) || !inputData.length) {
          throw new Error("Invalid input from Click Trigger");
        }
        console.log('Using input from Click Trigger:', inputData[0]);
        businessType = inputData[0].businessType;
        location = inputData[0].location;
      } 
      else if (triggerNode.data.type === "Chat Trigger") {
        // Get the current callbacks state
        const currentCallbacks = nodeCallbacks;
        console.log('Current callbacks:', currentCallbacks);
        
        const chatCallback = currentCallbacks['ChatTrigger'];
        console.log('Chat callback:', chatCallback);
        
        if (!chatCallback) {
          throw new Error('Chat Trigger callback not registered');
        }

        console.log('Using Chat Trigger for input');
        businessType = await chatCallback('What type of business are you looking for?');
        if (!businessType) throw new Error('Business type is required');

        location = await chatCallback('Where would you like to search?');
        if (!location) throw new Error('Location is required');
      }
      else {
        throw new Error(`Unknown trigger type: ${triggerNode.data.type}`);
      }

      console.log(`Executing scraper with: ${businessType} in ${location}`);
      const result = await executeAiScraper(businessType, location);

      // Check if Excel node is connected and download if needed
      const excelNode = currentNodes.find(node => 
        node.data.type === "Microsoft Excel" && 
        currentEdges.some(edge => edge.source === aiScraperNode.id && edge.target === node.id)
      );

      if (excelNode) {
        console.log("📊 Excel node is connected, downloading data...");
        try {
          const response = await fetch('http://localhost:8080/api/excel/download', {
            method: 'GET',
          });

          if (!response.ok) {
            throw new Error('Failed to download Excel file');
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'scraped_data.xlsx';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          setSuccess('Excel file downloaded successfully');
        } catch (error) {
          console.error('Excel download error:', error);
          setError('Failed to download Excel file');
        }
      }

      return result;
    } catch (error) {
      console.error('AI Scraper Error:', error);
      setError(error.message);
      throw error;
    } finally {
      console.groupEnd();
    }
  }, [nodeCallbacks, executeAiScraper]);

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
          onExecute: handleAiScraper.bind(null) // Bind handleAiScraper properly
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

  const runWorkflow = useCallback(async () => {
    console.group('🚀 Running Workflow');
    
    try {
      const aiScraperNode = nodes.find(node => node.data.type === "AI Scraper");
      if (!aiScraperNode) {
        throw new Error("AI Scraper node not found");
      }

      const connectedTrigger = edges.find(edge => edge.target === aiScraperNode.id);
      console.log('Current edges:', edges);
      console.log('AI Scraper node:', aiScraperNode);
      console.log('Connected trigger:', connectedTrigger);

      if (!connectedTrigger) {
        throw new Error("No trigger connected to AI Scraper");
      }

      const triggerNode = nodes.find(node => node.id === connectedTrigger.source);
      if (!triggerNode) {
        throw new Error("Connected trigger node not found");
      }

      console.log("Connected trigger type:", triggerNode.data.type);
      console.log("Available callbacks:", nodeCallbacks);

      if (triggerNode.data.type === "Click Trigger") {
        const clickTriggerData = await triggerNode.data.onExecute();
        await aiScraperNode.data.onExecute(clickTriggerData);
      } 
      else if (triggerNode.data.type === "Chat Trigger") {
        await aiScraperNode.data.onExecute(null, nodeCallbacks);
      }
      else {
        throw new Error("Unknown trigger type");
      }

    } catch (error) {
      console.error('Workflow Error:', error);
      setError(error.message);
    }
    console.groupEnd();
  }, [nodes, edges, nodeCallbacks]);

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
