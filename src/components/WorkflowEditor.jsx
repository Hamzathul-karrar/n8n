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
import Sidebar from './Sidebar';

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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

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

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        animated: true,
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

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
          onExecute: type === 'AiScraper' ? executeAiScraper : null, 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, onNodeDelete]
  );

  const runWorkflow = () => {
    console.log("Nodes in Workflow:", nodes);
    console.log("Edges in Workflow:", edges);
  
    let chatbotTriggered = false;
    let aiScraperConnected = false;
  
    // Find Chatbot node first
    const chatbotNode = nodes.find((node) => node.data.type.toLowerCase().includes("chatbot"));
  
    if (!chatbotNode) {
      console.warn("Chatbot node is not present, skipping execution.");
      return;
    }
  
    chatbotTriggered = true;
  
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
  };
  
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Workflow
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button startIcon={<WorkspacesOutlined />} variant="outlined">
              Workspace
            </Button>
            <Button startIcon={<Save />} variant="outlined">
              Save
            </Button>
            <Button startIcon={<PlayArrow />} variant="contained" color="primary" onClick={runWorkflow}>
              Run
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <div style={{ flex: 1 }}>
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
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
