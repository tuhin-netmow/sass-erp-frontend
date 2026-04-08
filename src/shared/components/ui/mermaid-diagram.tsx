import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  id?: string;
}

export function MermaidDiagram({ chart, id = 'mermaid-chart' }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      themeVariables: {
        primaryColor: '#e3f2fd',
        primaryTextColor: '#1565c0',
        primaryBorderColor: '#1565c0',
        lineColor: '#42a5f5',
        secondaryColor: '#f3e5f5',
        tertiaryColor: '#fff',
      },
    });
  }, []);

  useEffect(() => {
    if (ref.current) {
      const uniqueId = `${id}-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(uniqueId, chart).then((result) => {
        if (ref.current) {
          ref.current.innerHTML = result.svg;
        }
      });
    }
  }, [chart, id]);

  return (
    <div
      ref={ref}
      className="flex items-center justify-center bg-white rounded-lg p-4 overflow-auto"
    />
  );
}
