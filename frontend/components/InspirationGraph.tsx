import React, { useEffect, useRef, useState } from 'react';
import { InspirationItem } from '../types';

interface Node {
  id: string;
  label: string;
  type: 'inspiration' | 'tag';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  data?: InspirationItem;
}

interface Link {
  source: string;
  target: string;
  strength: number;
}

interface InspirationGraphProps {
  inspirations: InspirationItem[];
  onNodeClick: (inspiration: InspirationItem | null) => void;
}

// 标签颜色映射 - 苹果风格极简配色（纯色，无渐变）
const TAG_COLORS: Record<string, string> = {
  '随想': '#C7B3FF',    // 柔和紫
  '自然': '#9FE2BF',    // 清新绿
  '设计': '#FFB3D9',    // 温柔粉
  '创意': '#FFD4A3',    // 暖橙
  '生活': '#A3D5FF',    // 天空蓝
  '提醒': '#FFE699',    // 柔和黄
  '工作': '#C4B5FD',    // 薰衣草
  '学习': '#B8C5FF',    // 雾蓝
  '友情': '#FFB8C8',    // 玫瑰
  '成长': '#C8E6A0',    // 青柠
};

// 计算两个灵感之间的相似度（基于共同标签）
const calculateSimilarity = (item1: InspirationItem, item2: InspirationItem): number => {
  const tags1 = new Set(item1.tags);
  const tags2 = new Set(item2.tags);
  const intersection = new Set([...tags1].filter(x => tags2.has(x)));
  const union = new Set([...tags1, ...tags2]);
  return union.size > 0 ? intersection.size / union.size : 0;
};

export const InspirationGraph: React.FC<InspirationGraphProps> = ({ 
  inspirations, 
  onNodeClick 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const animationRef = useRef<number>();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // 初始化图谱数据
  useEffect(() => {
    if (!canvasRef.current || inspirations.length === 0) return;

    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    // 收集所有标签
    const allTags = new Set<string>();
    inspirations.forEach(item => {
      item.tags.forEach(tag => allTags.add(tag));
    });

    const tagArray = Array.from(allTags);
    const newNodes: Node[] = [];
    const newLinks: Link[] = [];

    // 创建标签节点（内圈，均匀分布）- 极简小圆点
    tagArray.forEach((tag: string, index: number) => {
      const angle = (index / tagArray.length) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.15;
      newNodes.push({
        id: `tag-${tag}`,
        label: tag,
        type: 'tag',
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 8, // 极简小圆点
        color: TAG_COLORS[tag] || '#E2E8F0',
      });
    });

    // 创建灵感节点（外圈，更分散）- 极简小圆点
    inspirations.forEach((item: InspirationItem, index: number) => {
      const angle = (index / inspirations.length) * Math.PI * 2 + Math.random() * 0.3;
      const radius = Math.min(width, height) * 0.35 + Math.random() * 50;
      newNodes.push({
        id: item.id,
        label: item.content.substring(0, 8) + '...',
        type: 'inspiration',
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 6, // 极简小圆点
        color: '#A78BFA', // 柔和紫色
        data: item,
      });

      // 连接灵感到其标签
      item.tags.forEach((tag: string) => {
        newLinks.push({
          source: item.id,
          target: `tag-${tag}`,
          strength: 0.8,
        });
      });
    });

    // 创建灵感之间的连接（基于相似度）
    for (let i = 0; i < inspirations.length; i++) {
      for (let j = i + 1; j < inspirations.length; j++) {
        const similarity = calculateSimilarity(inspirations[i], inspirations[j]);
        if (similarity > 0.4) { // 提高阈值，减少连接
          newLinks.push({
            source: inspirations[i].id,
            target: inspirations[j].id,
            strength: similarity * 0.5, // 降低连接强度
          });
        }
      }
    }

    setNodes(newNodes);
    setLinks(newLinks);
  }, [inspirations]);

  // 力导向布局模拟
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    let isRunning = true;

    const simulate = () => {
      if (!isRunning) return;

      // 清空画布
      ctx.clearRect(0, 0, width, height);

      // 应用力 - 更柔和的物理效果
      const alpha = 0.15;
      const centerForce = 0.003;
      const repelForce = 1500;
      const linkForce = 0.04;

      // 中心引力（仅对标签节点）
      nodes.forEach((node: Node) => {
        if (node.type === 'tag') {
          const dx = width / 2 - node.x;
          const dy = height / 2 - node.y;
          node.vx += dx * centerForce;
          node.vy += dy * centerForce;
        }
      });

      // 节点间斥力
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDistance = nodes[i].radius + nodes[j].radius + 30;
          
          if (distance < minDistance) {
            const force = repelForce / (distance * distance) * 2;
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            nodes[i].vx -= fx;
            nodes[i].vy -= fy;
            nodes[j].vx += fx;
            nodes[j].vy += fy;
          } else {
            const force = repelForce / (distance * distance);
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            nodes[i].vx -= fx;
            nodes[i].vy -= fy;
            nodes[j].vx += fx;
            nodes[j].vy += fy;
          }
        }
      }

      // 连接引力
      links.forEach((link: Link) => {
        const source = nodes.find((n: Node) => n.id === link.source);
        const target = nodes.find((n: Node) => n.id === link.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const idealDistance = 150;
          const force = (distance - idealDistance) * linkForce * link.strength;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          source.vx += fx;
          source.vy += fy;
          target.vx -= fx;
          target.vy -= fy;
        }
      });

      // 更新位置
      nodes.forEach((node: Node) => {
        node.x += node.vx * alpha;
        node.y += node.vy * alpha;
        node.vx *= 0.88;
        node.vy *= 0.88;

        const margin = node.radius + 20;
        node.x = Math.max(margin, Math.min(width - margin, node.x));
        node.y = Math.max(margin, Math.min(height - margin, node.y));
      });

      // 绘制连接 - 极简细线，梦幻效果
      links.forEach((link: Link) => {
        const source = nodes.find((n: Node) => n.id === link.source);
        const target = nodes.find((n: Node) => n.id === link.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          
          // 极简细线
          if (source.type === 'inspiration' && target.type === 'inspiration') {
            // 灵感之间 - 更淡的虚线
            ctx.setLineDash([3, 6]);
            ctx.strokeStyle = 'rgba(167, 139, 250, 0.08)';
            ctx.lineWidth = 0.8;
          } else {
            // 灵感到标签 - 实线
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(167, 139, 250, 0.12)';
            ctx.lineWidth = 1;
          }
          
          ctx.globalAlpha = link.strength * 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.setLineDash([]);
        }
      });

      // 绘制节点 - 极简纯色圆点
      nodes.forEach((node: Node) => {
        const isSelected = selectedNode === node.id;
        const isHovered = hoveredNode === node.id;

        // 悬停或选中时的光晕效果（苹果风格）
        if (isSelected || isHovered) {
          ctx.save();
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 20;
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 节点圆形 - 纯色，无渐变
        ctx.fillStyle = node.color;
        ctx.globalAlpha = isHovered || isSelected ? 1 : 0.85;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // 极简白色边框（仅在悬停或选中时）
        if (isHovered || isSelected) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    simulate();

    return () => {
      isRunning = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, links, selectedNode, hoveredNode]);

  // 处理点击 - 扩大点击区域
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 查找点击的节点（扩大点击区域）
    const clickedNode = nodes.find((node: Node) => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius + 10; // 扩大点击区域
    });

    if (clickedNode) {
      if (clickedNode.type === 'inspiration' && clickedNode.data) {
        setSelectedNode(clickedNode.id);
        onNodeClick(clickedNode.data);
      } else if (clickedNode.type === 'tag') {
        setSelectedNode(clickedNode.id);
        onNodeClick(null);
      }
    } else {
      setSelectedNode(null);
      onNodeClick(null);
    }
  };

  // 处理鼠标移动 - 扩大悬停区域
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hoveredNode = nodes.find((node: Node) => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius + 10; // 扩大悬停区域
    });

    setHoveredNode(hoveredNode ? hoveredNode.id : null);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-white/80 via-purple-50/40 to-pink-50/40">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        style={{ touchAction: 'none' }}
      />
      
      {/* 悬停提示 - 苹果风格毛玻璃效果 */}
      {hoveredNode && (
        <div 
          className="absolute pointer-events-none transition-all duration-200 ease-out"
          style={{
            left: `${(nodes.find((n: Node) => n.id === hoveredNode)?.x || 0) / 800 * 100}%`,
            top: `${(nodes.find((n: Node) => n.id === hoveredNode)?.y || 0) / 600 * 100 + 3}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl px-4 py-2.5 shadow-xl border border-white/60 animate-[fadeIn_0.15s_ease-out]">
            <p className="text-xs font-medium text-slate-700 whitespace-nowrap max-w-[220px] truncate">
              {nodes.find((n: Node) => n.id === hoveredNode)?.type === 'tag' 
                ? nodes.find((n: Node) => n.id === hoveredNode)?.label
                : nodes.find((n: Node) => n.id === hoveredNode)?.data?.content.substring(0, 35) + '...'
              }
            </p>
          </div>
        </div>
      )}
      
      {/* 极简图例 - 苹果风格 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-2xl rounded-full px-5 py-2 shadow-lg border border-white/60">
        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
            <span>灵感</span>
          </div>
          <div className="w-px h-3 bg-slate-300"></div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
            <span>标签</span>
          </div>
        </div>
      </div>
    </div>
  );
};
