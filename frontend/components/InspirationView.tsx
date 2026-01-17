import React, { useState, useMemo } from 'react';
import { Sparkles, Tag, X } from 'lucide-react';
import { InspirationItem } from '../types';
import { InspirationCard } from './InspirationCard';
import { PageHeader } from './PageHeader';
import { ChatDialog } from './ChatDialog';
import { AddInspirationDialog } from './AddInspirationDialog';

interface InspirationViewProps {
  items: InspirationItem[];
  onClose: () => void;
  onAdd?: (content: string, isVoice: boolean) => Promise<void>;
  characterImageUrl?: string;
  onSendMessage: (message: string) => Promise<string>;
}

// 标签颜色映射
const TAG_COLORS: Record<string, string> = {
  '随想': 'bg-purple-100 text-purple-700 border-purple-200',
  '自然': 'bg-green-100 text-green-700 border-green-200',
  '设计': 'bg-pink-100 text-pink-700 border-pink-200',
  '创意': 'bg-orange-100 text-orange-700 border-orange-200',
  '生活': 'bg-blue-100 text-blue-700 border-blue-200',
  '提醒': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  '工作': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '学习': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  '友情': 'bg-rose-100 text-rose-700 border-rose-200',
  '成长': 'bg-lime-100 text-lime-700 border-lime-200',
};

export const InspirationView: React.FC<InspirationViewProps> = ({ 
  items, 
  onClose, 
  onAdd,
  characterImageUrl,
  onSendMessage 
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const handleAddInspiration = async (content: string, isVoice: boolean) => {
    if (onAdd) {
      await onAdd(content, isVoice);
    }
  };

  // 获取所有标签及其计数
  const tagStats = useMemo(() => {
    const stats = new Map<string, number>();
    items.forEach(item => {
      item.tags.forEach(tag => {
        stats.set(tag, (stats.get(tag) || 0) + 1);
      });
    });
    return Array.from(stats.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  // 筛选后的灵感
  const filteredItems = useMemo(() => {
    if (selectedTags.length === 0) return items;
    return items.filter(item => 
      selectedTags.some(tag => item.tags.includes(tag))
    );
  }, [items, selectedTags]);

  // 切换标签选择
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 清除所有筛选
  const clearFilters = () => {
    setSelectedTags([]);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col animate-[fadeIn_0.5s_ease-out]">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/95 via-pink-50/95 to-white/95 backdrop-blur-xl" />

      {/* 页面头部 */}
      <PageHeader
        title="灵感记录"
        subtitle="A thought worth keeping"
        onBack={onClose}
        onChat={() => setIsChatOpen(true)}
        characterImageUrl={characterImageUrl}
      />

      {/* 标签筛选区域 - Notion 风格 */}
      <div className="relative z-10 px-6 mb-4">
        <div className="w-full max-w-md mx-auto">
          {/* 标签筛选标题 */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              <Tag size={16} />
              <span className="font-medium">按标签筛选</span>
              {selectedTags.length > 0 && (
                <span className="text-xs text-slate-400">
                  ({selectedTags.length} 个已选)
                </span>
              )}
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isTagsExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {selectedTags.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                清除筛选
              </button>
            )}
          </div>

          {/* 标签列表 - 可折叠 */}
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${isTagsExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="flex flex-wrap gap-2 pb-3">
              {tagStats.map(({ tag, count }) => {
                const isSelected = selectedTags.includes(tag);
                
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`
                      group relative px-3 py-1.5 rounded-lg text-xs font-medium
                      border transition-all duration-200
                      ${isSelected 
                        ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-sm scale-105' 
                        : 'bg-white/60 text-slate-600 border-slate-200 hover:bg-white/80'
                      }
                    `}
                  >
                    <span className="flex items-center gap-1.5">
                      {tag}
                      <span className={`
                        text-[10px] px-1.5 py-0.5 rounded-full
                        ${isSelected 
                          ? 'bg-purple-200/60 text-purple-700' 
                          : 'bg-slate-100'
                        }
                      `}>
                        {count}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 筛选结果统计 */}
          <div className="text-xs text-slate-500">
            显示 {filteredItems.length} / {items.length} 条灵感
          </div>
        </div>
      </div>

      {/* 灵感列表 */}
      <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar scroll-smooth px-6 pt-2 pb-32">
        <div className="w-full max-w-md mx-auto flex flex-col gap-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <InspirationCard key={item.id} item={item} index={index} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-40">
              {selectedTags.length > 0 ? (
                <>
                  <Tag size={32} className="text-purple-300 mb-4" strokeWidth={1} />
                  <p className="text-slate-400 font-light tracking-wide">没有匹配的灵感</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    清除筛选条件
                  </button>
                </>
              ) : (
                <>
                  <Sparkles size={32} className="text-purple-300 mb-4 animate-pulse" strokeWidth={1} />
                  <p className="text-slate-400 font-light tracking-wide">等待灵感的火花...</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-24 right-6 z-30 opacity-0 animate-[fadeSlideUp_0.8s_ease-out_forwards] delay-300">
        <button 
          onClick={() => setIsAddDialogOpen(true)}
          className="
            group relative flex items-center justify-center w-14 h-14 
            bg-white/60 backdrop-blur-xl rounded-full shadow-lg shadow-purple-100/50
            ring-1 ring-white/60 text-purple-400
            hover:bg-white/80 hover:text-purple-500 hover:scale-105
            active:scale-95 transition-all duration-500
          "
        >
          <Sparkles size={22} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform duration-500" />
        </button>
      </div>

      {/* 添加灵感对话框 */}
      <AddInspirationDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddInspiration}
      />

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
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};