'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     共通要素の取得
  ============================================================ */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navHeight = 70; // ナビゲーションの高さ（px）

  /* ============================================================
     1. ハンバーガーメニューの開閉
  ============================================================ */
  if (navToggle && navMenu) {
    const openMenu = () => {
      navMenu.classList.add('is-open');
      navToggle.classList.add('is-active');
      navToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      navMenu.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    navToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      if (navMenu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // メニュー内のリンクをクリックしたらメニューを閉じる
    const navMenuLinks = navMenu.querySelectorAll('a');
    navMenuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('is-open')) {
          closeMenu();
        }
      });
    });

    // メニュー外クリックで閉じる
    document.addEventListener('click', (event) => {
      const isClickInsideMenu = navMenu.contains(event.target);
      const isClickOnToggle = navToggle.contains(event.target);
      if (
        navMenu.classList.contains('is-open') &&
        !isClickInsideMenu &&
        !isClickOnToggle
      ) {
        closeMenu();
      }
    });

    // ESCキーでも閉じられるようにする（アクセシビリティ配慮）
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navMenu.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  /* ============================================================
     2. ナビゲーションのスクロール時スタイル変更
  ============================================================ */
  if (nav) {
    let ticking = false;

    const updateNavScrolledState = () => {
      if (window.scrollY >= 50) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateNavScrolledState);
          ticking = true;
        }
      },
      { passive: true }
    );

    // 初期表示時点のスクロール位置も反映
    updateNavScrolledState();
  }

  /* ============================================================
     3. FAQアコーディオン（1つだけ開く排他制御）
  ============================================================ */
  const faqItems = document.querySelectorAll('.faq-item');

  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question');

      if (!question) {
        return;
      }

      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // 他のアイテムをすべて閉じる
        faqItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherQuestion = otherItem.querySelector('.faq-question');
            if (otherQuestion) {
              otherQuestion.setAttribute('aria-expanded', 'false');
            }
          }
        });

        // クリックしたアイテムをトグル
        if (isActive) {
          item.classList.remove('active');
          question.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          question.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ============================================================
     4. スクロールアニメーション（フェードイン）
  ============================================================ */
  const fadeSections = document.querySelectorAll('.fade-in-section');

  if (fadeSections.length > 0 && 'IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // 一度表示されたら監視を解除してパフォーマンスを確保
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    fadeSections.forEach((section) => {
      fadeObserver.observe(section);
    });
  } else {
    // IntersectionObserver未対応の場合は即座に表示
    fadeSections.forEach((section) => {
      section.classList.add('is-visible');
    });
  }

  /* ============================================================
     5. スムーススクロール（ナビゲーションリンク）
  ============================================================ */
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');

      // "#"のみ、または空のリンクは対象外
      if (!href || href === '#') {
        return;
      }

      const targetSection = document.querySelector(href);

      if (!targetSection) {
        return;
      }

      event.preventDefault();

      const targetPosition =
        targetSection.getBoundingClientRect().top +
        window.pageYOffset -
        navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    });
  });

  /* ============================================================
     6. 現在地ハイライト（アクティブナビ）
  ============================================================ */
  const navLinks = document.querySelectorAll('.nav-link');
  const observedSections = [];

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const section = document.querySelector(href);
      if (section) {
        observedSections.push({ link, section });
      }
    }
  });

  if (observedSections.length > 0 && 'IntersectionObserver' in window) {
    const setActiveLink = (targetSection) => {
      observedSections.forEach(({ link, section }) => {
        if (section === targetSection) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    };

    let currentActiveSection = null;
    let maxRatio = 0;

    const activeNavObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= maxRatio) {
            maxRatio = entry.intersectionRatio;
            currentActiveSection = entry.target;
          }
        });

        if (currentActiveSection) {
          setActiveLink(currentActiveSection);
        }

        // 次回判定のためにリセット
        maxRatio = 0;
      },
      {
        threshold: [0.2, 0.4, 0.6, 0.8],
        rootMargin: `-${navHeight}px 0px -40% 0px`,
      }
    );

    observedSections.forEach(({ section }) => {
      activeNavObserver.observe(section);
    });
  }

  /* ============================================================
     7. 対応空間タブ切り替え（SPACESセクション）
  ============================================================ */
  const spacesTabs = document.querySelectorAll('.spaces-tab');
  const spacesPanels = document.querySelectorAll('.spaces-panel');

  if (spacesTabs.length > 0 && spacesPanels.length > 0) {
    spacesTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-target');

        spacesTabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        spacesPanels.forEach((panel) => {
          panel.classList.remove('active');
        });

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  /* ============================================================
     8. ご依頼の流れ タブ切り替え（FLOWセクション）
  ============================================================ */
  const flowTabs = document.querySelectorAll('.flow-tab');
  const flowPanels = document.querySelectorAll('.flow-panel');

  if (flowTabs.length > 0 && flowPanels.length > 0) {
    flowTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-target');

        flowTabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        flowPanels.forEach((panel) => {
          panel.classList.remove('active');
        });

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

});
