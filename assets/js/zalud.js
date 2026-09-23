/* Self-contained page behaviour; product configuration lives in zalud-a-listy.html. */
(() => {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.getElementById('nav-menu');
    const setMenu = (open) => {
        menu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setMenu(false);
            toggle.focus();
        }
    });

    const dialog = document.querySelector('.z-preview-dialog');
    const dialogImage = dialog.querySelector('img');
    document.querySelectorAll('[data-preview]').forEach(button => {
        button.addEventListener('click', () => {
            dialogImage.src = button.dataset.preview;
            dialogImage.alt = button.dataset.title;
            document.getElementById('preview-title').textContent = button.dataset.title;
            dialog.showModal();
            document.body.classList.add('modal-open');
        });
    });
    dialog.querySelector('.z-dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));

    const videoShell = document.querySelector('[data-video-src]');
    if (videoShell.dataset.videoSrc.trim()) {
        const video = videoShell.querySelector('video');
        const play = videoShell.querySelector('.z-play');
        const poster = videoShell.querySelector('.z-video-poster');
        const error = videoShell.querySelector('.z-media-error');
        play.disabled = false;
        videoShell.querySelector('.z-video-status').textContent = 'Přehrát ukázku · Žalud a listy';
        play.addEventListener('click', () => {
            video.src = videoShell.dataset.videoSrc;
            video.hidden = false;
            poster.hidden = true;
            video.focus();
            video.play().catch(() => { /* Native controls allow another playback attempt. */ });
        });
        video.addEventListener('error', () => { error.hidden = false; });
    }

    const checkout = document.querySelector('[data-simpleshop-id]');
    const formId = checkout.dataset.simpleshopId.trim();
    if (formId) {
        const placeholder = checkout.querySelector('.z-checkout-placeholder');
        if (placeholder) placeholder.hidden = true;
        checkout.dataset.connected = 'true';
        const mount = checkout.querySelector('[data-SimpleShopForm]') || document.createElement('div');
        const hasEmbeddedForm = Boolean(mount.parentNode);
        if (!hasEmbeddedForm) {
            mount.setAttribute('data-SimpleShopForm', formId);
            mount.textContent = 'Načítáme zabezpečenou objednávku…';
            checkout.prepend(mount);
            window.sss = window.sss || function () { (window.sss.q = window.sss.q || []).push(arguments); };
            window.sss.l = Date.now();
            const script = document.createElement('script');
            script.src = 'https://form.simpleshop.cz/prj/js/SimpleShopService.js';
            script.async = true;
            script.onerror = () => {
                mount.hidden = true;
                checkout.querySelector('.z-checkout-error').hidden = false;
            };
            document.head.append(script);
            window.sss('createForm', formId);
        }
    }

    const mobileBuy = document.querySelector('.z-mobile-buy');
    const hero = document.querySelector('.z-hero');
    const order = document.getElementById('objednat');
    const future = document.getElementById('nove-bardio');
    if ('IntersectionObserver' in window) {
        let heroVisible = true;
        let orderVisible = false;
        let futureVisible = false;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.target === hero) heroVisible = entry.isIntersecting;
                if (entry.target === order) orderVisible = entry.isIntersecting;
                if (entry.target === future) futureVisible = entry.isIntersecting;
            });
            mobileBuy.hidden = heroVisible || orderVisible || futureVisible;
        }, { threshold: 0 });
        [hero, order, future].forEach(section => observer.observe(section));
    }
})();
