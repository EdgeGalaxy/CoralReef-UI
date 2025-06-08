'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

import { DeploymentDataModel, WebRTCOfferResponse } from '@/constants/deploy';
import { useAuthApi } from '@/components/hooks/useAuthReq';

interface Props {
  deployment: DeploymentDataModel;
}

export default function WebRTCPreview({ deployment }: Props) {
  const api = useAuthApi();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamOutput, setStreamOutput] = useState<string[]>(['output_image']);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // 处理WebRTC连接
  const handleStartStream = async () => {
    try {
      peerConnection.current = new RTCPeerConnection(); // 使用 current 引用

      // 2. 添加空的音视频轨道并设置为 recvonly
      // stream = new MediaStream() is not needed here
      peerConnection.current.addTransceiver('video', {
        direction: 'recvonly' // 前端只接收视频
      });
      // 注意: 不需要 addTransceiver('audio', { direction: 'recvonly' }); 如果你只关心视频

      // 3. 设置视频流处理 (ontrack)
      // 这是将远程流附加到 <video> 元素的关键
      peerConnection.current.ontrack = (event) => {
        // 确保 event.streams[0] 是有效的，并且 videoRef.current 存在
        if (
          event.streams &&
          event.streams.length > 0 &&
          event.track.kind === 'video'
        ) {
          console.log('Received remote stream:', event.streams[0]);
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
          }
        }
      };

      peerConnection.current.onconnectionstatechange = () => {
        console.log(
          'Frontend Connection state:',
          peerConnection.current?.connectionState
        );
        console.log(
          'Frontend ICE Connection state:',
          peerConnection.current?.iceConnectionState
        );
        if (
          peerConnection.current?.connectionState === 'failed' ||
          peerConnection.current?.connectionState === 'disconnected'
        ) {
          console.error('WebRTC connection failed or disconnected');
          setIsStreaming(false);
          if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
          }
        }
      };
      // 6. 创建 offer
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
        throw new Error('Invalid response from server: missing SDP');
      }
      const answerSdp = data.sdp;

      if (
        !answerSdp.includes('v=') ||
        !answerSdp.includes('o=') ||
        !answerSdp.includes('s=')
      ) {
        throw new Error('Invalid SDP format: missing required fields');
      }

      // 9. 设置远程描述
      try {
        const answer = new RTCSessionDescription({
          type: 'answer',
          sdp: answerSdp
        });

        await peerConnection.current.setRemoteDescription(answer);
        setIsStreaming(true); // 更新 UI 状态
      } catch (error) {
        console.error('Error setting remote description:', error);
        throw new Error(
          'Failed to set remote description: ' + (error as Error).message
        );
      }
    } catch (error) {
      console.error('Error starting stream:', error);
      // 清理连接
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      setIsStreaming(false);
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
  };

  return (
    <div>
      {/* 视频流显示区域 */}
      <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex space-x-4">
        <Button onClick={handleStartStream}>开始流</Button>
        <Button onClick={handleStopStream}>停止流</Button>
      </div>
    </div>
  );
}
