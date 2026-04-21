'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import SecuritySDK from '@/lib/drm/SecuritySDK';
import DynamicWatermark from './DynamicWatermark';
import { Lock, Play, ShieldAlert } from 'lucide-react';
import Player from 'video.js/dist/types/player';

interface DrmPlayerProps {
  videoId: string;
  token: string;
  watermark?: string;
  onViolation?: (type: string) => void;
}

const DrmPlayer: React.FC<DrmPlayerProps> = ({ 
  videoId, 
  token, 
  watermark = 'SECURE-VIEW', 
  onViolation 
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const sdkRef = useRef<SecuritySDK | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isViolated, setIsViolated] = useState(false);

  // Initialize Security SDK
  useEffect(() => {
    const sdk = new SecuritySDK({
      violationMessage: 'tVNDRM [PROTECTED]: Unauthorized activity detected.'
    });
    sdkRef.current = sdk;

    if (onViolation) {
      sdk.onSecurityAlert(onViolation);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [onViolation]);

  const onVideoRef = useCallback((el: HTMLVideoElement | null) => {
    if (!el) return;
    
    if (!playerRef.current) {
      videoRef.current = el;
      const player = videojs(el, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2]
      });
      playerRef.current = player;
      
      if (sdkRef.current) {
        sdkRef.current.lockElement(el);
      }
    }
  }, []);

  const handleStart = () => {
    if (playerRef.current && videoId && token) {
      // Points to the VPS identified in environment variables
      const serverUrl = process.env.NEXT_PUBLIC_DRM_SERVER_URL || 'http://103.97.126.54:5000';
      const streamUrl = `${serverUrl}/api/drm/keys/${videoId}?token=${token}`;
      
      playerRef.current.src({
        src: streamUrl,
        type: 'application/x-mpegURL'
      });
      setIsLoaded(true);
    }
  };

  return (
    <div className="relative group rounded-3xl overflow-hidden bg-black border border-white/5 shadow-2xl min-h-[400px]">
      {/* Intro Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-700">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 animate-pulse">
                <Lock className="text-white w-10 h-10" />
            </div>
          </div>
          <div className="text-center mb-10">
            <h3 className="text-xl font-bold uppercase tracking-[0.3em] mb-2">tVNDRM Protected</h3>
            <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase">ENCRYPTED STREAM • ID: {videoId}</p>
          </div>
          <button 
            onClick={handleStart}
            className="px-10 py-4 bg-white text-black rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            DECRYPT & WATCH
          </button>
        </div>
      )}

      {/* Video.js Element */}
      <div data-vjs-player>
        <video 
          ref={onVideoRef} 
          className="video-js vjs-big-play-centered"
          playsInline
        />
      </div>

      {/* Security Layers */}
      {isLoaded && <DynamicWatermark text={watermark} />}

      {/* Violation Shield */}
      {isViolated && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-12 text-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
            <h3 className="text-2xl font-bold text-red-500 uppercase italic">Security Breach</h3>
            <p className="text-white/60 mt-4 max-w-sm">
                Developer tools or recording software detected. 
                Playback restricted for security.
            </p>
        </div>
      )}
    </div>
  );
};

export default DrmPlayer;
