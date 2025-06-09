'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { DeploymentDataModel, WebRTCOfferResponse } from '@/constants/deploy';
import { useAuthApi } from '@/components/hooks/useAuthReq';

interface Props {
  deployment: DeploymentDataModel;
}

export default function WebRTCPreview({ deployment }: Props) {
  const api = useAuthApi();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [streamOutput] = useState<string[]>(['output_image']);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // 处理WebRTC连接
  const handleStartStream = async () => {
    if (isStreaming) {
      handleStopStream();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      peerConnection.current = new RTCPeerConnection();

      peerConnection.current.addTransceiver('video', {
        direction: 'recvonly'
      });

      peerConnection.current.ontrack = (event) => {
        if (
          event.streams &&
          event.streams.length > 0 &&
          event.track.kind === 'video'
        ) {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
          }
        }
      };

      peerConnection.current.onconnectionstatechange = () => {
        if (
          peerConnection.current?.connectionState === 'failed' ||
          peerConnection.current?.connectionState === 'disconnected'
        ) {
          setError('WebRTC 连接失败或断开');
          setIsStreaming(false);
          if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
          }
        }
      };

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      const response = await api.post<WebRTCOfferResponse>(
        `api/reef/workspaces/${deployment.workspace_id}/deployments/${deployment.id}/offer`,
        {
          json: {
            webrtc_offer: {
              type: offer.type,
              sdp: offer.sdp
            },
            stream_output: streamOutput,
            webcam_fps: 30,
            max_consecutive_timeouts: 10,
            min_consecutive_on_time: 3,
            processing_timeout: 1.0,
            fps_probe_frames: 30
          }
        }
      );

      const data = await response.json();
      if (!data || !data.sdp) {
        throw new Error('服务器响应无效：缺少 SDP');
      }
      const answerSdp = data.sdp;

      if (
        !answerSdp.includes('v=') ||
        !answerSdp.includes('o=') ||
        !answerSdp.includes('s=')
      ) {
        throw new Error('无效的 SDP 格式：缺少必需字段');
      }

      try {
        const answer = new RTCSessionDescription({
          type: 'answer',
          sdp: answerSdp
        });

        await peerConnection.current.setRemoteDescription(answer);
        setIsStreaming(true);
      } catch (error) {
        throw new Error('设置远程描述失败: ' + (error as Error).message);
      }
    } catch (error) {
      console.error('启动流失败:', error);
      setError((error as Error).message || '连接失败，请重试');
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 停止流
  const handleStopStream = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setError(null);
  };

  // 渲染播放器
  const renderPlayer = () => {
    if (error) {
      return (
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center text-red-500">
            <Icons.warning className="mx-auto mb-2 h-8 w-8" />
            <p>{error}</p>
          </div>
        </div>
      );
    }

    if (!isStreaming && !isLoading) {
      return (
        <div
          className="flex h-[400px] cursor-pointer items-center justify-center bg-gray-100"
          onClick={handleStartStream}
        >
          <div className="text-center">
            <Icons.play className="mx-auto mb-2 h-12 w-12" />
            <p className="text-sm font-medium">点击开始预览</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="group relative h-[400px] bg-black"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full object-contain"
        />
        {isHovering && isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
              onClick={handleStopStream}
            >
              <Icons.paused className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <Icons.spinner className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      <div className="relative">{renderPlayer()}</div>
    </Card>
  );
}
