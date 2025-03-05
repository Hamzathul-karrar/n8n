import PropTypes from 'prop-types';
import HttpRequestNode from './nodes/HttpRequestNode';
import ClickTriggerNode from './nodes/ClickTriggerNode';
import CodeNode from './nodes/CodeNode';
import ChatBotNode from './nodes/ChatBotNode';
import ChatTriggerNode from './nodes/ChatTriggerNode';
import ExcelNode from './nodes/ExcelNode';
import AiScraperNode from './nodes/AiScraperNode';
import EmailNode from './nodes/EmailNode';
import { useReactFlow } from 'reactflow';

export default function CustomNode({ data, id }) {
  const { getEdges, getNodes } = useReactFlow();

  const isConnectedToAiScraper = (nodeId) => {
    const edges = getEdges();
    const nodes = getNodes();
    
    return edges.some(edge => {
      const connectedNode = nodes.find(n => 
        (edge.source === nodeId && n.id === edge.target) || 
        (edge.target === nodeId && n.id === edge.source)
      );
      return connectedNode?.data?.type === 'AI Scraper';
    });
  };

  const renderNode = () => {
    switch (data.type) {
      case "HTTP Request":
        return <HttpRequestNode data={data} id={id} />;
      case "Click Trigger":
        return <ClickTriggerNode data={data} id={id} />;
      case "Code":
        return <CodeNode data={data} id={id} />;
      case "Chat Bot":
        return <ChatBotNode data={data} id={id} />;
      case "Chat Trigger":
        return (
          <ChatTriggerNode 
            data={{
              ...data,
              onExecuteAiScraper: data.onExecuteAiScraper
            }} 
            id={id}
            isConnectedToAiScraper={isConnectedToAiScraper(id)}
          />
        );
      case "Microsoft Excel":
        return <ExcelNode data={data} id={id} />;
      case "AI Scraper":
        return <AiScraperNode data={data} id={id} />;
      case "Email":
        return <EmailNode data={data} id={id} />;
      default:
        return null;
    }
  };

  return renderNode();
}

CustomNode.propTypes = {
  data: PropTypes.shape({ 
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onExecuteAiScraper: PropTypes.func,
  }).isRequired,
  id: PropTypes.string.isRequired,
};
