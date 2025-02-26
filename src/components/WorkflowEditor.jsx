import { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
 
} from 'reactflow';
import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { PlayArrow, Save, WorkspacesOutlined } from '@mui/icons-material';
// import PropTypes from 'prop-types';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import Sidebar from './WorkFlowSidebar';
import { useParams } from 'react-router-dom';
import CustomEdge from './CustomEdge';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [];
const initialEdges = [];

export default function WorkflowEditor() {
  const { id } = useParams();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeDelete = useCallback((nodeId) => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
    setEdges((edges) => edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ));
  }, [setNodes, setEdges]);

  const executeAiScraper = async () => {
    const businessType = prompt("Enter business type:");
    const location = prompt("Enter location:");

    if (!businessType || !location) {
      alert("Both fields are required!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/scrape?businessType=${businessType}&location=${location}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.text();
      console.log('Scraped Data:', data);
    } catch (error) {
      console.error('Scraper Error:', error);
    }
  };

  // Load workflow after function definitions
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
          onExecute: node.data.type === 'AiScraper' ? executeAiScraper : null,
        }
      }));
    }
    
    return savedWorkflow;
  });

  // Update nodes and edges with saved workflow data
  useEffect(() => {
    if (workflow?.nodes) {
      setNodes(workflow.nodes);
    }
    if (workflow?.edges) {
      setEdges(workflow.edges);
    }
  }, [workflow, setNodes, setEdges]);

  const saveWorkflow = useCallback(() => {
    if (!workflow?.id) {
      console.warn("No workflow ID found");
      return;
    }

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
    console.log('Workflow saved successfully');
  }, [workflow, nodes, edges]);

  const onConnect = useCallback((params) => {
    setEdges((eds) =>
      addEdge({
        ...params,
        type: 'custom',
        animated: true,
        style: { stroke: '#ff6d5a', strokeWidth: 2 }
      }, eds)
    );
  }, [setEdges]);

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge,
  }), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'custom',
        position,
        data: { 
          label: type, 
          type: type === "Chatbot Trigger" ? "Chatbot" : type,
          onDelete: onNodeDelete,
          onExecute: type === 'AiScraper' ? executeAiScraper : null, 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, onNodeDelete]
  );

  const runWorkflow = useCallback(() => {
    console.log("Nodes in Workflow:", nodes);
    console.log("Edges in Workflow:", edges);

    let aiScraperConnected = false;
  
    // Find Chatbot node first
    const chatbotNode = nodes.find((node) => node.data.type.toLowerCase().includes("chatbot"));
  
    if (!chatbotNode) {
      console.warn("Chatbot node is not present, skipping execution.");
      return;
    }

    // Check if Chatbot is DIRECTLY connected to AiScraper
    edges.forEach((edge) => {
      if (
        (edge.source === chatbotNode.id || edge.target === chatbotNode.id) &&
        nodes.some((node) => (node.id === edge.source || node.id === edge.target) && node.data.type === "AiScraper")
      ) {
        aiScraperConnected = true;
      }
    });
  
    if (!aiScraperConnected) {
      console.warn("Chatbot is not connected to AI Scraper!");
      return;
    }
  
    // Execute AI Scraper
    nodes.forEach((node) => {
      if (node.data.type === "AiScraper" && node.data.onExecute) {
        node.data.onExecute();
      }
    });
  });

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
      backgroundColor: '#1a1a1a'  // Dark background
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
        overflow: 'hidden'  // Prevent scrolling
      }}>
        <Sidebar />
        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
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
            style={{ background: '#1a1a1a' }}  // Dark background
          >
            <Background color="#333" />
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
    </div>
  );
}
