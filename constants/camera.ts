import { CameraType } from './deploy';

export interface CameraModel {
  id: string;
  name: string;
  description: string;
  type: CameraType;
  path: string | number;
  gateway_id?: string;
  gateway_name?: string;
  workspace_id: string;
  workspace_name: string;
  created_at: string;
  updated_at: string;
}

export interface CameraVideoInfo {
  width: number | null;
  height: number | null;
  fps: number | null;
  total_frames?: number | null;
}

export interface WebRTCOffer {
  type: string;
  sdp: string;
}

export interface WebRTCTURNConfig {
  urls: string[];
  username: string;
  credential: string;
}

export interface CameraWebRTCStreamRequest {
  webrtc_offer: WebRTCOffer;
  webrtc_turn_config?: WebRTCTURNConfig;
  fps?: number;
  processing_timeout?: number;
  max_consecutive_timeouts?: number;
  min_consecutive_on_time?: number;
}

export interface CameraWebRTCStreamResponse {
  status: string;
  sdp?: string;
  type?: string;
  error?: string;
}

export interface CameraSnapshotResponse {
  status: string;
  image_base64: string;
}
