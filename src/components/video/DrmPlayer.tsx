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
      violationMessage: 'Phát hiện thao tác không được phép trên video.'
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
    <div className="relative group w-full h-full overflow-hidden bg-black">
      {/* Intro Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-700">
          <div className="mb-6 w-16 h-16 rounded-full flex items-center justify-center border border-gold-light/40 text-gold-light">
            <Lock className="w-7 h-7" aria-hidden="true" />
          </div>
          <p className="text-white font-semibold mb-1">Video được bảo vệ bản quyền</p>
          <p className="text-stone-400 text-sm mb-8 px-6 text-center">Video gắn dấu email của bạn để chống sao chép.</p>
          <button
            onClick={handleStart}
            disabled={!token}
            className="btn btn-gold"
          >
            {token ? <><Play className="w-4 h-4" fill="currentColor" aria-hidden="true" /> Phát video</> : 'Đang chuẩn bị video…'}
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
            <ShieldAlert className="w-12 h-12 text-gold-light mb-5" aria-hidden="true" />
            <p className="text-xl font-semibold text-white">Đã tạm dừng phát video</p>
            <p className="text-stone-400 mt-3 max-w-sm">
                Phát hiện công cụ nhà phát triển hoặc phần mềm quay màn hình. Hãy tắt chúng rồi tải lại trang.
            </p>
        </div>
      )}
    </div>
  );
};

export default DrmPlayer;
