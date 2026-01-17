import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export interface MoodData {
  id: string;
  type: string;
  intensity: number;
  timestamp: string;
  keywords: string[];
  originalText?: string;
}

interface SimpleMoodBubbleProps {
  moods: MoodData[];
  onMoodClick: (mood: MoodData | null) => void;
}

const COLORS: Record<string, string> = {
  // 积极情绪 - 暖色系
  '喜悦': '#FED7AA',      // 蜜桃橙
  '开心': '#FECACA',      // 珊瑚粉
  '兴奋': '#FEF08A',      // 柠檬黄
  '快乐': '#FDE68A',      // 金黄
  '愉悦': '#FCA5A5',      // 玫瑰粉
  '欣喜': '#FDBA74',      // 橘黄
  '惊喜': '#FCD34D',      // 明黄
  '满足': '#FBB6CE',      // 樱花粉
  '成就': '#F9A8D4',      // 粉紫
  '希望': '#FDE047',      // 亮黄
  
  // 平和情绪 - 冷色系
  '平静': '#BFDBFE',      // 天空蓝
  '放松': '#D9F99D',      // 青柠绿
  '宁静': '#A5F3FC',      // 青蓝
  '清新': '#99F6E4',      // 薄荷绿
  '温柔': '#E9D5FF',      // 淡紫
  '温暖': '#FBCFE8',      // 粉紫
  '充实': '#C7D2FE',      // 靛蓝
  '积极': '#BAE6FD',      // 浅蓝
  '憧憬': '#DDD6FE',      // 薰衣草
  
  // 消极情绪 - 灰色系
  '焦虑': '#DDD6FE',      // 薰衣草紫
  '紧张': '#E9D5FF',      // 淡紫
  '悲伤': '#CBD5E1',      // 灰蓝
  '疲惫': '#E0E7FF',      // 雾蓝
  '困倦': '#F3E8FF',      // 浅紫
  '沮丧': '#D1D5DB',      // 浅灰
  '孤独': '#E5E7EB',      // 银灰
  '烦躁': '#FEE2E2',      // 浅红
  
  // 复杂情绪 - 混合色
  '感动': '#F9A8D4',      // 粉紫
  '思念': '#C4B5FD',      // 紫罗兰
  '感慨': '#D8B4FE',      // 淡紫
};

export const SimpleMoodBubble: React.FC<SimpleMoodBubbleProps> = ({ moods, onMoodClick }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const selectedBubbleRef = useRef<Matter.Body | null>(null);

  useEffect(() => {
    if (!sceneRef.current || moods.length === 0) return;

    const width = sceneRef.current.clientWidth;
    const height = sceneRef.current.clientHeight;

    if (width === 0 || height === 0) {
      console.warn('⚠️ 容器尺寸为0，等待下次渲染');
      return;
    }

    console.log('🎨 初始化气泡池:', { width, height, count: moods.length });

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0.05, scale: 0.001 } });
    engineRef.current = engine;

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
      },
    });

    const walls = [
      Matter.Bodies.rectangle(width / 2, -25, width, 50, { isStatic: true, render: { visible: false } }),
      Matter.Bodies.rectangle(width / 2, height + 25, width, 50, { isStatic: true, render: { visible: false } }),
      Matter.Bodies.rectangle(-25, height / 2, 50, height, { isStatic: true, render: { visible: false } }),
      Matter.Bodies.rectangle(width + 25, height / 2, 50, height, { isStatic: true, render: { visible: false } }),
    ];
    Matter.World.add(engine.world, walls);

    const bubbles = moods.map((mood, i) => {
      const radius = 25 + (mood.intensity / 10) * 35;
      const angle = (i / moods.length) * Math.PI * 2;
      const distance = Math.min(width, height) * 0.2;
      const x = width / 2 + Math.cos(angle) * distance;
      const y = height / 2 + Math.sin(angle) * distance;
      const color = COLORS[mood.type] || '#E2E8F0';

      const bubble = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.6,
        friction: 0.01,
        frictionAir: 0.02,
        render: { fillStyle: color, strokeStyle: '#94A3B8', lineWidth: 2 },
        label: mood.id,
      });

      Matter.Body.setVelocity(bubble, {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      });

      return { body: bubble, mood };
    });

    Matter.World.add(engine.world, bubbles.map(b => b.body));

    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Matter.World.add(engine.world, mouseConstraint);

    Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
      if (event.mouse.button === 0) {
        const clicked = Matter.Query.point(bubbles.map(b => b.body), event.mouse.position)[0];
        if (clicked) {
          selectedBubbleRef.current = clicked;
          const bubble = bubbles.find(b => b.body === clicked);
          if (bubble) onMoodClick(bubble.mood);
        }
      }
    });

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (selectedBubbleRef.current) {
        selectedBubbleRef.current = null;
        console.log('✨ 取消选择气泡');
        onMoodClick(null);
      }
    };

    if (render.canvas) {
      render.canvas.addEventListener('contextmenu', handleContextMenu);
    }

    Matter.Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      bubbles.forEach(({ body, mood }) => {
        const isSelected = selectedBubbleRef.current === body;
        
        if (isSelected) {
          ctx.save();
          ctx.strokeStyle = 'rgba(147, 51, 234, 0.6)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(body.position.x, body.position.y, (body.circleRadius || 30) + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        
        ctx.save();
        ctx.fillStyle = isSelected ? '#7c3aed' : '#334155';
        ctx.font = `${Math.max(12, (body.circleRadius || 30) * 0.35)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mood.type, body.position.x, body.position.y);
        ctx.restore();
      });
    });

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    console.log('✅ 气泡池启动成功，共', bubbles.length, '个气泡');

    return () => {
      if (render.canvas) {
        render.canvas.removeEventListener('contextmenu', handleContextMenu);
      }
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, [moods, onMoodClick]);

  return <div ref={sceneRef} style={{ width: '100%', height: '100%' }} />;
};
