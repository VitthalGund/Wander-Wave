import React, { useState, useEffect, useRef } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface AutocompleteOption {
  id: string;
  name: string;
  secondary?: string;
  icon?: React.ReactNode;
}

interface AutocompleteProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: AutocompleteOption) => void;
  options: AutocompleteOption[];
  isLoading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  placeholder,
  value,
  onChange,
  onSelect,
  options,
  isLoading = false,
  icon,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && options.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    setTimeout(() => {
      if (!optionsRef.current?.contains(e.relatedTarget as Node)) {
        setIsOpen(false);
      }
    }, 100);
  };

  const handleOptionClick = (option: AutocompleteOption) => {
    onSelect(option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleOptionClick(options[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-4 py-3 ${
            icon ? "pl-10" : ""
          } border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {isOpen && (options.length > 0 || isLoading) && (
        <div
          ref={optionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading && options.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
              <LoadingSpinner size="sm" className="mx-auto mb-2" />
              Searching...
            </div>
          ) : (
            options.map((option, index) => (
              <div
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors duration-150 ${
                  index === highlightedIndex
                    ? "bg-blue-50 dark:bg-blue-900/50"
                    : "hover:bg-gray-50 dark:hover:bg-gray-600"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {option.icon && (
                    <div className="text-gray-400 dark:text-gray-500">
                      {option.icon}
                    </div>
                  )}
                  <div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {option.name}
                    </div>
                    {option.secondary && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {option.secondary}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
