import { useRef, useEffect, useCallback } from 'react';

export interface CaptchaSolver {
  code: string;             // 当前验证码答案
  render: (canvas: HTMLCanvasElement | null) => void;
  verify: (input: string) => boolean;
  rotate: () => void;       // 换一张
}

const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const randChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];
const randCode = (n = 4) => Array.from({ length: n }, randChar).join('');

/** 模拟广州市住建局图形验证码：本地生成、本地校验，演示"自动解算"流程。 */
export function useCaptcha(): CaptchaSolver {
  const codeRef = useRef(randCode());
  const draw = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    ctx.fillStyle = '#e8edf2';
    ctx.fillRect(0, 0, w, h);
    // 干扰线
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 120 + 80},${Math.random() * 120 + 80},${Math.random() * 200 + 40},0.45)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.stroke();
    }
    // 干扰点
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = `rgba(80,80,80,0.35)`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // 字符
    const code = codeRef.current;
    ctx.font = `bold ${Math.round(h * 0.62)}px Georgia, serif`;
    ctx.textBaseline = 'middle';
    const step = w / (code.length + 1);
    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = step * (i + 1) - step / 2;
      ctx.translate(x, h / 2 + (Math.random() - 0.5) * 4);
      ctx.rotate((Math.random() - 0.5) * 0.6);
      ctx.fillStyle = `hsl(${Math.floor(Math.random() * 40 + 200)},60%,30%)`;
      ctx.fillText(code[i], -ctx.measureText(code[i]).width / 2, 0);
      ctx.restore();
    }
  }, []);

  useEffect(() => { /* keep ref stable */ }, []);

  return {
    code: codeRef.current,
    render: draw,
    verify: (input) => input.toUpperCase() === codeRef.current,
    rotate: () => { codeRef.current = randCode(); },
  };
}

/** 关键字预填：项目名/开发商/地址三个关键字拼出官方搜索查询。 */
export function buildOfficialSearchQuery(buildingNameKeyword: string, developerKeyword: string, addressKeyword: string) {
  return [buildingNameKeyword, developerKeyword, addressKeyword].filter(Boolean).join('+');
}
