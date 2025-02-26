import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BaseEdge,
  getSmoothStepPath,
} from 'reactflow';
import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { PlayArrow, Save, WorkspacesOutlined, Close } from '@mui/icons-material';
import PropTypes from 'prop-types';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import Sidebar from './WorkFlowSidebar';
import { useParams } from 'react-router-dom';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [];
const initialEdges = [];

const EdgeWithDelete = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  sourcePosition,
  targetPosition,
  onEdgeDelete,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <button
        className="edge-delete-button"
        onClick={(event) => {
          event.stopPropagation();
          onEdgeDelete(id);
        }}
        style={{
          position: 'absolute',
          left: labelX,
          top: labelY,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Close fontSize="small" />
      </button>
    </>
  );
};

EdgeWithDelete.propTypes = {
  id: PropTypes.string.isRequired,
  sourceX: PropTypes.number.isRequired,
  sourceY: PropTypes.number.isRequired,
  targetX: PropTypes.number.isRequired,
  targetY: PropTypes.number.isRequired,
  style: PropTypes.object,
  markerEnd: PropTypes.string,
  sourcePosition: PropTypes.string.isRequired,
  targetPosition: PropTypes.string.isRequired,
  onEdgeDelete: PropTypes.func.isRequired,
};

export default function WorkflowEditor() {
  const { id } = useParams();
  const workflow = useState(() => {
    const savedWorkflows = JSON.parse(localStorage.getItem('workflows') || '[]');
    return savedWorkflows.find(w => w.id === parseInt(id)) || null;
  })[0];
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow?.nodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const executeAiScraper = async () => {
    console.log("Executing AI Scraper..."); // Debug log
    const businessType = prompt("Enter business type:");
    const location = prompt("Enter location:");

    if (!businessType || !location) {
      alert("Both fields are required!");
      return;
    }

    try {
      console.log(`Scraping for: ${businessType} in ${location}`);
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

  const onConnect = useCallback((params) => {
    console.log("New Connection:", params);
    
    const edge = {
      ...params,
      type: 'smoothstep',
      animated: true,
    };
    
    setEdges((eds) => {
      const updatedEdges = addEdge(edge, eds);
      console.log("Updated Edges:", updatedEdges);
      return updatedEdges;
    });
  }, [setEdges]);
  

  const onNodeDelete = useCallback((nodeId) => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
    setEdges((edges) => edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ));
  }, [setNodes, setEdges]);

  const onEdgeDelete = useCallback((edgeId) => {
    setEdges((edges) => edges.filter((edge) => edge.id !== edgeId));
  }, [setEdges]);

  const edgeTypes = useMemo(() => ({
    default: (props) => <EdgeWithDelete {...props} onEdgeDelete={onEdgeDelete} />,
  }), [onEdgeDelete]);

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
          onExecute: type.replace(/\s+/g, "").toLowerCase() === 'aiscraper' ? executeAiScraper : null, 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, onNodeDelete]
  );

  const isAiScraper = (node) => 
    node?.data.type.replace(/\s+/g, "").toLowerCase() === "aiscraper";

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

    console.log("Chatbot Node Found:", chatbotNode);

    // Check if Chatbot is DIRECTLY connected to AiScraper
    //const isAiScraper = (node) => node.data.type.replace(/\s+/g, "").toLowerCase().includes("aiscraper");

    edges.forEach((edge) => {
      console.log(`Checking edge: ${edge.source} -> ${edge.target}`);
      
      const sourceNode = nodes.find((node) => node.id === edge.source);
      const targetNode = nodes.find((node) => node.id === edge.target);

      if (sourceNode && targetNode) {
        console.log(`Source Node: ${sourceNode.data.type}, Target Node: ${targetNode.data.type}`);
      }
    if (
      (edge.source === chatbotNode.id || edge.target === chatbotNode.id) &&
      (isAiScraper(sourceNode) || isAiScraper(targetNode))
    ) {
      aiScraperConnected = true;
    }
  });

    if (!aiScraperConnected) {
      console.warn("Chatbot is not connected to AI Scraper!");
      return;
    }

    console.log("Chatbot is connected to AI Scraper! Running scraper...");
  
    // Execute AI Scraper
    nodes.forEach((node) => {
      if (isAiScraper(node)) {
        console.log("⚡ Executing AI Scraper...");
        if (typeof node.data.onExecute === "function") {
          node.data.onExecute(); // Run the function
        } else {
          console.error("❌ onExecute is not a function!", node);
          executeAiScraper(); // Fallback execution
        }
      }
    });
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
