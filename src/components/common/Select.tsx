import { useState, useRef, useEffect } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function Select({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...', 
  className = '',
  disabled = false 
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-option]')
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex, isOpen])

  // Reset highlighted index when opening
  useEffect(() => {
    if (isOpen) {
      const currentIndex = options.findIndex(opt => opt.value === value)
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0)
    }
  }, [isOpen, options, value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (isOpen && highlightedIndex >= 0) {
          const opt = options[highlightedIndex]
          if (!opt.disabled) {
            onChange(opt.value)
            setIsOpen(false)
          }
        } else {
          setIsOpen(true)
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setHighlightedIndex(prev => {
            let next = prev + 1
            while (next < options.length && options[next].disabled) next++
            return next < options.length ? next : prev
          })
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setHighlightedIndex(prev => {
            let next = prev - 1
            while (next >= 0 && options[next].disabled) next--
            return next >= 0 ? next : prev
          })
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return
    onChange(option.value)
    setIsOpen(false)
  }

  return (
    <div 
      ref={containerRef}
      className={`select-container ${className}`}
      style={{ position: 'relative', width: '100%' }}
    >
      <button
        type="button"
        className={`select-trigger ${isOpen ? 'select-trigger-open' : ''} ${disabled ? 'select-disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '12px 40px 12px 16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontSize: '0.95rem',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px var(--accent-light)' : 'none',
          borderColor: isOpen ? 'var(--accent)' : 'var(--border)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span style={{ 
          display: 'block', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          paddingRight: '8px'
        }}>
          {selectedOption?.label || placeholder}
        </span>
        <span style={{
          position: 'absolute',
          right: '14px',
          top: '50%',
          transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0'})`,
          transition: 'transform 0.2s ease',
          color: 'var(--text-tertiary)',
          fontSize: '0.75rem',
          pointerEvents: 'none',
        }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          className="select-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
            zIndex: 1000,
            maxHeight: '280px',
            overflowY: 'auto',
            padding: '6px',
            animation: 'selectDropdownFadeIn 0.15s ease',
          }}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              role="option"
              data-option
              aria-selected={option.value === value}
              aria-disabled={option.disabled}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.15s ease',
                background: index === highlightedIndex 
                  ? 'var(--accent-light)' 
                  : option.value === value 
                    ? 'rgba(131, 83, 255, 0.08)' 
                    : 'transparent',
                color: option.disabled 
                  ? 'var(--text-tertiary)' 
                  : option.value === value 
                    ? 'var(--accent)' 
                    : 'var(--text-primary)',
                fontWeight: option.value === value ? 500 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: option.disabled ? 0.5 : 1,
              }}
            >
              <span style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}>
                {option.label}
              </span>
              {option.value === value && (
                <span style={{ 
                  color: 'var(--accent)', 
                  fontSize: '0.85rem',
                  marginLeft: '8px',
                  flexShrink: 0,
                }}>
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes selectDropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .select-dropdown::-webkit-scrollbar {
          width: 6px;
        }
        
        .select-dropdown::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .select-dropdown::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 3px;
        }
        
        .select-dropdown::-webkit-scrollbar-thumb:hover {
          background: var(--text-tertiary);
        }
        
        .select-trigger:hover:not(:disabled) {
          border-color: var(--border-hover);
        }
        
        .select-trigger:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-light);
        }
      `}</style>
    </div>
  )
}
