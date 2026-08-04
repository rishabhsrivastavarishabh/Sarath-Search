import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Logo({
  size = 'md',
  showText = true,
  showTagline = false,
  className,
  onClick,
}: LogoProps) {
  const sizeMap = {
    sm: { img: 32, box: 'w-8 h-8 rounded-xl', text: 'text-lg', tag: 'text-[8px]' },
    md: { img: 40, box: 'w-10 h-10 rounded-2xl', text: 'text-xl', tag: 'text-[9px]' },
    lg: { img: 56, box: 'w-14 h-14 rounded-3xl', text: 'text-3xl', tag: 'text-[10px]' },
    xl: { img: 120, box: 'w-28 h-28 rounded-[2.5rem]', text: 'text-6xl', tag: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-3 select-none group',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Logo Icon Container */}
      <div
        className={cn(
          'relative overflow-hidden flex items-center justify-center bg-zinc-950 border border-white/20 shadow-xl group-hover:scale-105 transition-all duration-300',
          currentSize.box
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 via-primary/20 to-cyan-400/30 opacity-80 group-hover:opacity-100 transition-opacity" />
        <Image
          src="/logo.png"
          alt="Sarath Logo"
          width={currentSize.img}
          height={currentSize.img}
          className="relative z-10 object-contain drop-shadow-md rounded-xl"
          priority
        />
      </div>

      {/* Text Branding */}
      {showText && (
        <div className="flex flex-col">
          <div className={cn('font-extrabold tracking-tight text-white font-outfit leading-none flex items-center', currentSize.text)}>
            Sar<span className="text-purple-400">a</span>th
            <span className="ml-1.5 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold tracking-normal">
              2.O
            </span>
          </div>
          {showTagline && (
            <span className={cn('font-bold tracking-[0.25em] text-cyan-400/90 uppercase mt-1', currentSize.tag)}>
              PRIVATE • FAST • INTELLIGENT
            </span>
          )}
        </div>
      )}
    </div>
  );
}
