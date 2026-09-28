import React, { useState } from 'react';
import { Delete, History } from 'lucide-react';

export const EncantosCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPrevVal(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const performOp = (nextOp: string) => {
    const inputNum = parseFloat(display);

    if (prevVal === null) {
      setPrevVal(inputNum);
    } else if (operator) {
      const current = prevVal || 0;
      let computed = current;
      if (operator === '+') computed = current + inputNum;
      if (operator === '-') computed = current - inputNum;
      if (operator === '×') computed = current * inputNum;
      if (operator === '÷') computed = inputNum !== 0 ? current / inputNum : 0;

      setPrevVal(computed);
      setDisplay(String(computed));
    }

    setWaitingForOperand(true);
    setOperator(nextOp);
  };

  const handleEquals = () => {
    const inputNum = parseFloat(display);
    if (operator && prevVal !== null) {
      let computed = prevVal;
      if (operator === '+') computed = prevVal + inputNum;
      if (operator === '-') computed = prevVal - inputNum;
      if (operator === '×') computed = prevVal * inputNum;
      if (operator === '÷') computed = inputNum !== 0 ? prevVal / inputNum : 0;

      setDisplay(String(computed));
      setPrevVal(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 text-slate-200 select-none overflow-hidden p-4">
      {/* Screen */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-right mb-4">
        <div className="text-[11px] text-slate-500 font-mono h-4">
          {prevVal !== null && operator ? `${prevVal} ${operator}` : ''}
        </div>
        <div className="text-2xl font-bold font-mono text-white truncate">{display}</div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2 flex-1 text-sm font-semibold">
        <button onClick={clear} className="p-3 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl transition-colors">C</button>
        <button onClick={() => setDisplay(String(-parseFloat(display)))} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">±</button>
        <button onClick={() => setDisplay(String(parseFloat(display) / 100))} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">%</button>
        <button onClick={() => performOp('÷')} className="p-3 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 rounded-xl transition-colors">÷</button>

        <button onClick={() => inputDigit('7')} className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-colors">7</button>
        <button onClick={() => inputDigit('8')} className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-colors">8</button>
        <button onClick={() => inputDigit('9')} className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-colors">9</button>
        <button onClick={() => performOp('×')} className="p-3 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 rounded-xl transition-colors">×</button>

        <button onClick={() => inputDigit('4')} className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-colors">4</button>
        <button onClick={() => inputDigit('5')} className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-colors">5</button>
        <button onClick={() => inputDigit('6')} className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-colors">6</button>
        <button onClick={() => performOp('-')} className="p-3 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 rounded-xl transition-colors">-</button>

        <button onClick={() => inputDigit('1')} className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-colors">1</button>
        <button onClick={() => inputDigit('2')} className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-colors">2</button>
        <button onClick={() => inputDigit('3')} className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-colors">3</button>
        <button onClick={() => performOp('+')} className="p-3 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 rounded-xl transition-colors">+</button>

        <button onClick={() => inputDigit('0')} className="p-3 col-span-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-colors">0</button>
        <button onClick={inputDot} className="p-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-colors">.</button>
        <button onClick={handleEquals} className="p-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-md shadow-violet-600/30 transition-colors">=</button>
      </div>
    </div>
  );
};
