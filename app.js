/* ==========================================
   Apex Traders Interactive Logic & Tracking
   Features: Active Candlestick Canvas & Meta Pixel Firing
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // 1. Meta Pixel Click Tracking with Safe Redirect
    // -----------------------------------------------------------------
    const joinBtn = document.getElementById('join-tg-btn');
    const countdownSec = document.getElementById('countdown-sec');
    const progressBarFill = document.getElementById('progress-bar-fill');

    if (joinBtn) {
        const targetUrl = joinBtn.href;
        let redirected = false;
        const totalDuration = 15; // 15 seconds timer
        let timeLeft = totalDuration;

        // Perform redirect action
        const performRedirect = (isManual = false) => {
            if (redirected) return;
            redirected = true;

            // Clear active countdown interval
            clearInterval(timerInterval);

            // Fire Meta Pixel tracking event
            try {
                if (typeof fbq === 'function') {
                    console.log('Firing Meta Pixel Lead event...');
                    fbq('track', 'Lead', {
                        content_name: 'Apex Traders Telegram Channel',
                        content_category: 'Forex & Gold Channel Join',
                        method: isManual ? 'manual_click' : 'auto_redirect'
                    });
                }
            } catch (error) {
                console.error('Error tracking pixel event:', error);
            }

            // Redirect flow:
            // Mobile compatibility: Auto-redirects MUST use window.location.href to bypass popup blockers.
            // Manual clicks can open in a new tab if preferred.
            if (isManual) {
                window.open(targetUrl, '_blank');
            } else {
                window.location.href = targetUrl;
            }
        };

        // Smooth 100ms interval for fluid progress bar transition
        const timerInterval = setInterval(() => {
            timeLeft -= 0.1;
            
            if (timeLeft <= 0) {
                timeLeft = 0;
                clearInterval(timerInterval);
                performRedirect(false); // auto-redirect
            }

            // Update UI elements
            if (countdownSec) {
                countdownSec.textContent = Math.ceil(timeLeft);
            }
            if (progressBarFill) {
                progressBarFill.style.transform = `scaleX(${timeLeft / totalDuration})`;
            }
        }, 100);

        // Click event listener
        joinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performRedirect(true); // manual click redirect
        });
    }

    // -----------------------------------------------------------------
    // 2. Animated Financial Candlestick Background Canvas
    // -----------------------------------------------------------------
    const canvas = document.getElementById('chart-bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Handle viewport resize
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Candlestick data model
    class Candle {
        constructor(x, open, high, low, close) {
            this.x = x;
            this.open = open;
            this.high = high;
            this.low = low;
            this.close = close;
            this.width = 12; // width of candle rect
            this.color = close >= open ? '#10b981' : '#f43f5e'; // Green vs Red
            this.opacity = 0.15 + Math.random() * 0.2; // subtle opacity to stay background-friendly
        }

        draw(ctx) {
            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.lineWidth = 1.5;

            // Draw wick (high to low)
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.high);
            ctx.lineTo(this.x + this.width / 2, this.low);
            ctx.stroke();

            // Draw body (open to close)
            const bodyY = Math.min(this.open, this.close);
            const bodyHeight = Math.max(Math.abs(this.open - this.close), 2);
            ctx.fillRect(this.x, bodyY, this.width, bodyHeight);
            ctx.restore();
        }
    }

    const candles = [];
    const candleSpacing = 28;
    const maxCandles = Math.ceil(width / candleSpacing) + 2;
    let currentPrice = height * 0.6; // starting price baseline

    // Generate initial set of candles
    function generateInitialCandles() {
        for (let i = 0; i < maxCandles; i++) {
            const x = i * candleSpacing;
            createNewCandle(x);
        }
    }

    function createNewCandle(x) {
        // Price fluctuations with gold trend drift
        const volatility = 20;
        const trend = (Math.random() - 0.48) * 8; // slight upward bias
        
        const open = currentPrice;
        const close = currentPrice + (Math.random() - 0.5) * volatility + trend;
        const high = Math.min(open, close) - Math.random() * 15;
        const low = Math.max(open, close) + Math.random() * 15;

        // Constraint boundaries so candles don't flow off-screen
        if (close < height * 0.2) currentPrice = height * 0.3;
        else if (close > height * 0.8) currentPrice = height * 0.7;
        else currentPrice = close;

        candles.push(new Candle(x, open, high, low, close));
    }

    generateInitialCandles();

    // Line chart coordinates (Trendline moving average)
    let points = [];
    
    // Animation Loop
    let scrollSpeed = 0.3; // speed of chart scrolling left

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update & draw candles
        for (let i = 0; i < candles.length; i++) {
            candles[i].x -= scrollSpeed;
            candles[i].draw(ctx);
        }

        // Remove offscreen candles and add new ones on the right
        if (candles.length > 0 && candles[0].x < -30) {
            candles.shift();
            const lastCandleX = candles[candles.length - 1].x;
            createNewCandle(lastCandleX + candleSpacing);
        }

        // Draw a glowing golden Trendline (exponential moving average approximation)
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = '#f59e0b';
        ctx.globalAlpha = 0.25;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f59e0b';

        if (candles.length > 0) {
            ctx.moveTo(candles[0].x + candles[0].width/2, (candles[0].open + candles[0].close)/2);
            for (let i = 1; i < candles.length; i++) {
                const targetX = candles[i].x + candles[i].width/2;
                const targetY = (candles[i].open + candles[i].close)/2;
                ctx.lineTo(targetX, targetY);
            }
        }
        ctx.stroke();
        ctx.restore();

        // Slow floating gold dust particles (Gold trading representation)
        drawGoldDust();

        requestAnimationFrame(animate);
    }

    // Gold dust particle array
    const particles = [];
    const maxParticles = 30;

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = height + 10;
            this.size = 1 + Math.random() * 2.5;
            this.speedY = 0.2 + Math.random() * 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.opacity = 0.1 + Math.random() * 0.3;
        }
        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            if (this.y < -10) this.reset();
        }
        draw() {
            ctx.save();
            ctx.fillStyle = '#f59e0b';
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
        // pre-populate across viewport height
        particles[i].y = Math.random() * height;
    }

    function drawGoldDust() {
        particles.forEach(p => {
            p.update();
            p.draw();
        });
    }

    animate();
});
