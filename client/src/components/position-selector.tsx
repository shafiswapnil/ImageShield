import React from 'react';

interface PositionSelectorProps {
  selectedPosition: string;
  onPositionChange: (position: string) => void;
}

export default function PositionSelector({ 
  selectedPosition, 
  onPositionChange 
}: PositionSelectorProps) {
  return (
    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
      {/* Top row */}
      <button 
        type="button"
        onClick={() => onPositionChange('top-left')}
        className={`m-4 w-5 h-5 rounded-full ${
          selectedPosition === 'top-left' 
            ? 'bg-accent border-accent' 
            : 'bg-white/80 hover:bg-accent border-gray-300'
        } border shadow pointer-events-auto`}
        title="Top left"
      />
      <button 
        type="button"
        onClick={() => onPositionChange('top-center')}
        className={`m-4 mx-auto w-5 h-5 rounded-full ${
          selectedPosition === 'top-center' 
            ? 'bg-accent border-accent' 
            : 'bg-white/80 hover:bg-accent border-gray-300'
        } border shadow pointer-events-auto`}
        title="Top center"
      />
      <button 
        type="button"
        onClick={() => onPositionChange('top-right')}
        className={`m-4 ml-auto w-5 h-5 rounded-full ${
          selectedPosition === 'top-right' 
            ? 'bg-accent border-accent' 
            : 'bg-white/80 hover:bg-accent border-gray-300'
        } border shadow pointer-events-auto`}
        title="Top right"
      />
      
      {/* Middle row */}
      <button 
        type="button"
        onClick={() => onPositionChange('middle-left')}
        className={`m-4 self-center w-5 h-5 rounded-full ${
          selectedPosition === 'middle-left' 
            ? 'bg-accent border-accent' 
            : 'bg-white/80 hover:bg-accent border-gray-300'
        } border shadow pointer-events-auto`}
        title="Middle left"
      />
      <button 
        type="button"
        onClick={() => onPositionChange('middle-center')}
        className={`m-4 self-center mx-auto w-5 h-5 rounded-full ${
          selectedPosition === 'middle-center' 
            ? 'bg-accent border-accent' 
            : 'bg-white/80 hover:bg-accent border-gray-300'
        } border shadow pointer-events-auto`}
        title="Center"
      />
      <button 
        type="button"
        onClick={() => onPositionChange('middle-right')}
        className={`m-4 self-center ml-auto w-5 h-5 rounded-full ${
          selectedPosition === 'middle-right' 
            ? 'bg-accent border-accent' 
            : 'bg-white/80 hover:bg-accent border-gray-300'
        } border shadow pointer-events-auto`}
        title="Middle right"
      />
      
      {/* Bottom row */}
      <button 
        type="button"
        onClick={() => onPositionChange('bottom-left')}
        className={`m-4 self-end w-5 h-5 rounded-full ${
          selectedPosition === 'bottom-left' 
            ? 'bg-accent border-accent' 
            : 'bg-white/80 hover:bg-accent border-gray-300'
        } border shadow pointer-events-auto`}
        title="Bottom left"
      />
      <button 
        type="button"
        onClick={() => onPositionChange('bottom-center')}
        className={`m-4 self-end mx-auto w-5 h-5 rounded-full ${
          selectedPosition === 'bottom-center' 
            ? 'bg-accent border-accent' 
            : 'bg-white/80 hover:bg-accent border-gray-300'
        } border shadow pointer-events-auto`}
        title="Bottom center"
      />
      <button 
        type="button"
        onClick={() => onPositionChange('bottom-right')}
        className={`m-4 self-end ml-auto w-5 h-5 rounded-full ${
          selectedPosition === 'bottom-right' 
            ? 'bg-accent border-accent' 
            : 'bg-white/80 hover:bg-accent border-gray-300'
        } border shadow pointer-events-auto`}
        title="Bottom right"
      />
    </div>
  );
}
