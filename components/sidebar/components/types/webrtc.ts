import {
  CameraWebRTCStreamResponse,
  WebRTCOffer,
  WebRTCTURNConfig
} from '@/constants/camera';
import { WebRTCOfferResponse } from '@/constants/deploy';

// 通用的 WebRTC 连接参数
export interface WebRTCConnectionParams {
  webrtc_offer: WebRTCOffer;
  webrtc_turn_config?: WebRTCTURNConfig;
  webcam_fps?: number;
  processing_timeout?: number;
  max_consecutive_timeouts?: number;
  min_consecutive_on_time?: number;
  fps_probe_frames?: number;
}

// 通用的 WebRTC 响应（兼容两种不同的响应格式）
export interface WebRTCResponse {
  sdp: string;
  type?: string;
  status?: string;
  error?: string;
}

// 输出选项配置
export interface OutputOption {
  value: string;
  label: string;
}

// WebRTC 配置接口
export interface WebRTCConfig {
  // API 端点配置
  apiEndpoint: string;

  // 输出选项
  outputOptions: OutputOption[];
  defaultOutput: string;

  // 请求参数构建函数
  buildRequestParams: (
    offer: WebRTCOffer,
    selectedOutput: string,
    baseParams: WebRTCConnectionParams
  ) => any;

  // 响应处理函数
  handleResponse: (response: any) => WebRTCResponse;
}

// 基础 WebRTC 组件的 Props
export interface BaseWebRTCProps {
  title: string;
  config: WebRTCConfig;
  onStreamStart?: () => void;
  onStreamStop?: () => void;
  onError?: (error: string) => void;
}

// WebRTC 连接状态
export interface WebRTCState {
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  selectedOutput: string;
}

// ICE 服务器配置
export interface ICEServerConfig {
  urls: string;
  username?: string;
  credential?: string;
}
