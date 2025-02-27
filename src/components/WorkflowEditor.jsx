import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
import { useParams, useNavigate } from 'react-router-dom';
import CustomEdge from './CustomEdge';

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

  useEffect(() => {
    console.log("📡 Edges Updated: ", edges);
}, [edges]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const isExcelNode = (node) => node?.data?.type?.replace(/\s+/g, "").toLowerCase() === "microsoftexcel";
  const isAiScraper = (node) => node?.data?.type?.replace(/\s+/g, "").toLowerCase() === "aiscraper";

  // const isExcelConnected = () => {
  //   console.log("🔗 Edges:", edges);
  //   return edges.some(edge => {
  //     const sourceNode = nodes.find(node => node.id === edge.source);
  //     const targetNode = nodes.find(node => node.id === edge.target);
  //     if (!sourceNode || !targetNode) {
  //       console.warn(`⚠️ Node not found for edge: ${edge.source} -> ${edge.target}`);
  //       return false;
  //   }
  //   console.log(`Edge: ${edge.source} -> ${edge.target}`);
  //   console.log("Source Node:", sourceNode?.data);
  //   console.log("Target Node:", targetNode?.data);
  //   return isAiScraper(sourceNode) && isExcelNode(targetNode);
  //   });
  function isExcelConnected(edges = [], nodes = []) {
    if (!edges || !nodes || edges.length === 0 || nodes.length === 0) {
        console.log("❌ No edges or nodes found!");
        return false;
    }

    console.log("🔍 Checking Excel connection with:", {
        edgesCount: edges.length,
        nodesCount: nodes.length
    });

    const excelNode = nodes.find(node => isExcelNode(node));
    if (!excelNode) {
        console.log("❌ No Microsoft Excel node found!");
        return false;
    }

    const isConnected = edges.some(edge => {
        const sourceNode = nodes.find(node => node.id === edge.source);
        return sourceNode && isAiScraper(sourceNode) && edge.target === excelNode.id;
    });

    console.log(`🛠️ isExcelConnected() returned: ${isConnected}`);
    return isConnected;
}



  const onNodeDelete = useCallback((nodeId) => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
    setEdges((edges) => edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ));
  }, [setNodes, setEdges]);

  const executeAiScraper = useCallback(async () => {
    console.log("Executing AI Scraper...");
    // Get the current state from refs
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    
    console.log("Initial state check:", {
        nodes: currentNodes,
        edges: currentEdges
    });
    
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

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        // Remove these lines as they're creating empty arrays
        // const currentNodes = [...nodes];
        // const currentEdges = [...edges];
        
        let data;
        const responseText = await response.text();
        console.log("📥 Raw Response:", responseText);
        try {
            data = JSON.parse(responseText);
        } catch (error) {
            console.warn("Response is not valid JSON. Treating as plain text.");
            data = { message: responseText };
        }

        console.log('Scraped Data:', data);
        // Use the refs here instead of the empty arrays
        console.log("Current Edges:", nodesRef.current, edgesRef.current);  
        const isConnected = isExcelConnected(edgesRef.current, nodesRef.current);
        if (isConnected) {
            console.log("Excel Node is connected. Storing data in Excel...");
            await exportDataToExcel();
        } else {
            console.log("Excel Node is NOT connected. Skipping Excel storage.");
        }
    } catch (error) {
        console.error('Scraper Error:', error);
    }
}, []); // No dependencies needed since we're using refs
// // ✅ Function to check if AI Scraper is connected to Excel
// const isExcelConnected = () => {
//   return edges.some(edge => {
//     const sourceNode = nodes.find(node => node.id === edge.source);
//     const targetNode = nodes.find(node => node.id === edge.target);
//     console.log(`Checking Edge: ${edge.source} -> ${edge.target}`); 
//     return isAiScraper(sourceNode) && isExcelNode(targetNode);
//   });
// };

//const isExcelNode = (node) => node?.data.type.replace(/\s+/g, "").toLowerCase() === "microsoftexcel";

// ✅ Function to send data to backend for Excel storage
const exportDataToExcel = async () => {
    console.log("Excel Connection Check:", isExcelConnected(edgesRef.current, nodesRef.current));

    try {
        const response = await fetch("http://localhost:8080/api/exportExcel", {
            method: "GET",
            headers: { "Content-Type": "application/octet-stream" },
        });

        if (!response.ok) {
            throw new Error(`Failed to store data in Excel: ${response.status}`);
        }
 // ✅ Convert Response to Blob and Trigger Download
 const blob = await response.blob();
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = "scraped_data.xlsx";
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);

    console.log("📂 Data successfully Downloaded");
    } catch (error) {
        console.error("Excel Storage Error:", error.message);
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
          //onExecute: node.data.type === 'AiScraper' ? executeAiScraper : null,
          onExecute: isAiScraper(node) ? executeAiScraper : null,
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
          onExecute: type.replace(/\s+/g, "").toLowerCase() === 'aiscraper' ? executeAiScraper : null, 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, onNodeDelete]
  );

  

  const runWorkflow = useCallback(() => {
    // Use the refs to ensure we have the latest state
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    
    console.log("Running workflow with:", {
        nodes: currentNodes,
        edges: currentEdges
    });

    const chatbotNode = currentNodes.find((node) => node.data.type.toLowerCase().includes("chatbot"));
    if (!chatbotNode) {
        console.warn("Chatbot node is not present, skipping execution.");
        return;
    }
    let aiScraperConnected = false;
    let aiScraperNode = null;

    console.log("Chatbot Node Found:", chatbotNode);

    currentEdges.forEach((edge) => {
        console.log(`Checking edge: ${edge.source} -> ${edge.target}`);
        
        const sourceNode = currentNodes.find((node) => node.id === edge.source);
        const targetNode = currentNodes.find((node) => node.id === edge.target);

        if (
            (sourceNode?.id === chatbotNode.id && isAiScraper(targetNode)) ||
            (targetNode?.id === chatbotNode.id && isAiScraper(sourceNode))
        ) {
            aiScraperConnected = true;
            aiScraperNode = isAiScraper(sourceNode) ? sourceNode : targetNode;
        }
    });

    if (!aiScraperConnected) {
        console.warn("Chatbot is not connected to AI Scraper!");
        return;
    }

    console.log("Chatbot is connected to AI Scraper! Running scraper...");

    // Execute AI Scraper
    currentNodes.forEach((node) => {
        if (isAiScraper(node)) {
            console.log("⚡ Executing AI Scraper...");
            if (typeof node.data.onExecute === "function") {
                node.data.onExecute();
            } else {
                console.error("❌ onExecute is not a function!", node);
                executeAiScraper();
            }
        }
    });
}, [executeAiScraper]); // Only depend on executeAiScraper


  const handleWorkspaceClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    console.log("Nodes state updated:", nodes);
  }, [nodes]);

  useEffect(() => {
    console.log("Edges state updated:", edges);
  }, [edges]);

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
