import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@orca/content'],
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  experimental: {
    // 구형 스크롤/포커스 핸들러의 domNode.focus() 크래시 회피 (Next.js 16.2.12 기지 버그).
    // 신형 핸들러는 스크롤/blur는 유지하되 포커스는 옮기지 않는다.
    appNewScrollHandler: true,
  },
};

export default nextConfig;
