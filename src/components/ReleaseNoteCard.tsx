import React from 'react';
import type { ReleaseNote } from '../types';
import { ConsoleWindow } from './ConsoleWindow';

interface ReleaseNoteCardProps {
  releaseNote: ReleaseNote;
}

export const ReleaseNoteCard: React.FC<ReleaseNoteCardProps> = ({ releaseNote }) => {
  return (
    <ConsoleWindow className="mb-4 sm:mb-6 md:mb-8">
      <div className="p-3 sm:p-4 md:p-6" style={{padding: '20px'}}>
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm md:text-base font-bold text-console-blue">
              {releaseNote.version}
            </span>
            {releaseNote.isNew && (
              <span className="text-[8px] sm:text-[10px] md:text-xs bg-console-red text-console-bg px-1 sm:px-2 py-0.5 rounded">
                NEW
              </span>
            )}
          </div>
          <span className="text-[8px] sm:text-[10px] md:text-xs text-console-fg/70">
            {releaseNote.date}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="text-xs sm:text-sm md:text-base font-bold mb-3 sm:mb-4 md:mb-5">
          {releaseNote.title}
        </h3>

        {/* 변경사항 목록 */}
        <div className="space-y-2 sm:space-y-3 md:space-y-4" style={{padding: '2px'}}>
          {releaseNote.changes.map((change, index) => (
            <div key={index} className="flex items-start gap-2" style={{padding: '2px'}}>
              <span className="text-xs sm:text-sm md:text-base flex-shrink-0">
                {change.type}
              </span>
              <span className="text-10px sm:text-[12px] md:text-xs text-console-fg/90">
                {change.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ConsoleWindow>
  );
};
