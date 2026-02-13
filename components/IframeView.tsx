
import React from 'react';

interface IframeViewProps {
  url: string;
  onLoad: () => void;
}

const IframeView: React.FC<IframeViewProps> = ({ url, onLoad }) => {
  return (
    <div className="w-full h-screen overflow-hidden bg-white">
      <iframe
        src={url}
        onLoad={onLoad}
        title="External Site"
        className="w-full h-full border-none m-0 p-0 overflow-hidden animate-in fade-in duration-1000"
        allowFullScreen
        loading="eager"
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals allow-presentation"
        style={{ width: '100vw', height: '100vh', display: 'block' }}
      ></iframe>
    </div>
  );
};

export default IframeView;
