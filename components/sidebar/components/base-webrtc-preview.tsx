'use client';

import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  BaseWebRTCProps,
  WebRTCState,
  WebRTCConnectionParams,
  ICEServerConfig
} from './types/webrtc';

export default function BaseWebRTCPreview({
  title,
  config,
  onStreamStart,
  onStreamStop,
  onError
}: BaseWebRTCProps) {
  const api = useAuthApi();

  // 状态管理
  const [state, setState] = useState<WebRTCState>({
    isStreaming: false,
    isLoading: false,
    error: null,
    selectedOutput: config.defaultOutput
  });

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // ICE 服务器配置
  const iceServers: ICEServerConfig[] = [
    {
      urls: 'stun:stun.aliyuncs.com:3478'
    }
  ];

  // 更新状态的辅助函数
  const updateState = useCallback((updates: Partial<WebRTCState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // 创建 WebRTC 连接
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers });

    pc.addTransceiver('video', { direction: 'recvonly' });

    pc.ontrack = (event) => {
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

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === 'failed' ||
        pc.connectionState === 'disconnected'
      ) {
        const error = 'WebRTC 连接失败或断开';
        updateState({ error, isStreaming: false });
        onError?.(error);
        cleanup();
      }
    };

    return pc;
  }, [onError, updateState]);

  // 清理资源
  const cleanup = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // 开始流
  const handleStartStream = useCallback(async () => {
    if (state.isStreaming) {
      handleStopStream();
      return;
    }

    updateState({ isLoading: true, error: null });

    try {
      // 创建 peer connection
      peerConnection.current = createPeerConnection();

      // 创建 offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      // 构建请求参数
      const baseParams: WebRTCConnectionParams = {
        webrtc_offer: {
          type: offer.type as string,
          sdp: offer.sdp as string
        },
        webcam_fps: 30,
        processing_timeout: 1.0,
        max_consecutive_timeouts: 10,
        min_consecutive_on_time: 3,
        fps_probe_frames: 30
      };

      const requestParams = config.buildRequestParams(
        baseParams.webrtc_offer,
        state.selectedOutput,
        baseParams
      );

      // 发送请求
      const response = await api.post(config.apiEndpoint, {
        json: requestParams
      });

      const responseData = await response.json();
      const webrtcResponse = config.handleResponse(responseData);

      if (!webrtcResponse.sdp) {
        throw new Error('服务器响应无效：缺少 SDP');
      }

      // 验证 SDP 格式
      const { sdp } = webrtcResponse;
      if (!sdp.includes('v=') || !sdp.includes('o=') || !sdp.includes('s=')) {
        throw new Error('无效的 SDP 格式：缺少必需字段');
      }

      // 设置远程描述
      const answer = new RTCSessionDescription({
        type: 'answer',
        sdp
      });

      await peerConnection.current.setRemoteDescription(answer);

      updateState({ isStreaming: true, isLoading: false });
      onStreamStart?.();
    } catch (error) {
      console.error('启动流失败:', error);
      const errorMessage = (error as Error).message || '连接失败，请重试';
      updateState({
        error: errorMessage,
        isStreaming: false,
        isLoading: false
      });
      onError?.(errorMessage);
      cleanup();
    }
  }, [
    state.isStreaming,
    state.selectedOutput,
    config,
    api,
    createPeerConnection,
    cleanup,
    updateState,
    onStreamStart,
    onError
  ]);

  // 停止流
  const handleStopStream = useCallback(() => {
    cleanup();
    updateState({ isStreaming: false, error: null });
    onStreamStop?.();
  }, [cleanup, updateState, onStreamStop]);

  // 处理输出选择变化
  const handleOutputChange = useCallback(
    (value: string) => {
      updateState({ selectedOutput: value });
      if (state.isStreaming) {
        handleStopStream();
        // 延迟重新启动以避免竞态条件
        setTimeout(() => {
          setState((prev) => ({ ...prev, selectedOutput: value }));
          handleStartStream();
        }, 500);
      }
    },
    [state.isStreaming, handleStopStream, handleStartStream, updateState]
  );

  // 渲染播放器
  const renderPlayer = () => {
    if (state.error) {
      return (
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center text-red-500">
            <Icons.warning className="mx-auto mb-2 h-8 w-8" />
            <p>{state.error}</p>
          </div>
        </div>
      );
    }

    if (!state.isStreaming && !state.isLoading) {
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
      <div className="relative h-[400px] bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full object-contain"
        />
        {state.isStreaming && (
          <div className="absolute bottom-4 right-4">
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
      <div className="flex items-center gap-4 border-b p-4">
        <div className="text-sm font-medium">{title}</div>
        {config.outputOptions.length > 1 && (
          <Select
            value={state.selectedOutput}
            onValueChange={handleOutputChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="选择输出图像" />
            </SelectTrigger>
            <SelectContent>
              {config.outputOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {state.isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <Icons.spinner className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      <div className="relative">{renderPlayer()}</div>
    </Card>
  );
}
