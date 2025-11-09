import React, { useEffect } from 'react';

const ServerErrorPage: React.FC = () => {
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const letters: string | string[] = 'ABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZ';
        const matrix = letters.split('');
        const font_size = 10;
        const columns = canvas.width / font_size;
        const drops: number[] = [];

        for (let x = 0; x < columns; x++) {
          drops[x] = 1;
        }

        const draw = () => {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#0F0';
          ctx.font = font_size + 'px arial';

          for (let i = 0; i < drops.length; i++) {
            const text = matrix[Math.floor(Math.random() * matrix.length)];
            ctx.fillText(text, i * font_size, drops[i] * font_size);

            if (drops[i] * font_size > canvas.height && Math.random() > 0.975) {
              drops[i] = 0;
            }
            drops[i]++;
          }
        };

        const interval = setInterval(draw, 33);

        return () => {
          clearInterval(interval);
        };
      }
    }
  }, []);

  return (
    <body className="bg-black bg-cover absolute overflow-hidden">
      <canvas className="fixed top-0 left-0"></canvas>
      <div className="error fixed top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[48px] font-bold text-shadow-error-shadow">
        Error 500: Unexpected Error :(
      </div>
    </body>
  );
};

export default ServerErrorPage;