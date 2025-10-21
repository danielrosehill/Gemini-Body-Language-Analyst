
import React, { useState, useRef, MouseEvent } from 'react';
import type { TaggedImage, Tag } from '../types';
import { TrashIcon } from './icons';

interface ImageTaggerProps {
  image: TaggedImage;
  onAddTag: (image_id: string, tag: Tag) => void;
  onRemoveImage: (image_id: string) => void;
}

const ImageTagger: React.FC<ImageTaggerProps> = ({ image, onAddTag, onRemoveImage }) => {
  const [newTagInfo, setNewTagInfo] = useState<{ x: number; y: number; name: string } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setNewTagInfo({ x, y, name: '' });
  };

  const handleTagNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (newTagInfo) {
      setNewTagInfo({ ...newTagInfo, name: e.target.value });
    }
  };

  const handleTagSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTagInfo && newTagInfo.name.trim() !== '') {
      onAddTag(image.id, { x: newTagInfo.x, y: newTagInfo.y, name: newTagInfo.name.trim() });
      setNewTagInfo(null);
    }
  };

  return (
    <div className="relative group border-2 border-dashed border-gray-600 rounded-lg p-2 bg-gray-800/50">
      <div className="relative" onClick={handleImageClick}>
        <img
          ref={imageRef}
          src={URL.createObjectURL(image.file)}
          alt="User upload"
          className="w-full h-auto rounded-md cursor-crosshair"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white font-semibold text-lg">Click to tag a person</p>
        </div>
        {image.tags.map((tag, index) => (
          <div
            key={index}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${tag.x}px`, top: `${tag.y}px` }}
          >
            <div className="relative flex items-center justify-center">
                <span className="absolute w-5 h-5 bg-sky-500 rounded-full animate-ping opacity-75"></span>
                <span className="relative w-4 h-4 bg-sky-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                </span>
                <span className="absolute top-5 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-sm px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                    {tag.name}
                </span>
            </div>
          </div>
        ))}
        {newTagInfo && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 p-2"
            style={{ left: `${newTagInfo.x}px`, top: `${newTagInfo.y}px` }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleTagSubmit} className="bg-gray-800 p-2 rounded-lg shadow-2xl border border-sky-500 flex items-center gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Person's name"
                value={newTagInfo.name}
                onChange={handleTagNameChange}
                className="bg-gray-700 text-white px-2 py-1 rounded-md text-sm w-32 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button type="submit" className="text-white text-sm bg-sky-600 hover:bg-sky-500 px-2 py-1 rounded-md">
                Tag
              </button>
            </form>
          </div>
        )}
      </div>
      <button
        onClick={() => onRemoveImage(image.id)}
        className="absolute top-3 right-3 bg-red-600/80 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Remove image"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
      <div className="mt-2 text-xs text-gray-400 truncate">{image.file.name}</div>
    </div>
  );
};

export default ImageTagger;
