'use client';

interface FloatingTextProps {
  text: string;
  currentIndex: number;
}

export function FloatingText({ text, currentIndex }: FloatingTextProps) {
  const completedText = text.substring(0, currentIndex);
  const currentChar = text[currentIndex];
  const remainingText = text.substring(currentIndex + 1);

  return (
    <div className="font-mono text-lg whitespace-pre-wrap max-w-2xl mx-auto leading-relaxed">
      <span style={{ color: '#00ff00' }}>{completedText}</span>
      <span
        style={{
          color: '#ffd60a',
          fontWeight: 'bold',
          borderBottom: '2px solid #ffd60a',
          animation: 'caret-blink 530ms step-end infinite',
        }}
      >
        {currentChar}
      </span>
      <span style={{ color: '#666666' }}>{remainingText}</span>
    </div>
  );
}
