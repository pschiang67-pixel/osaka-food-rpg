import React, { useState, useEffect } from 'react';
import { X, Navigation, Image as ImageIcon, Play, MapPin } from 'lucide-react';

// --- 連結轉換函式 ---
const getDriveImgUrl = (input) => {
  if (!input) return null;
  let id = input;
  if (input.includes('drive.google.com') || input.includes('/d/')) {
     const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
     if (match && match[1]) {
       id = match[1];
     }
  }
  return `https://lh3.googleusercontent.com/d/${id}`;
};

// --- 像素金幣組件 ---
const PixelCoin = ({ x, y, collected }) => {
  if (collected) return null;
  return (
    <div 
      className="absolute w-5 h-5 z-10 animate-spin-pixel pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }} 
    >
      <div className="w-full h-full bg-yellow-400 border-2 border-yellow-600 rounded-sm shadow-sm flex items-center justify-center">
        <div className="w-2 h-3 bg-yellow-200 opacity-80"></div>
      </div>
    </div>
  );
};

// --- 大阪特色地標 ---
const Landmark = ({ icon, x, y, size = "text-4xl", rotate = "0", label }) => (
  <div 
    className={`absolute pointer-events-none z-0 filter drop-shadow-lg select-none flex flex-col items-center justify-center`}
    style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) rotate(${rotate}deg)` }}
  >
    <div className={`${size} transform transition-transform duration-1000 hover:scale-110`}>{icon}</div>
    {label && (
        <span className="bg-black/50 text-white text-[8px] px-1 rounded mt-1 backdrop-blur-sm font-['DotGothic16']">
            {label}
        </span>
    )}
  </div>
);

// --- 封面畫面 (Start Screen) - 手機版優化 ---
const StartScreen = ({ onStart }) => {
    // 您的首圖連結 ID
    const coverImgId = "1XPYjSHQE7hT7T1y0p8ProtFgaxRqtqm5";
    const coverUrl = getDriveImgUrl(coverImgId);

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
            {/* 背景圖片容器 - 雙層設計 */}
            <div className="absolute inset-0">
                {/* 1. 底層：模糊背景 (填滿螢幕，營造氛圍，避免黑邊) */}
                <div className="absolute inset-0 overflow-hidden">
                    <img 
                        src={coverUrl} 
                        alt="Background Blur" 
                        className="w-full h-full object-cover opacity-50 blur-lg scale-110" 
                    />
                </div>
                
                {/* 2. 中層：完整圖片 (保持比例，完整顯示照片內容) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                        src={coverUrl} 
                        alt="Osaka Cover" 
                        className="w-full h-full object-contain shadow-2xl"
                        style={{ maxHeight: '85%' }} // 預留一點空間給文字
                    />
                </div>
                
                {/* 3. 頂層：漸層遮罩 (確保文字清晰) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40"></div>
            </div>

            {/* 標題與按鈕 */}
            <div className="relative z-10 flex flex-col items-center gap-6 p-6 animate-slide-up w-full max-w-sm mt-auto mb-10">
                <div className="text-center space-y-2">
                    <span className="text-yellow-400 text-xs font-['Press_Start_2P'] tracking-widest animate-pulse shadow-black drop-shadow-md">OSAKA RPG</span>
                    <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-['DotGothic16'] leading-tight">
                        大阪<br/>大冒險
                    </h1>
                </div>

                <div className="bg-black/70 p-5 rounded-xl border border-white/30 backdrop-blur-md w-full text-center shadow-2xl">
                    <p className="text-gray-200 text-xs font-['DotGothic16'] leading-5 mb-5 font-bold tracking-wide">
                        探索道頓堀、攻略黑門市場！<br/>
                        收集所有金幣，吃遍大阪美食吧！
                    </p>
                    <button 
                        onClick={onStart}
                        className="group w-full relative px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-['Press_Start_2P'] text-sm transition-all shadow-[0_4px_0_#1e3a8a] active:translate-y-1 active:shadow-none flex items-center justify-center gap-3 rounded-lg border-t border-white/20"
                    >
                        <Play size={18} className="fill-current animate-bounce" />
                        START GAME
                    </button>
                </div>
            </div>

            {/* 底部版權 */}
            <div className="absolute bottom-4 text-[10px] text-gray-500 font-['Press_Start_2P'] z-10">
                © 2024 OSAKA TRIP
            </div>
        </div>
    );
};

// --- 主程式組件 ---
const App = () => {
  const [gameStarted, setGameStarted] = useState(false); // 控制是否顯示封面
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 90 });
  const [targetPos, setTargetPos] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState('up');
  const [score, setScore] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=DotGothic16&family=Press+Start+2P&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);
  
  const [coins, setCoins] = useState(() => {
    const initialCoins = [];
    for (let i = 0; i < 20; i++) { 
      initialCoins.push({
        id: i,
        x: Math.random() * 80 + 10, 
        y: Math.random() * 80 + 10,
        collected: false
      });
    }
    return initialCoins;
  });

  // 資料列表 - 座標已針對手機優化
  const places = [
    // --- 梅田區 (Umeda) ---
    { id: 28, name: "神座拉麵", label: "拉麵", x: 18, y: 15, region: "umeda", img: "ramen", query: "神座拉麵 梅田", driveId: "https://drive.google.com/file/d/1lzATitRHI-zSyQ6baKzvm7-ChBkduar6/view?usp=drivesdk" }, 
    { id: 29, name: "木地大阪燒", label: "大阪燒", x: 35, y: 12, region: "umeda", img: "okonomiyaki", query: "きじ木地大阪燒 梅田", driveId: "https://drive.google.com/file/d/155beOGh0yyiZvB4ID6JtQHW_zjGx3g6b/view?usp=drivesdk" },
    { id: 30, name: "551蓬萊", label: "肉包", x: 26, y: 24, region: "umeda", img: "porkbun", query: "551蓬萊 梅田", driveId: "https://drive.google.com/file/d/12oPN9BTdxjeVRYYuT0BRw7PJ2eFI0ARi/view?usp=drivesdk" },
    { id: 31, name: "堂島蛋糕卷", label: "蛋糕卷", x: 42, y: 18, region: "umeda", img: "cake", query: "堂島蛋糕卷 梅田", driveId: "https://drive.google.com/file/d/1Ws7_njtCmeIOB1e-juvXt23i8SwC4eMg/view?usp=drivesdk" },

    // --- 心齋橋 / 美國村 (Shinsaibashi) ---
    { id: 13, name: "北極星", label: "蛋包飯", x: 15, y: 30, region: "shinsai", img: "omurice", query: "北極星蛋包飯 心齋橋", driveId: "https://drive.google.com/file/d/1ytbMEx9WYLV73qlJLv3D0_3ya-diH3s2/view?usp=drivesdk" },
    { id: 14, name: "一蘭", label: "拉麵", x: 25, y: 38, region: "shinsai", img: "ramen", query: "一蘭拉麵 心齋橋", driveId: "https://drive.google.com/file/d/14-1dSy18dinF_OfJiYtKVJtZh6xvYZi8/view?usp=drivesdk" },
    { id: 15, name: "HARBS", label: "蛋糕", x: 34, y: 28, region: "shinsai", img: "crepe cake", query: "HARBS 心齋橋", driveId: "https://drive.google.com/file/d/1ESEAXx8FibDs9xb_LpW4_xQ6L_DaGL3M/view?usp=drivesdk" },
    { id: 16, name: "PABLO", label: "起司塔", x: 18, y: 44, region: "shinsai", img: "cheese tart", query: "PABLO 心齋橋", driveId: "https://drive.google.com/file/d/1MOuwqZ9A2e6dVPWhK5iUiL2keJt0P7dH/view?usp=drivesdk" },
    { id: 17, name: "宇治園", label: "抹茶", x: 28, y: 32, region: "shinsai", img: "matcha dessert", query: "宇治園本店 心齋橋", driveId: "https://drive.google.com/file/d/1GyDvo1XL63JqdzbezsW7PwBNmIBXJRv2/view?usp=drivesdk" },
    { id: 18, name: "甲賀流", label: "章魚燒", x: 8, y: 36, region: "shinsai", img: "takoyaki", query: "甲賀流章魚燒 美國村", driveId: "https://drive.google.com/file/d/1SLbFIYcr1o1GMlywW3L-BosaCDn691Ma/view?usp=drivesdk" },
    { id: 19, name: "Ice Dog", label: "甜點", x: 10, y: 46, region: "shinsai", img: "ice cream bun", query: "元祖Ice Dog 美國村", driveId: "https://drive.google.com/file/d/16-CVZsJxlD94KfBOtdu9yQ9e93kLcFEQ/view?usp=drivesdk" },

    // --- 道頓堀區 (Dotonbori) ---
    { id: 11, name: "大阪王將", label: "餃子", x: 42, y: 42, region: "doton", img: "gyoza", query: "大阪王將 道頓堀", driveId: "https://drive.google.com/file/d/1-oAqMyF5EvjMj7YrnIFWqdlNDYeii2ue/view?usp=drivesdk" },
    { id: 1, name: "達摩串炸", label: "串炸", x: 50, y: 42, region: "doton", img: "kushikatsu", query: "達摩串炸 道頓堀", driveId: "https://drive.google.com/file/d/1NukTzwA9XCcxMK3EgUCIcdmFE55wCJay/view?usp=drivesdk" },
    { id: 7, name: "今井烏龍", label: "烏龍麵", x: 58, y: 43, region: "doton", img: "udon noodle", query: "今井烏龍麵 道頓堀", driveId: "https://drive.google.com/file/d/1a92NJh67iSvfdfAlZ9VasTEcI7Kihkmy/view?usp=drivesdk" },
    { id: 10, name: "蟹道樂", label: "螃蟹", x: 66, y: 44, region: "doton", img: "crab", query: "蟹道樂 道頓堀", driveId: "https://drive.google.com/file/d/1hXL7wayAIbhvLO_sxSG8dDIWy0rqodM5/view?usp=drivesdk" },
    { id: 6, name: "肉劇場", label: "肉丼", x: 40, y: 50, region: "doton", img: "roast beef bowl", query: "道頓堀肉劇場", driveId: "https://drive.google.com/file/d/1rjm5QPGvyFqMVCFnQpaz6U4uIAWwejVm/view?usp=drivesdk" },
    { id: 2, name: "元祖章魚燒", label: "章魚燒", x: 48, y: 50, region: "doton", img: "takoyaki", query: "元祖章魚燒 道頓堀", driveId: "https://drive.google.com/file/d/1EuKLaY3rvwfVD2wH9x0JY7rIECxJIvfE/view?usp=drivesdk" },
    { id: 3, name: "金龍拉麵", label: "拉麵", x: 56, y: 50, region: "doton", img: "ramen", query: "金龍拉麵 道頓堀", driveId: "https://drive.google.com/file/d/1S9bsn-GGkFvH1lTEZYz3dggeRHLeDJA0/view?usp=drivesdk" },
    { id: 8, name: "千房", label: "大阪燒", x: 64, y: 50, region: "doton", img: "okonomiyaki", query: "千房大阪燒 道頓堀", driveId: "https://drive.google.com/file/d/1_jX5qykCsJntOIXO-Af6Bl9FpQcDxf5l/view?usp=drivesdk" },
    { id: 4, name: "四天王", label: "拉麵", x: 44, y: 57, region: "doton", img: "ramen", query: "四天王拉麵 道頓堀", driveId: "https://drive.google.com/file/d/1KF09NTbKqGZxVGQA2i3RJTwtp3QqXWA1/view?usp=drivesdk" },
    { id: 5, name: "金久右衛門", label: "拉麵", x: 52, y: 58, region: "doton", img: "soy sauce ramen", query: "金久右衛門拉麵 道頓堀", driveId: "https://drive.google.com/file/d/1bq9xVP4LOjPLGDF6cdVODsJfbc03U8wp/view?usp=drivesdk" },
    { id: 9, name: "美津濃", label: "大阪燒", x: 60, y: 57, region: "doton", img: "okonomiyaki", query: "美津濃大阪燒", driveId: "https://drive.google.com/file/d/1ggmk2CRe-Z0hVHIWlzNDHlFn4IDxmXDk/view?usp=drivesdk" },
    { id: 12, name: "大起水產", label: "壽司", x: 68, y: 59, region: "doton", img: "sushi", query: "大起水產迴轉壽司 道頓堀", driveId: "https://drive.google.com/file/d/1IWu2pirL6ULqPt3ZJ9qYlA8Z48HT0bQ4/view?usp=drivesdk" },

    // --- 黑門市場 (Kuromon) ---
    { id: 24, name: "黑門三平", label: "生魚片", x: 78, y: 60, region: "kuromon", img: "sashimi", query: "黑門三平", driveId: "https://drive.google.com/file/d/1aKPChHILwJs0yRsnJlzhztPol1hJFPSf/view?usp=drivesdk" },
    { id: 25, name: "黑銀鮪魚", label: "鮪魚", x: 86, y: 60, region: "kuromon", img: "tuna sushi", query: "黑銀鮪魚屋", driveId: "https://drive.google.com/file/d/1VmGyXkm_tOjMBfWpYoMnmC9AQyjn6mIY/view?usp=drivesdk" },
    { id: 26, name: "石橋關東煮", label: "關東煮", x: 82, y: 68, region: "kuromon", img: "oden", query: "石橋關東煮 黑門市場", driveId: "https://drive.google.com/file/d/1zINTVqVUBhn4dIOb24V_HQoPokDJ6P2Z/view?usp=drivesdk" },
    { id: 27, name: "高橋豆漿", label: "豆漿", x: 74, y: 66, region: "kuromon", img: "soy milk", query: "高橋豆漿 黑門市場", driveId: "https://drive.google.com/file/d/1XZMJXNlIS7w0w0Gva-zHNTDa95gdzycy/view?usp=drivesdk" },

    // --- 難波區 (Namba) ---
    { id: 20, name: "國產牛", label: "燒肉", x: 38, y: 68, region: "namba", img: "yakiniku", query: "國產牛燒肉 難波", driveId: "https://drive.google.com/file/d/1hfIXBxGMAAg9Ldwg6F_ubDl0kkR3VZhs/view?usp=drivesdk" },
    { id: 21, name: "自由軒", label: "咖哩", x: 50, y: 72, region: "namba", img: "curry rice", query: "自由軒 難波", driveId: "https://drive.google.com/file/d/1o6K3rvwWSeeLvRdV5YjPLe8JlnTgbPZZ/view?usp=drivesdk" },
    { id: 22, name: "老爺爺", label: "起司蛋糕", x: 45, y: 78, region: "namba", img: "cheesecake", query: "老爺爺起司蛋糕 難波", driveId: "https://drive.google.com/file/d/1Y14EOtbrnjUZaXwOiLpbdpoHD0HMs1gi/view?usp=drivesdk" },
    { id: 23, name: "會津屋", label: "章魚燒", x: 30, y: 72, region: "namba", img: "takoyaki", query: "會津屋章魚燒 難波", driveId: "https://drive.google.com/file/d/1wf0j9XFVgY-aibn_KKMEYXeKS7sWBvg1/view?usp=drivesdk" },

    // --- 新世界 / 木津市場 (Shinsekai) ---
    { id: 32, name: "八重勝", label: "串炸", x: 58, y: 88, region: "shinsekai", img: "fried skewers", query: "八重勝 串炸", driveId: "https://drive.google.com/file/d/1HWABjzmg9KUMUv7B24VSx84JU1AEkPcQ/view?usp=drivesdk" },
    { id: 33, name: "木津魚市", label: "海鮮丼", x: 32, y: 85, region: "shinsekai", img: "seafood bowl", query: "木津魚市食堂", driveId: "https://drive.google.com/file/d/1lqjIP5jFkH5qseryfWLOnnd6hm_3cAj-/view?usp=drivesdk" },
  ];

  // 遊戲循環
  useEffect(() => {
    if (targetPos) {
      setIsMoving(true);
      const moveSpeed = 1.5;
      const dx = targetPos.x - playerPos.x;
      const dy = targetPos.y - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) {
        setPlayerPos(targetPos);
        setTargetPos(null);
        setIsMoving(false);
      } else {
        if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? 'right' : 'left');
        else setDirection(dy > 0 ? 'down' : 'up');

        const angle = Math.atan2(dy, dx);
        const nextX = playerPos.x + Math.cos(angle) * moveSpeed;
        const nextY = playerPos.y + Math.sin(angle) * moveSpeed;
        
        // 金幣碰撞
        setCoins(currentCoins => 
          currentCoins.map(coin => {
            if (!coin.collected) {
              const distToCoin = Math.sqrt(
                Math.pow(coin.x - nextX, 2) + Math.pow(coin.y - nextY, 2)
              );
              if (distToCoin < 3) {
                setScore(s => s + 10);
                return { ...coin, collected: true };
              }
            }
            return coin;
          })
        );

        const timer = setTimeout(() => setPlayerPos({ x: nextX, y: nextY }), 16);
        return () => clearTimeout(timer);
      }
    }
  }, [playerPos, targetPos]);

  const handlePlaceClick = (place) => {
    setTargetPos({ x: place.x, y: place.y - 6 });
    setSelectedPlace(place);
    setImageLoading(true); // 重置載入狀態
  };

  const handleNavigate = () => {
    if (selectedPlace) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.query)}`;
      window.open(url, '_blank');
    }
  };

  // 像素角色
  const PixelCharacter = ({ dir, moving }) => {
    const transform = dir === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
    const bounce = moving ? 'animate-bounce-pixel' : '';
    
    return (
      <div 
        className={`absolute w-10 h-10 z-30 transition-transform duration-75`}
        style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%`, transform: `translate(-50%, -50%) ${transform}` }}
      >
         <svg viewBox="0 0 24 24" className={`w-full h-full drop-shadow-xl ${bounce}`}>
            <path d="M7 2h10v4h-2v2h-6V6H7V2z" fill="#D32F2F"/> 
            <path d="M7 6h10v6H7V6z" fill="#FFCC80"/> 
            <path d="M9 8h2v2H9V8zm6 0h2v2h-2V8z" fill="#000"/> 
            <path d="M8 12h8v8H8v-8z" fill="#1976D2"/> 
            <path d="M6 12h2v4H6v-4zm12 0h2v4h-2v-4z" fill="#FFCC80"/> 
            <path d="M8 20h3v4H8v-4zm5 0h3v4h-3v-4z" fill="#333"/> 
            <path d="M6 14h2v6H6v-6z" fill="#5D4037"/>
         </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#111] p-2 font-['DotGothic16'] text-white select-none relative overflow-hidden">
      
      {/* 🌟 封面判斷：如果還沒開始遊戲，就顯示 StartScreen */}
      {!gameStarted && (
         <StartScreen onStart={() => setGameStarted(true)} />
      )}

      {/* 頂部 HUD */}
      <div className="w-full max-w-lg mb-3 flex justify-between items-center bg-[#2d2d2d] px-4 py-2 rounded-lg border-b-4 border-gray-600 shadow-lg z-10">
        <div className="flex items-center gap-2">
            <div className="text-2xl animate-pulse">🐙</div>
            <div>
                <h1 className="text-sm text-yellow-400 font-['Press_Start_2P']">OSAKA QUEST</h1>
                <p className="text-[10px] text-gray-400">Map Lv.99 (All 33 Places)</p>
            </div>
        </div>
        <div className="flex gap-4 font-['Press_Start_2P'] text-[10px]">
            <div className="text-right">
                <p className="text-yellow-500">SCORE</p>
                <p>{score.toString().padStart(5, '0')}</p>
            </div>
            <div className="text-right">
                <p className="text-blue-400">COINS</p>
                <p>{coins.filter(c => c.collected).length}/{coins.length}</p>
            </div>
        </div>
      </div>

      {/* 遊戲畫面框 */}
      <div className="relative w-full max-w-lg aspect-[3/4] bg-[#222] rounded-xl border-4 border-[#444] shadow-2xl overflow-hidden z-0">
          
          {/* === 遊戲地圖 === */}
          <div className="relative w-full h-full bg-[#5c94fc] overflow-hidden">
            
            {/* 草地背景 */}
            <div className="absolute inset-0 bg-[#63c74d]"></div>
            
            {/* 裝飾：像素網格紋理 */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
            </div>

            {/* Path Layer - 鋪設土路 (Dirt Paths) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" style={{ imageRendering: 'pixelated' }}>
                <defs>
                    <pattern id="dirt" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                        <rect width="8" height="8" fill="#dcb159" />
                        <rect width="2" height="2" fill="#cda04b" x="2" y="2" />
                    </pattern>
                </defs>
                
                {/* 梅田路徑 (左上 & 右上) */}
                <rect x="20%" y="15%" width="20%" height="6%" fill="url(#dirt)" />
                <rect x="35%" y="10%" width="6%" height="15%" fill="url(#dirt)" />
                
                {/* 大阪城路徑 */}
                <rect x="40%" y="15%" width="40%" height="6%" fill="url(#dirt)" />
                <rect x="75%" y="15%" width="6%" height="15%" fill="url(#dirt)" />

                {/* 心齋橋/美國村路徑 */}
                <rect x="8%" y="35%" width="25%" height="6%" fill="url(#dirt)" />
                <rect x="15%" y="30%" width="6%" height="15%" fill="url(#dirt)" />
                
                {/* 道頓堀路徑 (主要美食街) */}
                <rect x="40%" y="45%" width="40%" height="12%" fill="url(#dirt)" />

                {/* 黑門市場路徑 */}
                <rect x="70%" y="60%" width="20%" height="6%" fill="url(#dirt)" />
                <rect x="80%" y="55%" width="6%" height="15%" fill="url(#dirt)" />

                {/* 難波/新世界路徑 */}
                <rect x="20%" y="70%" width="60%" height="6%" fill="url(#dirt)" />
                <rect x="50%" y="70%" width="6%" height="20%" fill="url(#dirt)" />
            </svg>

            {/* 河流 */}
            <div className="absolute top-[48%] left-0 w-full h-14 bg-[#4fa3fc] border-y-4 border-[#2f63a3]">
                <div className="absolute top-2 left-[10%] text-white opacity-50 text-xs">~~~</div>
                <div className="absolute top-6 left-[60%] text-white opacity-50 text-xs">~~~</div>
            </div>
            
            {/* 道路 (御堂筋 - Main Artery) */}
            <div className="absolute top-0 left-[30%] w-16 h-full bg-[#9badb7] border-x-4 border-[#84929c] opacity-90">
                {/* 道路中線 */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white border-l-2 border-dashed border-gray-400 h-full transform -translate-x-1/2 opacity-50"></div>
            </div>

            {/* === 豐富地標 === */}
            <Landmark icon="🏯" x={85} y={15} size="text-6xl" label="大阪城" />
            <Landmark icon="🎡" x={15} y={12} size="text-5xl" label="HEP FIVE" />
            <Landmark icon="🦀" x={75} y={48} size="text-4xl" rotate={-10} />
            <Landmark icon="🐙" x={15} y={68} size="text-6xl" rotate={10} />
            <Landmark icon="🗼" x={82} y={88} size="text-6xl" label="通天閣" />
            <Landmark icon="🏮" x={45} y={50} size="text-2xl" />
            <Landmark icon="🏮" x={65} y={50} size="text-2xl" />
            
            {/* 樹木裝飾 */}
            <div className="absolute top-20 left-5 text-2xl opacity-80 pointer-events-none">🌲</div>
            <div className="absolute top-32 right-10 text-2xl opacity-80 pointer-events-none">🌲</div>
            <div className="absolute bottom-20 left-8 text-2xl opacity-80 pointer-events-none">🌴</div>


            {/* === 遊戲物件 === */}
            {coins.map(coin => (
               <PixelCoin key={coin.id} x={coin.x} y={coin.y} collected={coin.collected} />
            ))}

            {places.map((place) => (
              <button
                key={place.id}
                onClick={() => handlePlaceClick(place)}
                className={`absolute group transform transition-all z-20 hover:scale-110 hover:z-30 cursor-pointer`}
                style={{ left: `${place.x}%`, top: `${place.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                 <div className={`
                   relative bg-white border-2 border-black px-1.5 py-0.5 rounded-sm shadow-[2px_2px_0px_rgba(0,0,0,0.4)]
                   ${selectedPlace?.id === place.id ? 'bg-yellow-200' : 'hover:bg-gray-50'}
                 `}>
                   <span className="text-[10px] font-bold text-black whitespace-nowrap leading-none flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${place.region === 'doton' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                      {place.name}
                   </span>
                   <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-b-2 border-r-2 border-black"></div>
                 </div>
              </button>
            ))}

            <PixelCharacter dir={direction} moving={isMoving} />
          </div>

          {/* === RPG 對話視窗 === */}
          {selectedPlace && (
            <div className="absolute bottom-2 left-2 right-2 bg-black border-4 border-white p-1 z-50 shadow-2xl animate-slide-up">
              <div className="border-2 border-white p-2 flex gap-3 relative bg-[#1a1a1a]">
                  
                  <button 
                    onClick={() => setSelectedPlace(null)} 
                    className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-500 text-white w-6 h-6 border-2 border-white flex items-center justify-center z-50"
                  >
                    <X size={14} />
                  </button>

                  {/* 圖片區：優先顯示 driveId 照片，若無則顯示 LoremFlickr */}
                  <div className="w-24 h-24 bg-gray-800 border-2 border-gray-500 overflow-hidden flex-shrink-0 relative">
                     {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                           <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        </div>
                     )}
                     <img 
                        src={
                            selectedPlace.driveId 
                            ? getDriveImgUrl(selectedPlace.driveId) 
                            : `https://loremflickr.com/200/200/${selectedPlace.img},food/all?lock=${selectedPlace.id}`
                        }
                        alt={selectedPlace.name}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                        onLoad={() => setImageLoading(false)}
                        onError={(e) => {
                            e.target.style.display='none';
                            setImageLoading(false);
                        }}
                     />
                     <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <ImageIcon size={24} className="text-gray-600"/>
                     </div>
                  </div>

                  {/* 文字區 */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                          <div className="flex justify-between items-start">
                              <h3 className="text-yellow-400 text-sm font-bold tracking-widest">{selectedPlace.name}</h3>
                              <span className="text-[10px] text-gray-400 bg-gray-800 px-1 border border-gray-600">{selectedPlace.label}</span>
                          </div>
                          <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">
                             {selectedPlace.driveId ? "★ 使用者自訂相簿" : "網路由 LoremFlickr 提供"} <br/>
                             位於 {selectedPlace.region.toUpperCase()} 區域。
                          </p>
                      </div>
                      
                      <button 
                          onClick={handleNavigate}
                          className="w-full bg-blue-700 hover:bg-blue-600 text-white text-[10px] py-1.5 border-2 border-white shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 mt-1 font-['Press_Start_2P']"
                      >
                          <Navigation size={10} />
                          NAVIGATE
                      </button>
                  </div>
              </div>
            </div>
          )}

      </div>

      {/* 底部提示 */}
      <div className="mt-3 text-[10px] text-gray-500 font-['Press_Start_2P'] animate-pulse">
         CLICK MAP TO MOVE • COLLECT ALL COINS!
      </div>

      {/* 靜態 CSS */}
      <style>{`
        @keyframes bounce-pixel {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }
        .animate-bounce-pixel { animation: bounce-pixel 0.2s infinite; }
        
        @keyframes spin-pixel {
            0%, 100% { transform: translate(-50%, -50%) scaleX(1); }
            50% { transform: translate(-50%, -50%) scaleX(0.1); }
        }
        .animate-spin-pixel { animation: spin-pixel 0.8s infinite steps(4); }
        
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default App;
