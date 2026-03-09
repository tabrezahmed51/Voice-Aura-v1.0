
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X, Check, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Option<T> {
  value: T;
  label: string;
}

export interface OptionGroup<T> {
  label: string;
  options: Option<T>[];
}

export interface SelectorProps<T extends string | number> {
  id: string;
  label?: string;
  value: T;
  options: Array<Option<T> | OptionGroup<T>>;
  onChange: (value: T) => void;
  disabled?: boolean;
}

function isOptionGroup<T>(o: Option<T> | OptionGroup<T>): o is OptionGroup<T> {
  return (o as any).options !== undefined;
}

export default function Selector<T extends string | number>(props: SelectorProps<T>) {
    const { label, value, options, onChange, disabled, id } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Find current label
    let currentLabel = '';
    for (const opt of options) {
        if (isOptionGroup(opt)) {
            const found = opt.options.find(o => o.value === value);
            if (found) {
                currentLabel = found.label;
                break;
            }
        } else {
            if (opt.value === value) {
                currentLabel = opt.label;
                break;
            }
        }
    }

    const handleSelect = (val: T) => {
        onChange(val);
        setIsOpen(false);
    };

    // Flatten options for rendering if needed, but we'll render groups
    
    return (
        <div className="flex flex-col space-y-1.5 w-full relative group">
            {label && (
                <label htmlFor={id} className="text-[10px] sm:text-xs font-mono font-bold text-text-dim uppercase tracking-wider pl-1 group-hover:text-accent transition-colors">
                    {label}
                </label>
            )}
            
            <button
                id={id}
                onClick={() => !disabled && setIsOpen(true)}
                disabled={disabled}
                className={`w-full bg-black border text-[10px] sm:text-[11px] rounded-lg pl-3 pr-8 py-2 font-mono text-left transition-all duration-200 outline-none uppercase tracking-wider relative flex items-center
                    ${disabled ? 'opacity-50 cursor-not-allowed border-tension-line/20' : 'cursor-pointer hover:bg-carbon-base hover:border-accent focus:border-accent focus:shadow-[0_0_15px_var(--accent-dim)]'}
                    border-tension-line/30 text-accent shadow-inner
                `}
            >
                <span className="truncate block w-full">{currentLabel || String(value)}</span>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-accent opacity-70">
                    <ChevronDown size={14} />
                </div>
            </button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                            {/* Backdrop */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />

                            {/* Modal Content */}
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                                transition={{ type: "spring", duration: 0.3 }}
                                className="relative w-full max-w-sm bg-black/90 backdrop-blur-md border border-cyan-500/50 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col max-h-[80vh]"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-3 border-b border-cyan-500/20 bg-cyan-950/10">
                                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono neon-text">
                                        {label || 'Select Option'}
                                    </span>
                                    <button 
                                        onClick={() => setIsOpen(false)}
                                        className="text-cyan-400/50 hover:text-cyan-400 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Options List */}
                                <div className="overflow-y-auto p-2 custom-scrollbar space-y-1">
                                    {options.map((optionOrGroup, idx) => {
                                        if (isOptionGroup(optionOrGroup)) {
                                            if (optionOrGroup.options.length === 0) return null;
                                            return (
                                                <div key={`group-${idx}`} className="mb-2">
                                                    <div className="px-2 py-1 text-[9px] font-bold text-cyan-400/50 uppercase tracking-widest font-mono mb-1">
                                                        {optionOrGroup.label}
                                                    </div>
                                                    <div className="space-y-1 pl-1">
                                                        {optionOrGroup.options.map((option) => (
                                                            <OptionItem 
                                                                key={String(option.value)} 
                                                                option={option} 
                                                                isSelected={option.value === value} 
                                                                onSelect={() => handleSelect(option.value)} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <OptionItem 
                                                    key={String(optionOrGroup.value)} 
                                                    option={optionOrGroup} 
                                                    isSelected={optionOrGroup.value === value} 
                                                    onSelect={() => handleSelect(optionOrGroup.value)} 
                                                />
                                            );
                                        }
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

function OptionItem<T>({ option, isSelected, onSelect }: { option: Option<T>, isSelected: boolean, onSelect: () => void }) {
    return (
        <button
            onClick={onSelect}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 group
                ${isSelected 
                    ? 'bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                    : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                }
            `}
        >
            <span className={`text-xs font-mono transition-colors ${isSelected ? 'text-cyan-400 font-bold neon-text' : 'text-gray-400 group-hover:text-cyan-300'}`}>
                {option.label}
            </span>
            
            <div className={`flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-300
                ${isSelected 
                    ? 'border-cyan-400 bg-cyan-400 shadow-[0_0_8px_var(--accent)]' 
                    : 'border-gray-600 group-hover:border-cyan-500/50'
                }
            `}>
                {isSelected && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
            </div>
        </button>
    );
}
