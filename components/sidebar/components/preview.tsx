'use client';

import React, { useState } from 'react';
import { SourceDataModel } from '@/constants/deploy';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import dynamic from 'next/dynamic';
import { fetchWithAuth } from '@/lib/utils';

// 动态导入库（需要先安装）
const ReactPlayer = dynamic(
  () => import('react-player/lazy').then((mod) => mod.default),
  { ssr: false }
);
// 如果仍需使用 HLS.js，在安装后解除下面的注释
// const Hls = dynamic(() => import('hls.js'), { ssr: false });

interface PreviewProps {
  source: SourceDataModel;
}

// 定义视频信息类型
interface VideoInfo {
  width: number | null;
  height: number | null;
  fps: number | null;
  total_frames: number | null;
}

export function Preview({ source }: PreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);

  // 获取视频信息
  const { data: videoInfo, error: videoInfoError } = useAuthSWR<VideoInfo>(
    source.workspace_id && source.id
      ? `/api/reef/workspaces/${source.workspace_id}/cameras/${source.id}/video-info`
      : null
  );

  // 获取视频 URL（异步处理）
  React.useEffect(() => {
    async function fetchVideoUrl() {
      try {
        setLoading(true);
        const url = await getVideoUrl();
        setVideoUrl(url);
      } catch (err) {
        console.error('获取视频URL错误:', err);
        setError('无法获取视频源，请检查鉴权信息');
      } finally {
        setLoading(false);
      }
    }

    fetchVideoUrl();
  }, [source]);

  // 异步获取视频 URL 并处理 OSS 鉴权
  const getVideoUrl = async () => {
    // source.path 是 SourceDataModel 中实际存在的属性
    const sourcePath =
      typeof source.path === 'string' ? source.path : `${source.path}`;

    switch (source.type?.toLowerCase()) {
      case 'rtsp':
        return `${
          process.env.NEXT_PUBLIC_API_BASE_URL || ''
        }/api/reef/stream?url=${encodeURIComponent(sourcePath)}?type=rtsp`;
      case 'rtmp':
        return `${
          process.env.NEXT_PUBLIC_API_BASE_URL || ''
        }/api/reef/stream?url=${encodeURIComponent(sourcePath)}?type=rtmp`;
      case 'usb':
        return `${
          process.env.NEXT_PUBLIC_API_BASE_URL || ''
        }/api/reef/stream?url=${encodeURIComponent(sourcePath)}?type=usb`;
      case 'file':
        try {
          // 通过 API 接口获取签名URL，使用统一的401错误处理
          const response = await fetchWithAuth(
            `/api/tokenUrl?key=${encodeURIComponent(sourcePath)}`
          );

          if (!response.ok) {
            throw new Error('获取签名URL失败');
          }
          const data = await response.json();
          return data.url;
        } catch (err) {
          console.error('获取文件签名URL失败:', err);
          return sourcePath; // 失败时返回原始路径
        }
      default:
        return sourcePath; // 出错时返回原始路径
    }
  };

  // 处理播放错误
  const handleError = (err: any) => {
    console.error('视频播放错误:', err);
    setError('无法播放视频，请检查视频源或网络连接');
    setLoading(false);
  };

  // 处理播放就绪
  const handleReady = () => {
    setLoading(false);
    setError(null);
  };

  // 处理点击播放的逻辑
  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  // 渲染播放器
  const renderPlayer = () => {
    // 如果正在加载，显示加载动画
    if (loading) {
      return (
        <div className="flex h-[400px] items-center justify-center bg-gray-100">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    // 检查 URL 是否有效
    if (!videoUrl) {
      return (
        <div className="text-center text-red-500">
          <p>无效的视频源路径</p>
        </div>
      );
    }

    // 如果还未点击播放按钮，显示占位符
    if (!isPlaying) {
      return (
        <div
          className="flex h-[400px] cursor-pointer items-center justify-center bg-gray-100"
          onClick={handlePlayClick}
        >
          <div className="text-center">
            <Icons.play className="mx-auto mb-2 h-12 w-12" />
            <p className="text-sm font-medium">点击播放视频</p>
          </div>
        </div>
      );
    }

    // 直接使用 ReactPlayer，不需要额外的类型断言
    return (
      <ReactPlayer
        url={videoUrl}
        playing={isPlaying}
        controls
        width="100%"
        height="400px"
        onReady={handleReady}
        onError={handleError}
      />
    );
  };

  if (error) {
    return (
      <Card className="flex h-[400px] items-center justify-center">
        <div className="text-center text-red-500">
          <Icons.warning className="mx-auto mb-2 h-8 w-8" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {loading && isPlaying && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <Icons.spinner className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      <div className="relative">{renderPlayer()}</div>

      {/* 视频信息显示 */}
      {videoInfo && (
        <div className="border-t p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">视频信息</h3>
            <Badge variant="outline" className="text-xs">
              {source.type?.toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {videoInfo.width && videoInfo.height && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">分辨率</span>
                <span className="font-medium">
                  {videoInfo.width}×{videoInfo.height}
                </span>
              </div>
            )}
            {videoInfo.fps && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">帧率</span>
                <span className="font-medium">
                  {videoInfo.fps.toFixed(1)} fps
                </span>
              </div>
            )}
            {videoInfo.total_frames && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">总帧数</span>
                <span className="font-medium">
                  {videoInfo.total_frames.toLocaleString()}
                </span>
              </div>
            )}
            {videoInfo.total_frames && videoInfo.fps && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">时长</span>
                <span className="font-medium">
                  {Math.round(videoInfo.total_frames / videoInfo.fps)}秒
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
