import { useState, useEffect, useMemo, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
  Panel,
  ConnectionLineType,
} from 'reactflow';
import { useServices } from '@/hooks/use-services';
import { type Service, type Relationship } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, ZoomIn, ZoomOut } from 'lucide-react';
import 'reactflow/dist/style.css';

// Custom node component for services
const ServiceNode = ({ data }: { data: any }) => {
  return (
    <Card className="service-node p-3 border-2 min-w-[200px] shadow-md">
      <div className="text-center">
        <h3 className="font-semibold text-lg">{data.label}</h3>
        <div className="text-xs text-gray-500 mt-1">
          {data.language}, {data.buildSystem}
        </div>
        <div className="text-xs mt-2 grid grid-cols-2 gap-1">
          {data.dependencies.slice(0, 4).map((dep: string, index: number) => (
            <div key={index} className="bg-gray-100 rounded px-1 py-0.5 truncate">
              {dep}
            </div>
          ))}
          {data.dependencies.length > 4 && (
            <div className="bg-gray-100 rounded px-1 py-0.5">
              +{data.dependencies.length - 4} more
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Define node types
const nodeTypes: NodeTypes = {
  service: ServiceNode,
};

export default function ArchitectureVisualization() {
  const { services } = useServices();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedLayout, setSelectedLayout] = useState<'horizontal' | 'vertical' | 'circular'>('horizontal');

  // Convert services to nodes
  const generateNodes = useCallback((services: Service[], layout: string) => {
    return services.map((service, index) => {
      let position = { x: 0, y: 0 };

      // Calculate position based on layout
      if (layout === 'horizontal') {
        position = { x: index * 300, y: 100 };
      } else if (layout === 'vertical') {
        position = { x: 300, y: index * 200 };
      } else if (layout === 'circular') {
        const radius = Math.max(300, services.length * 50);
        const angle = (index / services.length) * 2 * Math.PI;
        position = {
          x: radius * Math.cos(angle) + 500,
          y: radius * Math.sin(angle) + 300,
        };
      }

      // Create node
      return {
        id: service.id.toString(),
        type: 'service',
        position,
        data: {
          label: service.name,
          language: service.language,
          buildSystem: service.buildSystem,
          dependencies: service.dependencies,
        },
      };
    });
  }, []);

  // Convert relationships to edges
  const generateEdges = useCallback((services: Service[]) => {
    const edges: Edge[] = [];

    services.forEach(service => {
      if (service.relationships && service.relationships.length > 0) {
        service.relationships.forEach((rel: Relationship) => {
          // Create edge
          edges.push({
            id: `e${rel.sourceServiceId}-${rel.targetServiceId}`,
            source: rel.sourceServiceId.toString(),
            target: rel.targetServiceId.toString(),
            animated: true,
            label: rel.communicationType,
            type: 'smoothstep',
            style: {
              strokeWidth: 2,
              stroke: getRelationshipColor(rel.communicationType),
            },
          });
        });
      }
    });

    return edges;
  }, []);

  // Helper to get color based on communication type
  const getRelationshipColor = (communicationType: string) => {
    switch (communicationType) {
      case 'REST':
        return '#3b82f6'; // blue
      case 'Message':
        return '#10b981'; // green
      case 'gRPC':
        return '#8b5cf6'; // purple
      default:
        return '#6b7280'; // gray
    }
  };

  // Update nodes and edges when services change or layout changes
  useEffect(() => {
    if (services) {
      setNodes(generateNodes(services, selectedLayout));
      setEdges(generateEdges(services));
    }
  }, [services, selectedLayout, generateNodes, generateEdges, setNodes, setEdges]);

  // Download the architecture diagram as an image
  const downloadAsPNG = () => {
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use html2canvas or similar approach (simplified here)
    alert('Download functionality will be implemented with a proper library like html2canvas.');
  };

  // Change layout
  const changeLayout = (layout: 'horizontal' | 'vertical' | 'circular') => {
    setSelectedLayout(layout);
  };

  return (
    <div className="w-full h-[80vh] rounded-lg border bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background />

        <Panel position="top-right">
          <div className="space-y-2">
            <div className="bg-white p-2 rounded shadow-sm space-x-2">
              <Button
                size="sm"
                variant={selectedLayout === 'horizontal' ? 'default' : 'outline'}
                onClick={() => changeLayout('horizontal')}
              >
                Horizontal
              </Button>
              <Button
                size="sm"
                variant={selectedLayout === 'vertical' ? 'default' : 'outline'}
                onClick={() => changeLayout('vertical')}
              >
                Vertical
              </Button>
              <Button
                size="sm"
                variant={selectedLayout === 'circular' ? 'default' : 'outline'}
                onClick={() => changeLayout('circular')}
              >
                Circular
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="bg-white"
              onClick={downloadAsPNG}
            >
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}