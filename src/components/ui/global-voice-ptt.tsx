'use client';

import * as React from 'react';
import { Mic, MicOff, Loader2, Command } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function GlobalVoicePTT() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [interimText, setInterimText] = React.useState('');
  const [isSupported, setIsSupported] = React.useState(true);
  const [showNoFieldWarning, setShowNoFieldWarning] = React.useState(false);
  const [osLabel, setOsLabel] = React.useState('Ctrl');
  
  const recognitionRef = React.useRef<any>(null);
  const activeFieldRef = React.useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const isKeyDownRef = React.useRef(false);
  const isActuallyRunningRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      setOsLabel(isMac ? 'Control' : 'Ctrl');
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Push to talk typically uses false for clean chunks
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (finalTranscript && activeFieldRef.current) {
        insertTextAtCursor(activeFieldRef.current, finalTranscript + ' ');
      }
      setInterimText(currentInterim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted') return;
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied.');
      }
      stopRecording();
    };

    recognition.onstart = () => { isActuallyRunningRef.current = true; };
    recognition.onend = () => {
      isActuallyRunningRef.current = false;
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    // Keyboard Shortcuts: Ctrl + Shift
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && !isKeyDownRef.current) {
        isKeyDownRef.current = true;
        startRecording();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if ((!e.ctrlKey || !e.shiftKey) && isKeyDownRef.current) {
        isKeyDownRef.current = false;
        stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

   const insertTextAtCursor = (element: HTMLInputElement | HTMLTextAreaElement, text: string) => {
     const start = element.selectionStart || 0;
     const end = element.selectionEnd || 0;
     const oldValue = element.value;
     const newValue = oldValue.substring(0, start) + text + oldValue.substring(end);
     
     // Native property setter bypass for React
     const prototype = element instanceof HTMLInputElement 
       ? HTMLInputElement.prototype 
       : HTMLTextAreaElement.prototype;
       
     const nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
     
     if (nativeSetter) {
       nativeSetter.call(element, newValue);
     } else {
       element.value = newValue; // Fallback
     }
 
     // Re-position cursor after insertion
     element.selectionStart = element.selectionEnd = start + text.length;
     
     // Trigger events for React/Form libraries
     element.dispatchEvent(new Event('input', { bubbles: true }));
     element.dispatchEvent(new Event('change', { bubbles: true }));
     
     element.focus();
   };

  const startRecording = () => {
    const focused = document.activeElement;
    const isInput = focused instanceof HTMLInputElement || focused instanceof HTMLTextAreaElement;
    
    if (!isInput) {
      setShowNoFieldWarning(true);
      setTimeout(() => setShowNoFieldWarning(false), 3000);
      return;
    }

    activeFieldRef.current = focused as any;
    setIsRecording(true);
    setInterimText('');
    
    try {
      if (!isActuallyRunningRef.current) {
        recognitionRef.current?.start();
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'InvalidStateError')) {
        console.error('Failed to start recognition:', e);
      }
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setInterimText('');
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // ignore
    }
  };

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {/* Warning Tooltip */}
        {showNoFieldWarning && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl mb-2"
          >
            Click on a text field first, then hold the button to speak
          </motion.div>
        )}

        {/* Live Transcription Preview */}
        {isRecording && interimText && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white/90 backdrop-blur-md border border-blue-100 shadow-2xl rounded-2xl p-4 max-w-xs w-full mb-2 pointer-events-auto"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Dictating...</span>
            </div>
            <p className="text-sm text-slate-700 italic leading-relaxed truncate">
              {interimText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {/* Shortcut Hint */}
        <AnimatePresence>
          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2"
            >
              <Mic className="h-3 w-3 animate-pulse" />
              LISTENING...
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={cn(
            "h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg pointer-events-auto",
            "bg-gradient-to-br from-blue-600 to-emerald-500 hover:shadow-blue-200/50 hover:scale-105 active:scale-95",
            isRecording && "from-red-600 to-red-500 scale-110 shadow-red-200 ring-4 ring-red-100 animate-pulse"
          )}
        >
          {isRecording ? (
            <div className="flex items-end gap-[2px] h-4">
               <motion.div animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-white rounded-full" />
               <motion.div animate={{ height: [8, 20, 8] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-1 bg-white rounded-full" />
               <motion.div animate={{ height: [6, 12, 6] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.2 }} className="w-1 bg-white rounded-full" />
            </div>
          ) : (
            <Mic className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      <div className="mr-2 text-[10px] text-muted-foreground font-medium flex items-center gap-1 opacity-50">
        <div className="flex items-center gap-0.5 px-1 bg-muted rounded border lowercase">
          {osLabel} + Shift
        </div>
        Hold to speak
      </div>
    </div>
  );
}
