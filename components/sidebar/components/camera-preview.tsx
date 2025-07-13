'use client';

import { useMemo } from 'react';
import { CameraModel, CameraWebRTCStreamResponse } from '@/constants/camera';
import { WebRTCOffer } from '@/constants/camera';
import BaseWebRTCPreview from './base-webrtc-preview';
import {
  WebRTCConfig,
  WebRTCConnectionParams,
  WebRTCResponse,
  OutputOption
} from './types/webrtc';

interface CameraPreviewProps {
  camera: CameraModel;
  onStreamStart?: () => void;
  onStreamStop?: () => void;
  onError?: (error: string) => void;
}

export default function CameraPreview({
  camera,
  onStreamStart,
  onStreamStop,
  onError
}: CameraPreviewProps) {
  // Camera 只支持原始视频流
  const outputOptions: OutputOption[] = useMemo(
    () => [
      {
        value: 'origin_image',
        label: '原始视频流'
      }
    ],
    []
  );

  // 构建请求参数
  const buildRequestParams = (
    offer: WebRTCOffer,
    selectedOutput: string,
    baseParams: WebRTCConnectionParams
  ) => {
    return {
      webrtc_offer: offer,
      webrtc_turn_config: baseParams.webrtc_turn_config,
      fps: baseParams.webcam_fps || 30,
      processing_timeout: baseParams.processing_timeout || 0.1,
      max_consecutive_timeouts: baseParams.max_consecutive_timeouts || 30,
      min_consecutive_on_time: baseParams.min_consecutive_on_time || 5
    };
  };

  // 处理响应
  const handleResponse = (
    response: CameraWebRTCStreamResponse
  ): WebRTCResponse => {
    if (response.status === 'error') {
      throw new Error(response.error || '摄像头流创建失败');
    }

    return {
      sdp: response.sdp!,
      type: response.type,
      status: response.status
    };
  };

  // WebRTC 配置
  const webrtcConfig: WebRTCConfig = useMemo(
    () => ({
      apiEndpoint: `api/reef/workspaces/${camera.workspace_id}/cameras/${camera.id}/webrtc-stream`,
      outputOptions,
      defaultOutput: 'origin_image',
      buildRequestParams,
      handleResponse
    }),
    [camera.workspace_id, camera.id, outputOptions]
  );

  return (
    <BaseWebRTCPreview
      title="摄像头实时预览"
      config={webrtcConfig}
      onStreamStart={onStreamStart}
      onStreamStop={onStreamStop}
      onError={onError}
    />
  );
}
