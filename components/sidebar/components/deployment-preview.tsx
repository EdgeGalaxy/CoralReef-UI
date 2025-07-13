'use client';

import { useMemo } from 'react';
import { DeploymentDataModel, WebRTCOfferResponse } from '@/constants/deploy';
import { WebRTCOffer } from '@/constants/camera';
import BaseWebRTCPreview from './base-webrtc-preview';
import {
  WebRTCConfig,
  WebRTCConnectionParams,
  WebRTCResponse,
  OutputOption
} from './types/webrtc';

interface DeploymentPreviewProps {
  deployment: DeploymentDataModel;
  onStreamStart?: () => void;
  onStreamStop?: () => void;
  onError?: (error: string) => void;
}

export default function DeploymentPreview({
  deployment,
  onStreamStart,
  onStreamStop,
  onError
}: DeploymentPreviewProps) {
  // 构建输出选项
  const outputOptions: OutputOption[] = useMemo(() => {
    const options: OutputOption[] = [
      {
        value: 'origin_image',
        label: '原始视频流'
      }
    ];

    // 添加工作流输出字段
    deployment.output_image_fields.forEach((field) => {
      options.push({
        value: field,
        label: field
      });
    });

    return options;
  }, [deployment.output_image_fields]);

  // 构建请求参数
  const buildRequestParams = (
    offer: WebRTCOffer,
    selectedOutput: string,
    baseParams: WebRTCConnectionParams
  ) => {
    const streamOutput =
      selectedOutput === 'origin_image' ? [] : [selectedOutput];

    return {
      webrtc_offer: offer,
      webrtc_turn_config: baseParams.webrtc_turn_config,
      stream_output: streamOutput,
      webcam_fps: baseParams.webcam_fps || 30,
      processing_timeout: baseParams.processing_timeout || 1.0,
      max_consecutive_timeouts: baseParams.max_consecutive_timeouts || 10,
      min_consecutive_on_time: baseParams.min_consecutive_on_time || 3,
      fps_probe_frames: baseParams.fps_probe_frames || 30
    };
  };

  // 处理响应
  const handleResponse = (response: WebRTCOfferResponse): WebRTCResponse => {
    return {
      sdp: response.sdp,
      type: response.type
    };
  };

  // WebRTC 配置
  const webrtcConfig: WebRTCConfig = useMemo(
    () => ({
      apiEndpoint: `api/reef/workspaces/${deployment.workspace_id}/deployments/${deployment.id}/offer`,
      outputOptions,
      defaultOutput: outputOptions[0]?.value || 'origin_image',
      buildRequestParams,
      handleResponse
    }),
    [deployment.workspace_id, deployment.id, outputOptions]
  );

  return (
    <BaseWebRTCPreview
      title="视频流"
      config={webrtcConfig}
      onStreamStart={onStreamStart}
      onStreamStop={onStreamStop}
      onError={onError}
    />
  );
}
