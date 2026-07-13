// js/common.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 공통 헤더 불러오기
    const placeholder = document.getElementById('header-placeholder');
    if (placeholder) {
        try {
            const response = await fetch('components/header.html');
            const headerHtml = await response.text();
            placeholder.innerHTML = headerHtml;
            
            // 네비게이션과 스크롤바가 상단에 항상 고정되도록 placeholder 자체에 고정 스타일(fixed)을 부여합니다.
            placeholder.classList.add('fixed', 'top-0', 'left-0', 'w-full', 'z-50');
            
            // 헤더가 안전하게 불러와진 후 아이콘을 다시 한 번 초기화합니다.
            lucide.createIcons();
            
            // 🐥 병아리 10번 연속 클릭 이스터에그 기능 시작!
            initChickEasterEgg();
            
            // 헤더 로드 직후 스크롤바 상태를 한 번 동기화합니다.
            setTimeout(updateScrollProgress, 100);
        } catch (error) {
            console.error('헤더를 불러오는데 실패했습니다.', error);
        }
    }

    // 2. 다크모드 설정
    const themeToggleBtn = document.getElementById('theme-toggle');
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');
    let isDark = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const updateThemeUI = () => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            if(iconSun) iconSun.classList.remove('hidden');
            if(iconMoon) iconMoon.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            if(iconSun) iconSun.classList.add('hidden');
            if(iconMoon) iconMoon.classList.remove('hidden');
        }
    };
    
    updateThemeUI();
    if(themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            isDark = !isDark;
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeUI();
        });
    }

    // 3. 다국어 전환 설정
    const langToggleBtn = document.getElementById('lang-toggle');
    const langText = document.getElementById('lang-text');
    let currentLang = localStorage.getItem('lang') || 'kr';

    const updateLangUI = () => {
        if(langText) langText.innerText = currentLang === 'kr' ? 'EN' : 'KR';
        document.querySelectorAll('[data-kr][data-en]').forEach(el => {
            el.innerHTML = el.getAttribute(`data-${currentLang}`);
        });
    };

    updateLangUI();
    if(langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'kr' ? 'en' : 'kr';
            localStorage.setItem('lang', currentLang);
            updateLangUI();
        });
    }

    // 4. 스크롤바 진행률 (중복 코드를 하나로 통합 및 캡처링 적용)
    function updateScrollProgress(e) {
        const progressEl = document.getElementById('scroll-progress');
        if (!progressEl) return; // 헤더가 아직 로드되지 않았다면 리턴

        let scrollTop = 0;
        let scrollHeight = 0;
        let clientHeight = 0;

        const target = e ? e.target : null;

        // 화면 전체 스크롤인지, 내부 슬라이드(#pages 등) 스크롤인지 판별
        if (!target || target === document || target === window || target === document.documentElement || target === document.body) {
            scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
            scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
            clientHeight = window.innerHeight || document.documentElement.clientHeight;
        } else {
            scrollTop = target.scrollTop;
            scrollHeight = target.scrollHeight;
            clientHeight = target.clientHeight;
        }

        const usableHeight = scrollHeight - clientHeight;
        const scrollPercent = usableHeight > 0 ? (scrollTop / usableHeight) * 100 : 0;
        
        progressEl.style.width = scrollPercent + '%';
    }

    // 세 번째 인자 true(Capturing)로 설정하여 내부 스크롤까지 낚아챕니다.
    window.addEventListener('scroll', updateScrollProgress, true);
    
    // 초기 렌더링 직후에도 상태를 한 번 갱신합니다.
    setTimeout(updateScrollProgress, 200);

    // 5. 현재 페이지 네비게이션 하이라이트
    let currentPath = window.location.pathname.split('/').pop(); 
    if (!currentPath || currentPath === '/' || currentPath.includes('blob') || currentPath === 'iframe.html') {
        currentPath = 'index.html'; 
    }
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || window.location.href.includes(href)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ==========================================
    // 🐾 6. 병아리 파티클 캔버스 & 마우스 트레일 애니메이션
    // ==========================================
    const canvas = document.getElementById('bg-canvas');
    if(!canvas) return; // 캔버스가 없으면 실행 안함
    const ctx = canvas.getContext('2d');
    let particles = [];
    let trailParticles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function drawEgg(x, y, size, rotation, opacity, type) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        const isDark = document.documentElement.classList.contains('dark');
        ctx.strokeStyle = isDark ? `rgba(253, 186, 116, ${opacity})` : `rgba(251, 146, 60, ${opacity})`;
        ctx.fillStyle = isDark ? `rgba(253, 186, 116, ${opacity * 0.2})` : `rgba(251, 146, 60, ${opacity * 0.2})`;
        
        ctx.lineWidth = size / 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (type === 'egg') {
            ctx.beginPath();
            ctx.moveTo(0, -size * 1.2);
            ctx.bezierCurveTo(size * 0.8, -size * 1.2, size * 0.9, size * 0.3, size * 0.7, size * 1);
            ctx.bezierCurveTo(size * 0.3, size * 1.4, -size * 0.3, size * 1.4, -size * 0.7, size * 1);
            ctx.bezierCurveTo(-size * 0.9, size * 0.3, -size * 0.8, -size * 1.2, 0, -size * 1.2);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(0, -size * 0.2, size * 0.7, Math.PI, Math.PI * 2);
            ctx.stroke(); ctx.fill();
            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath(); ctx.arc(-size * 0.3, -size * 0.5, size * 0.12, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(size * 0.3, -size * 0.5, size * 0.12, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.4); ctx.lineTo(size * 0.2, -size * 0.25);
            ctx.lineTo(0, -size * 0.1); ctx.lineTo(-size * 0.2, -size * 0.25);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = isDark ? `rgba(253, 186, 116, ${opacity * 0.3})` : `rgba(251, 146, 60, ${opacity * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(-size * 0.85, -size * 0.1);
            ctx.lineTo(-size * 0.4, -size * 0.3); 
            ctx.lineTo(0, -size * 0.05);
            ctx.lineTo(size * 0.4, -size * 0.3);
            ctx.lineTo(size * 0.85, -size * 0.1);
            ctx.bezierCurveTo(size * 0.9, size * 0.8, size * 0.5, size * 1.3, 0, size * 1.3);
            ctx.bezierCurveTo(-size * 0.5, size * 1.3, -size * 0.9, size * 0.8, -size * 0.85, -size * 0.1);
            ctx.closePath();
            ctx.stroke(); ctx.fill();
        }
        ctx.restore();
    }

    function drawFootprint(x, y, size, rotation, opacity) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        const isDark = document.documentElement.classList.contains('dark');
        ctx.strokeStyle = isDark ? `rgba(253, 186, 116, ${opacity})` : `rgba(251, 146, 60, ${opacity})`;
        ctx.lineWidth = size / 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, -size); 
        ctx.moveTo(0, 0); ctx.lineTo(-size * 0.7, -size * 0.7); 
        ctx.moveTo(0, 0); ctx.lineTo(size * 0.7, -size * 0.7); 
        ctx.moveTo(0, 0); ctx.lineTo(0, size * 0.4); 
        ctx.stroke();
        ctx.restore();
    }

    class BackgroundParticle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 8 + 10; 
            this.speedY = Math.random() * -1 - 0.2; 
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.rotation = (Math.random() - 0.5) * 0.5; 
            this.opacity = Math.random() * 0.15 + 0.05;
            this.type = Math.random() > 0.5 ? 'egg' : 'chick'; 
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            if (this.y < -50) {
                this.y = canvas.height + 50;
                this.x = Math.random() * canvas.width;
                this.type = Math.random() > 0.5 ? 'egg' : 'chick'; 
            }
        }
        draw() {
            drawEgg(this.x, this.y, this.size, this.rotation, this.opacity, this.type);
        }
    }

    class TrailFootprint {
        constructor(x, y, rotation) {
            this.x = x; this.y = y;
            this.size = 10; 
            this.rotation = rotation;
            this.opacity = 0.8; 
        }
        update() { this.opacity -= 0.015; }
        draw() { drawFootprint(this.x, this.y, this.size, this.rotation, Math.max(0, this.opacity)); }
    }

    let lastMouseX = 0;
    let lastMouseY = 0;
    let isLeftFoot = true; 

    window.addEventListener('mousemove', (e) => {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 40) { 
            const angle = Math.atan2(dy, dx) + Math.PI / 2; 
            const offset = 12; 
            const offsetX = Math.cos(angle) * (isLeftFoot ? -offset : offset);
            const offsetY = Math.sin(angle) * (isLeftFoot ? -offset : offset);
            trailParticles.push(new TrailFootprint(e.clientX + offsetX, e.clientY + offsetY, angle));
            lastMouseX = e.clientX; lastMouseY = e.clientY;
            isLeftFoot = !isLeftFoot; 
        }
    });

    const particleCount = window.innerWidth > 768 ? 30 : 15; 
    for(let i = 0; i < particleCount; i++) {
        particles.push(new BackgroundParticle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        for(let i = trailParticles.length - 1; i >= 0; i--) {
            let p = trailParticles[i];
            p.update(); p.draw();
            if(p.opacity <= 0) trailParticles.splice(i, 1);
        }
        requestAnimationFrame(animate);
    }
    animate();

    function initChickEasterEgg() {
        const chick = document.getElementById('chick-easter-egg');
        if (!chick) return;

        let clickCount = 0;
        let lastClickTime = 0;

        chick.addEventListener('click', () => {
            const currentTime = Date.now();
            
            // 1.5초 이상 멍하니 있으면 누적 클릭수 초기화 (연속 다다닥 클릭 유도)
            if (currentTime - lastClickTime > 1500) {
                clickCount = 0;
            }
            
            clickCount++;
            lastClickTime = currentTime;

            // 연속 클릭할 때마다 병아리가 점점 더 커지면서 통통 튀고 좌우로 고개를 흔듭니다.
            chick.style.transform = `scale(${1 + clickCount * 0.1}) rotate(${clickCount % 2 === 0 ? '15deg' : '-15deg'})`;
            
            // 일정 시간 동안 클릭을 멈추면 스르륵 원래 귀여운 1배율 크기로 리턴
            setTimeout(() => {
                if (Date.now() - lastClickTime >= 1200) {
                    chick.style.transform = 'scale(1) rotate(0deg)';
                }
            }, 1200);

            // 10번 클릭을 달성하는 순간!
            if (clickCount >= 10) {
                // 병아리가 3배로 왕창 커지며 뱅글 회전하는 피날레 연출
                chick.style.transform = 'scale(3.2) rotate(360deg)';
                chick.style.transition = 'transform 0.5s ease-in-out';
                
                // 극적인 연출 후 비밀 방명록으로 리다이렉트
                setTimeout(() => {
                    window.location.href = 'guestbook.html';
                }, 500);
            }
        });
    }
});