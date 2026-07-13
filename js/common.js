// js/common.js

// 1. 공통 헤더를 동적으로 불러오는 함수
async function loadHeader() {
    try {
        const response = await fetch('components/header.html');
        if (!response.ok) throw new Error('헤더를 불러오는데 실패했습니다.');
        
        const headerHtml = await response.text();
        document.getElementById('header-placeholder').innerHTML = headerHtml;
        
        // 헤더 로드 완료 후 기능들 초기화
        initComponents();
    } catch (error) {
        console.error(error);
    }
}

// 2. 각종 기능 초기화 함수 (헤더가 DOM에 삽입된 후 실행됨)
function initComponents() {
    // [1] 아이콘 초기화 (Lucide)
    lucide.createIcons();

    // [2] 다크모드 로직
    const themeToggleBtn = document.getElementById('theme-toggle');
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');
    
    let isDark = localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

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

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            isDark = !isDark;
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeUI();
        });
    }

    // [3] 다국어 (KR/EN) 전환 로직
    const langToggleBtn = document.getElementById('lang-toggle');
    const langText = document.getElementById('lang-text');
    let currentLang = localStorage.getItem('lang') || 'kr';

    const updateLangUI = () => {
        if(langText) langText.innerText = currentLang === 'kr' ? 'EN' : 'KR';
        // 페이지 전체의 번역 요소 업데이트
        document.querySelectorAll('[data-kr][data-en]').forEach(el => {
            el.innerHTML = el.getAttribute(`data-${currentLang}`);
        });
    };

    updateLangUI();

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'kr' ? 'en' : 'kr';
            localStorage.setItem('lang', currentLang);
            updateLangUI();
        });
    }

    // [4] 스크롤 진행률 상단바 로직
    const scrollProgressBar = document.getElementById('scroll-progress');
    const updateScrollProgress = () => {
        if (!scrollProgressBar) return;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        scrollProgressBar.style.width = `${progress}%`;
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress(); 

    // [5] 현재 페이지 하이라이트 로직
    let currentPath = window.location.pathname.split('/').pop(); 
    if (!currentPath || currentPath === '/' || currentPath.includes('blob')) {
        currentPath = 'index.html'; 
    }

    const navLinks = document.querySelectorAll('.nav-link');
    let isActiveSet = false;
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || window.location.href.includes(href)) {
            link.classList.add('active');
            isActiveSet = true;
        } else {
            link.classList.remove('active');
        }
    });
    
    if (!isActiveSet) {
        const defaultLink = document.querySelector('.nav-link[href="index.html"]');
        if (defaultLink) defaultLink.classList.add('active');
    }

    // [6] 이스터에그
    const easterEggBtn = document.getElementById('easter-egg-btn');
    if (easterEggBtn) {
        easterEggBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            alert('🎉 이스터에그 발견! 방명록(Guestbook) 페이지로 이동합니다.');
            window.location.href = 'guestbook.html'; 
        });
    }
}

// DOM이 준비되면 헤더를 먼저 불러옵니다.
document.addEventListener('DOMContentLoaded', loadHeader);