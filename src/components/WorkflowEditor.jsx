import { useState, useCallback } from 'react';
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

  const onConnect = useCallback(
    (params) => {
      // Add edge with a smooth step type
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

  const edgeTypes = {
    default: (props) => <EdgeWithDelete {...props} onEdgeDelete={onEdgeDelete} />,
  };

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
          type,
          onDelete: onNodeDelete,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, onNodeDelete]
  );

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
            <Button startIcon={<PlayArrow />} variant="contained" color="primary">
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