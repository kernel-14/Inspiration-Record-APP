import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MoodItem } from '../types';
import { SimpleMoodBubble, MoodData } from './SimpleMoodBubble';
import { PageHeader } from './PageHeader';
import { ChatDialog } from './ChatDialog';
import { apiService } from '../services/api';

interface MoodViewProps {
  items: MoodItem[];
  onClose: () => void;
  characterImageUrl?: string;
  onSendMessage: (message: string) => Promise<string>;
}

interface MoodDetailData extends MoodData {
  // 扩展字段用于详情显示
}

interface DayMoods {
  date: string;
  displayDate: string;
  moods: MoodData[];
  moodCount: number;
}

export const MoodView: React.FC<MoodViewProps> = ({ 
  items, 
  onClose, 
  characterImageUrl,
  onSendMessage 
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodDetailData | null>(null);
  const [moodsData, setMoodsData] = useState<MoodData[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 从后端加载完整的 moods 数据
  useEffect(() => {
    const loadMoodsData = async () => {
      try {
        console.log('🫧 开始加载心情数据...');
        const response = await apiService.getMoods();
        console.log('📊 后端返回的心情数据:', response);
        
        // 显示最近30天的心情
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        
        const recentMoods = response.moods
          .filter((mood: any) => {
            const timestamp = new Date(mood.timestamp).getTime();
            return timestamp >= thirtyDaysAgo;
          })
          .map((mood: any) => ({
            id: mood.record_id,
            type: mood.type,
            intensity: mood.intensity,
            timestamp: mood.timestamp,
            keywords: mood.keywords || [],
            originalText: mood.original_text || '',
          }));
        
        console.log('✨ 最终显示的心情数据:', recentMoods);
        setMoodsData(recentMoods);
      } catch (error) {
        console.error('❌ 加载心情数据失败:', error);
        const fallbackMoods = items.map(item => ({
          id: item.id,
          type: item.type,
          intensity: item.intensity * 10,
          timestamp: new Date(item.date).toISOString(),
          keywords: [],
          originalText: '',
        }));
        setMoodsData(fallbackMoods);
      }
    };

    loadMoodsData();
  }, [items]);

  // 按日期分组心情数据
  const groupedByDay = useMemo(() => {
    const groups = new Map<string, MoodData[]>();
    
    moodsData.forEach(mood => {
      const date = new Date(mood.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(mood);
    });

    // 转换为数组并排序（最新的在前）
    const result: DayMoods[] = Array.from(groups.entries())
      .map(([dateKey, moods]) => {
        const date = new Date(dateKey);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let displayDate = '';
        if (dateKey === today.toISOString().split('T')[0]) {
          displayDate = '今天';
        } else if (dateKey === yesterday.toISOString().split('T')[0]) {
          displayDate = '昨天';
        } else {
          displayDate = date.toLocaleDateString('zh-CN', { 
            month: 'long', 
            day: 'numeric',
            weekday: 'short'
          });
        }

        return {
          date: dateKey,
          displayDate,
          moods: moods.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ),
          moodCount: moods.length,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    return result;
  }, [moodsData]);

  const handleMoodClick = useCallback((mood: MoodData | null) => {
    if (mood === null) {
      setSelectedMood(null);
    } else {
      setSelectedMood(mood as MoodDetailData);
    }
  }, []);

  const handleDayCardClick = (dayData: DayMoods) => {
    if (expandedDay === dayData.date) {
      setExpandedDay(null);
    } else {
      setExpandedDay(dayData.date);
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 320; // 卡片宽度 + gap
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
    setSelectedDayIndex(index);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/90 via-pink-50/90 to-white/90 backdrop-blur-xl" />

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col items-center">
        
        {/* 页面头部 */}
        <PageHeader
          title="心情日历"
          subtitle="Your emotions, day by day"
          onBack={onClose}
          onChat={() => setIsChatOpen(true)}
          characterImageUrl={characterImageUrl}
        />

        {/* 塔罗牌式卡片轮播 */}
        <div className="flex-1 w-full max-w-md mx-auto flex flex-col items-center justify-center relative">
          {/* 空状态 */}
          {groupedByDay.length === 0 && (
            <div className="flex items-center justify-center">
              <p className="text-slate-400 text-sm">暂无心情记录</p>
            </div>
          )}

          {/* 卡片容器 */}
          {groupedByDay.length > 0 && (
            <div className="relative w-full h-[500px] flex items-center justify-center">
              {/* 卡片堆叠效果 */}
              <div className="relative w-[280px] h-full">
                {groupedByDay.map((dayData, index) => {
                  const offset = index - selectedDayIndex;
                  const isActive = index === selectedDayIndex;
                  const isPrev = offset === -1;
                  const isNext = offset === 1;
                  const isVisible = Math.abs(offset) <= 1;

                  return (
                    <div
                      key={dayData.date}
                      className={`
                        absolute inset-0 transition-all duration-500 ease-out
                        ${!isVisible ? 'opacity-0 pointer-events-none' : ''}
                        ${isActive ? 'z-30 scale-100 opacity-100' : ''}
                        ${isPrev ? 'z-20 -translate-x-[80%] scale-85 opacity-30' : ''}
                        ${isNext ? 'z-20 translate-x-[80%] scale-85 opacity-30' : ''}
                        ${!isActive && !isPrev && !isNext ? 'scale-75 opacity-0' : ''}
                      `}
                      style={{
                        transform: `
                          translateX(${offset * 80}%) 
                          scale(${isActive ? 1 : 0.85}) 
                          rotateY(${offset * 15}deg)
                        `,
                      }}
                    >
                      <button
                        onClick={() => {
                          if (isActive) {
                            handleDayCardClick(dayData);
                          } else {
                            setSelectedDayIndex(index);
                          }
                        }}
                        className={`
                          w-full h-full
                          bg-gradient-to-br from-white/80 to-purple-50/60
                          backdrop-blur-xl rounded-3xl p-6
                          border-2 border-white/50
                          shadow-2xl
                          transition-all duration-300
                          ${isActive ? 'hover:scale-105 cursor-pointer' : 'cursor-pointer'}
                        `}
                        style={{
                          boxShadow: isActive 
                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                            : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {/* 卡片内容 */}
                        <div className="flex flex-col h-full justify-between">
                          {/* 顶部：日期 */}
                          <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-700 mb-2">
                              {dayData.displayDate}
                            </h2>
                            <div className="inline-block px-3 py-1 bg-purple-100/80 rounded-full">
                              <span className="text-xs text-purple-700 font-medium">
                                {dayData.moodCount} 条
                              </span>
                            </div>
                          </div>

                          {/* 中间：心情预览 */}
                          <div className="flex-1 flex items-center justify-center py-4">
                            <div className="grid grid-cols-3 gap-2 w-full">
                              {dayData.moods.slice(0, 9).map((mood) => (
                                <div
                                  key={mood.id}
                                  className="aspect-square rounded-xl flex items-center justify-center text-xs font-medium shadow-md border-2 border-white/50"
                                  style={{
                                    backgroundColor: getMoodColor(mood.type),
                                    color: '#334155'
                                  }}
                                >
                                  {mood.type}
                                </div>
                              ))}
                              {dayData.moodCount > 9 && (
                                <div className="aspect-square rounded-xl flex items-center justify-center text-xs font-medium bg-slate-100 text-slate-600 shadow-md border-2 border-white/50">
                                  +{dayData.moodCount - 9}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 底部：提示 */}
                          {isActive && (
                            <div className="text-center animate-pulse">
                              <p className="text-xs text-slate-500">
                                点击查看气泡池
                              </p>
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* 左右导航按钮 */}
              <button
                onClick={() => setSelectedDayIndex(Math.max(0, selectedDayIndex - 1))}
                disabled={selectedDayIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                <ChevronLeft size={20} className="text-slate-700" />
              </button>

              <button
                onClick={() => setSelectedDayIndex(Math.min(groupedByDay.length - 1, selectedDayIndex + 1))}
                disabled={selectedDayIndex === groupedByDay.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                <ChevronRight size={20} className="text-slate-700" />
              </button>
            </div>
          )}

          {/* 指示器 */}
          {groupedByDay.length > 0 && (
            <div className="flex gap-2 mt-8">
              {groupedByDay.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDayIndex(index)}
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${index === selectedDayIndex 
                      ? 'w-8 bg-purple-400' 
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }
                  `}
                />
              ))}
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-8 opacity-0 animate-[fadeSlideUp_1s_ease-out_forwards] delay-500">
            <p className="text-xs text-slate-400 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full whitespace-nowrap">
              左右滑动或点击箭头切换日期
            </p>
          </div>
        </div>

      </div>

      {/* 展开的某一天详情 - 全屏气泡池 */}
      {expandedDay && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center bg-gradient-to-br from-purple-50/95 via-pink-50/95 to-white/95 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out]">
          {/* 返回按钮 */}
          <div className="w-full max-w-md mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setExpandedDay(null)}
              className="p-2 rounded-full bg-white/60 hover:bg-white/80 transition-all"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <h2 className="text-lg font-medium text-slate-700">
              {groupedByDay.find(d => d.date === expandedDay)?.displayDate}
            </h2>
            <div className="w-9" /> {/* 占位 */}
          </div>

          {/* 气泡池容器 */}
          <div className="flex-1 w-full max-w-md mx-auto relative" style={{ minHeight: '500px' }}>
            <SimpleMoodBubble
              moods={groupedByDay.find(d => d.date === expandedDay)?.moods || []}
              onMoodClick={handleMoodClick}
            />
          </div>

          {/* 提示文字 */}
          <div className="mb-32">
            <p className="text-xs text-slate-400 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full whitespace-nowrap">
              左键查看详情 · 右键取消 · 拖动互动
            </p>
          </div>
        </div>
      )}

      {/* 心情详情弹窗 */}
      {selectedMood && (
        <div className="
          fixed inset-0 z-[200] 
          flex items-center justify-center
          bg-black/30 backdrop-blur-sm
          animate-[fadeIn_0.3s_ease-out]
          p-4
        " onClick={() => setSelectedMood(null)}>
          <div 
            className="
              relative w-full max-w-sm
              bg-gradient-to-br from-white/95 to-purple-50/95
              rounded-3xl shadow-2xl
              border border-white/50
              p-6
              animate-[slideUp_0.3s_ease-out]
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button 
              onClick={() => setSelectedMood(null)}
              className="
                absolute top-4 right-4
                p-2 rounded-full
                bg-white/50 hover:bg-white/70
                text-slate-600 hover:text-slate-800
                transition-all duration-200
              "
            >
              ✕
            </button>

            {/* 内容 */}
            <div className="flex flex-col space-y-4">
              {/* 心情类型 */}
              <div className="text-center">
                <h3 className="text-3xl font-medium text-slate-700 mb-2">
                  {selectedMood.type}
                </h3>
                <p className="text-sm text-slate-500">
                  {formatDate(selectedMood.timestamp)}
                </p>
              </div>

              {/* 强度指示器 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>情绪强度</span>
                  <span className="font-medium">{selectedMood.intensity}/10</span>
                </div>
                <div className="w-full h-3 bg-slate-200/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                    style={{ width: `${(selectedMood.intensity / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* 原文内容 */}
              {selectedMood.originalText && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 font-medium">记录原文</p>
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/50">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedMood.originalText}
                    </p>
                  </div>
                </div>
              )}

              {/* 关键词 */}
              {selectedMood.keywords && selectedMood.keywords.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 font-medium">关键词</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMood.keywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-purple-100/80 text-purple-700 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 提示 */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 italic text-center">
                  "每一种情绪都值得被记录和珍惜"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 对话弹窗 */}
      <ChatDialog
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        characterImageUrl={characterImageUrl}
        onSendMessage={onSendMessage}
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

// 辅助函数：获取心情颜色
function getMoodColor(type: string): string {
  const colors: Record<string, string> = {
    '喜悦': '#FED7AA',
    '开心': '#FECACA',
    '兴奋': '#FEF08A',
    '快乐': '#FDE68A',
    '愉悦': '#FCA5A5',
    '欣喜': '#FDBA74',
    '惊喜': '#FCD34D',
    '满足': '#FBB6CE',
    '成就': '#F9A8D4',
    '希望': '#FDE047',
    '平静': '#BFDBFE',
    '放松': '#D9F99D',
    '宁静': '#A5F3FC',
    '清新': '#99F6E4',
    '温柔': '#E9D5FF',
    '温暖': '#FBCFE8',
    '充实': '#C7D2FE',
    '积极': '#BAE6FD',
    '憧憬': '#DDD6FE',
    '焦虑': '#DDD6FE',
    '紧张': '#E9D5FF',
    '悲伤': '#CBD5E1',
    '疲惫': '#E0E7FF',
    '困倦': '#F3E8FF',
    '沮丧': '#D1D5DB',
    '孤独': '#E5E7EB',
    '烦躁': '#FEE2E2',
    '感动': '#F9A8D4',
    '思念': '#C4B5FD',
    '感慨': '#D8B4FE',
  };
  return colors[type] || '#E2E8F0';
}
