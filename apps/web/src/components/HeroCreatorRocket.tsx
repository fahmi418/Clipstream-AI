import React from "react";

export function HeroCreatorRocket({ className = "" }: { className?: string }) {
  return (
    <div
      className={`hidden lg:block ${className}`}
      style={{
        position: "absolute",
        top: "clamp(5rem, 14vh, 9rem)",
        right: "clamp(1rem, 3vw, 4rem)",
        width: "420px",
        maxWidth: "28vw",
        pointerEvents: "none",
        zIndex: 1,
        userSelect: "none",
      }}
    >
      <div className="gsap-hero-rocket-inner" style={{ width: "100%", height: "100%" }}>
        <svg
          viewBox="0 0 480 430"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", overflow: "visible" }}
        >
        <defs>
          <filter id="card-soft-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* ── 1. BACKGROUND KINETIC SPEED & FILM TRAILS ── */}
        <g stroke="#111111" strokeWidth="2" strokeLinecap="round" opacity="0.3">
          <path d="M 50 395 C 110 365, 170 335, 230 310" strokeDasharray="5 7" />
          <path d="M 25 370 C 85 335, 155 300, 220 280" strokeDasharray="4 6" />
          <path d="M 85 415 C 150 385, 215 350, 275 325" strokeDasharray="6 8" />
        </g>

        {/* Dynamic Film Ribbon Streaming from Thruster */}
        <path
          d="M 45 345 C 95 315, 135 335, 175 290 C 205 255, 225 270, 260 235"
          stroke="#111111"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 60 360 C 110 330, 150 350, 190 305 C 220 270, 240 285, 275 250"
          stroke="#111111"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Film sprocket ticks along ribbon */}
        {[
          { x: 80, y: 335 },
          { x: 115, y: 330 },
          { x: 150, y: 320 },
          { x: 185, y: 285 },
          { x: 220, y: 268 },
          { x: 255, y: 242 },
        ].map((pt, i) => (
          <line
            key={i}
            x1={pt.x}
            y1={pt.y}
            x2={pt.x + 7}
            y2={pt.y + 11}
            stroke="#111111"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}

        {/* ── 2. JET THRUSTER EXHAUST & FLAME ── */}
        <g>
          {/* Outer primary jet flame */}
          <path
            d="M 160 320 C 130 350, 105 385, 90 415 C 130 385, 160 370, 185 350 C 165 385, 150 415, 135 435 C 175 390, 200 360, 215 330 Z"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Inner core flame with soft amber accent */}
          <path
            d="M 170 335 C 150 360, 130 385, 120 405 C 145 385, 165 375, 180 360 Z"
            fill="#fef3c7"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Kinetic hatch marks */}
          <line x1="140" y1="360" x2="125" y2="385" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          <line x1="165" y1="350" x2="152" y2="375" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Rocket Film Reel Thruster Flange */}
        <ellipse
          cx="210"
          cy="312"
          rx="22"
          ry="38"
          transform="rotate(-42 210 312)"
          fill="#ffffff"
          stroke="#111111"
          strokeWidth="2.5"
        />
        <ellipse
          cx="210"
          cy="312"
          rx="10"
          ry="18"
          transform="rotate(-42 210 312)"
          fill="#f3f4f6"
          stroke="#111111"
          strokeWidth="2"
        />

        {/* ── 3. ROCKET FUSELAGE & VIDEO TECH CRAFT ── */}
        <g>
          {/* Main streamlined rocket fuselage */}
          <path
            d="M 212 308 C 228 275, 275 195, 365 125 C 382 112, 395 106, 408 100 C 398 120, 375 185, 310 248 C 265 292, 225 315, 212 308 Z"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Nose cone tip in solid ink with subtle highlight */}
          <path
            d="M 378 116 C 396 104, 408 100, 412 96 C 404 116, 386 135, 375 142 Z"
            fill="#111111"
          />

          {/* Video Camera Lens / Porthole Aperture on Rocket Body */}
          <circle cx="322" cy="188" r="15" fill="#ffffff" stroke="#111111" strokeWidth="2.5" />
          <circle cx="322" cy="188" r="10" fill="#f9fafb" stroke="#111111" strokeWidth="1.5" />
          <circle cx="322" cy="188" r="6" fill="#111111" />
          {/* Play triangle inside aperture */}
          <polygon points="320,184 326,188 320,192" fill="#ffffff" />

          {/* Circuit / Tech Lines on fuselage */}
          <g stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="255,270 278,248 300,248" />
            <circle cx="300" cy="248" r="2.5" fill="#111111" />
            <polyline points="275,285 295,265 320,265 330,250" />
            <circle cx="330" cy="250" r="2.5" fill="#111111" />
          </g>

          {/* Lower Aerodynamic Stabilizer Fin */}
          <path
            d="M 220 318 L 210 358 L 260 325 L 254 290 Z"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line x1="230" y1="328" x2="234" y2="348" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          <line x1="242" y1="318" x2="246" y2="336" stroke="#111111" strokeWidth="2" strokeLinecap="round" />

          {/* Upper Stabilizer Fin */}
          <path
            d="M 318 168 L 338 120 L 354 142 Z"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>

        {/* ── 4. NEATENED CREATOR FIGURE (Proper Anatomy, Hoodie, Headphones) ── */}
        <g>
          {/* Creator Legs seated comfortably on rocket */}
          {/* Back thigh & bent leg */}
          <path
            d="M 270 235 C 285 248, 298 252, 312 248 C 305 240, 295 230, 282 225 Z"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Front leg wrapped naturally over rocket fuselage */}
          <path
            d="M 260 215 C 275 230, 285 235, 298 226 C 290 215, 278 208, 268 206 Z"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Sneaker footwear with rubber sole */}
          <path
            d="M 310 248 L 322 250 C 324 254, 320 258, 314 256 L 306 252 Z"
            fill="#111111"
            stroke="#111111"
            strokeWidth="1.5"
          />

          {/* Creator Torso & Hoodie / Jacket */}
          <path
            d="M 252 208 C 255 175, 260 148, 275 138 C 286 142, 290 165, 284 195 C 278 212, 264 216, 252 208 Z"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Hoodie pocket pouch & fold lines */}
          <path
            d="M 260 178 C 268 184, 274 184, 282 178"
            stroke="#111111"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <line x1="268" y1="145" x2="266" y2="160" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
          <line x1="272" y1="145" x2="270" y2="162" stroke="#111111" strokeWidth="2" strokeLinecap="round" />

          {/* Forward Arm (Reaching toward the stars / pointing enthusiastically) */}
          <path
            d="M 276 150 C 302 138, 328 122, 350 96 C 354 100, 348 108, 338 116 C 318 134, 298 152, 278 162 Z"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Detailed Hand with pointing index finger */}
          <path
            d="M 350 96 C 356 88, 362 82, 366 78 C 368 82, 364 88, 358 94 C 356 97, 352 101, 348 102 Z"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Left Arm holding modern creator smartphone */}
          <path
            d="M 260 152 C 242 152, 232 165, 234 180 C 238 180, 246 172, 254 165 Z"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Smartphone device */}
          <g transform="rotate(-18 226 172)">
            <rect
              x="218"
              y="158"
              width="18"
              height="28"
              rx="4"
              fill="#ffffff"
              stroke="#111111"
              strokeWidth="2"
            />
            {/* Red record indicator dot */}
            <circle cx="227" cy="168" r="3.5" fill="#e8400d" />
            <line x1="223" y1="178" x2="231" y2="178" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Creator Head & Face Profile */}
          <circle cx="282" cy="116" r="18" fill="#ffffff" stroke="#111111" strokeWidth="2.5" />

          {/* Studio Headphones */}
          <path
            d="M 270 114 C 270 98, 294 98, 294 114"
            stroke="#111111"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="266" y="108" width="7" height="14" rx="3.5" fill="#111111" />
          <rect x="291" y="108" width="7" height="14" rx="3.5" fill="#111111" />

          {/* Stylized Facial Features (Confident Wink & Joyful Smile) */}
          <path d="M 278 114 L 283 114" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="288" cy="114" r="1.5" fill="#111111" />
          <path
            d="M 280 122 C 284 127, 290 125, 292 121"
            stroke="#111111"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* ── 5. FLOATING CREATOR & WEB3 ECOSYSTEM BADGES ── */}

        {/* Floating Earning Pill: +$42.50 USDT */}
        <g transform="translate(305, 275)" filter="url(#card-soft-shadow)">
          <rect
            x="0"
            y="0"
            width="96"
            height="26"
            rx="13"
            fill="#ffffff"
            stroke="#111111"
            strokeWidth="1.5"
          />
          <circle cx="13" cy="13" r="4.5" fill="#00d084" />
          <text
            x="24"
            y="17"
            fill="#111111"
            fontSize="11"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            +$42.50 USDT
          </text>
        </g>

        {/* Floating BNB Gold Diamond Star */}
        <g transform="translate(385, 55)">
          <polygon
            points="14,0 28,14 14,28 0,14"
            fill="#fffbeb"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <polygon points="14,6 22,14 14,22 6,14" fill="#f59e0b" />
        </g>

        {/* Floating USDT Escrow Badge */}
        <g transform="translate(170, 85)">
          <circle cx="16" cy="16" r="15" fill="#ecfdf5" stroke="#00d084" strokeWidth="2" />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#059669"
            fontSize="13"
            fontWeight="bold"
            fontFamily="monospace"
          >
            ₮
          </text>
        </g>

        {/* Floating Scissors / Clip Tool Micro-Badge */}
        <g transform="translate(230, 48)">
          <circle cx="14" cy="14" r="13" fill="#ffffff" stroke="#111111" strokeWidth="1.5" />
          {/* Mini Scissors icon */}
          <circle cx="10" cy="18" r="2.5" stroke="#111111" strokeWidth="1.5" fill="none" />
          <circle cx="18" cy="18" r="2.5" stroke="#111111" strokeWidth="1.5" fill="none" />
          <line x1="11" y1="16" x2="17" y2="8" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="17" y1="16" x2="11" y2="8" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Crisp Hand-drawn Sparkle Stars */}
        <g stroke="#111111" strokeWidth="2" strokeLinecap="round">
          {/* Star 1 */}
          <path d="M 425 155 L 425 171 M 417 163 L 433 163" />
          {/* Star 2 */}
          <path d="M 335 55 L 335 67 M 329 61 L 341 61" />
          {/* Star 3 */}
          <path d="M 145 165 L 145 177 M 139 171 L 151 171" />
        </g>
      </svg>
      </div>
    </div>
  );
}
