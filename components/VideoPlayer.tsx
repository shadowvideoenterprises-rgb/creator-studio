import React from 'react';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <video
        src={src}
        controls
        className="w-full h-full"
      />
    </div>
  );
};

export default VideoPlayer;
