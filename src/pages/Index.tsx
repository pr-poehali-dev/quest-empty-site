import { useEffect, useState, useRef } from "react";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // Плавное появление текста
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    // Создание атмосферного звука воздуха
    const createWindSound = () => {
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        // Создаём белый шум для имитации звука воздуха
        const bufferSize = 4096;
        const noiseBuffer = audioContext.createBuffer(
          1,
          bufferSize,
          audioContext.sampleRate,
        );
        const output = noiseBuffer.getChannelData(0);

        // Генерируем белый шум
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        // Создаём источник шума
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        // Создаём фильтр для придания естественности
        const filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, audioContext.currentTime);
        filter.Q.setValueAtTime(0.3, audioContext.currentTime);

        // Создаём узел усиления
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNodeRef.current = gainNode;

        // Соединяем узлы
        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Запускаем звук
        noiseSource.start();

        // Добавляем модуляцию для более реалистичного звука ветра
        const lfo = audioContext.createOscillator();
        lfo.frequency.setValueAtTime(0.1, audioContext.currentTime);
        lfo.type = "sine";

        const lfoGain = audioContext.createGain();
        lfoGain.gain.setValueAtTime(0.02, audioContext.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        lfo.start();
      } catch (error) {
        console.log("Audio context not available");
      }
    };

    // Запускаем звук после первого клика пользователя
    const handleFirstInteraction = () => {
      createWindSound();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      clearTimeout(timer);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center overflow-hidden relative">
      {/* Подсказка для включения звука */}
      <div className="absolute top-4 left-4 text-white/30 text-sm">
        Нажмите в любое место для включения звука
      </div>

      <div className="text-center">
        <h1
          className={`text-white font-extralight tracking-[0.5em] transition-all duration-2000 select-none ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{
            fontSize: "clamp(3rem, 8vw, 8rem)",
            fontFamily: "Caveat, cursive",
            textShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
            animation: isVisible ? "pulse 4s ease-in-out infinite" : "none",
          }}
        >
          пустота
        </h1>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Caveat:wght@300;400;700&display=swap");

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          }
          50% {
            opacity: 0.7;
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
          }
        }

        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          cursor: none;
        }

        * {
          cursor: none !important;
        }
      `}</style>
    </div>
  );
};

export default Index;
