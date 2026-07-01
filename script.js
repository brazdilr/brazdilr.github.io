// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const navMenu = document.getElementById('nav-menu');

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    const isOpen = navMenu.classList.contains('active');
    [hamburger, mobileMenuButton].forEach(button => {
        if (button) button.setAttribute('aria-expanded', String(isOpen));
    });
}

[hamburger, mobileMenuButton].forEach(button => {
    if (button && navMenu) button.addEventListener('click', toggleMobileMenu);
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        [hamburger, mobileMenuButton].forEach(button => {
            if (button) button.setAttribute('aria-expanded', 'false');
        });
    });
});

// Audio Player functionality
class AudioPlayer {
    constructor() {
        this.currentTrack = 0;
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 1;
        this.currentTime = 0;
        this.duration = 30; // Default duration
        
        this.tracks = [
            { title: 'Veselý duet ke dni matek', file: 'https://media.bardio.cz/ukazka-1.mp3' },
            { title: 'Ukázka 2 - Akustická píseň', file: 'https://yfoqiowdqqusnvbkyqhk.supabase.co/storage/v1/object/public/Ukazky-pisni/ukazka-2.mp3', duration: 30 },
            { title: 'Ukázka 3 - Dětská píseň', file: 'https://yfoqiowdqqusnvbkyqhk.supabase.co/storage/v1/object/public/Ukazky-pisni/ukazka-3.mp3', duration: 25 }
        ];
        
        this.init();
    }
    
    setupAudioEvents() {
        if (!this.audioElement) return;
        
        // Aktualizuj progress bar při přehrávání
        this.audioElement.addEventListener('timeupdate', () => {
            this.currentTime = this.audioElement.currentTime;
            this.duration = this.audioElement.duration || this.duration;
            this.updateProgress();
        });
        
        // Automaticky přejdi na další track
        this.audioElement.addEventListener('ended', () => {
            this.nextTrack();
        });
        
        // Zpracuj chyby
        this.audioElement.addEventListener('error', (e) => {
            console.log('Audio error:', e);
            this.playSimulated();
        });
    }
    
    init() {
        // Safely query elements (may be hidden or absent in v2)
        this.playBtn = document.getElementById('play-btn') || null;
        this.prevBtn = document.getElementById('prev-btn') || null;
        this.nextBtn = document.getElementById('next-btn') || null;
        this.muteBtn = document.getElementById('mute-btn') || null;
        this.hidePlayerBtn = document.getElementById('hide-player') || null;
        this.progressBar = document.getElementById('progress-bar') || null;
        this.currentTimeEl = document.getElementById('current-time') || { textContent: '' };
        this.durationEl = document.getElementById('duration') || { textContent: '' };
        this.trackTitle = document.querySelector('.track-title') || { textContent: '' };
        this.trackMeta = document.querySelector('.track-meta') || { textContent: '' };
        this.audioPlayer = document.getElementById('audio-player') || null;
        this.floatingBtn = document.getElementById('floating-audio-btn') || null;
        this.heroPlayBtn = document.getElementById('hero-play-btn') || null;
        
        this.setupEventListeners();
        this.updateTrackInfo();
    }
    
    setupEventListeners() {
        if (this.playBtn) this.playBtn.addEventListener('click', () => this.togglePlayPause());
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.previousTrack());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextTrack());
        if (this.muteBtn) this.muteBtn.addEventListener('click', () => this.toggleMute());
        if (this.hidePlayerBtn) this.hidePlayerBtn.addEventListener('click', () => this.hidePlayer());
        if (this.floatingBtn) this.floatingBtn.addEventListener('click', () => this.showPlayer());
        if (this.heroPlayBtn) this.heroPlayBtn.addEventListener('click', () => this.togglePlayPause());
        
        if (this.progressBar) {
            this.progressBar.addEventListener('input', (e) => {
                this.currentTime = (e.target.value / 100) * this.duration;
                this.updateProgress();
            });
        }
        
        // Simulate audio playback
        this.audioInterval = null;
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        const currentTrack = this.tracks[this.currentTrack];
        
        // Pokud má track audio soubor, použij HTML5 Audio API
        if (currentTrack.file) {
            if (!this.audioElement) {
                this.audioElement = new Audio();
                this.setupAudioEvents();
            }
            
            this.audioElement.src = currentTrack.file;
            this.audioElement.volume = this.isMuted ? 0 : this.volume;
            this.audioElement.play().catch(error => {
                console.log('Audio playback failed:', error);
                // Fallback na simulaci pokud se audio nepodaří načíst
                this.playSimulated();
            });
        } else {
            // Fallback na simulaci pro tracky bez souborů
            this.playSimulated();
        }
        
        this.isPlaying = true;
        if (this.playBtn) this.playBtn.textContent = '⏸';
        if (this.heroPlayBtn) this.heroPlayBtn.textContent = '⏸ Pozastavit';
    }
    
    playSimulated() {
        // Simulate audio playback
        this.audioInterval = setInterval(() => {
            if (this.currentTime < this.duration) {
                this.currentTime += 0.1;
                this.updateProgress();
            } else {
                this.nextTrack();
            }
        }, 100);
    }
    
    pause() {
        this.isPlaying = false;
        if (this.playBtn) this.playBtn.textContent = '▶';
        if (this.heroPlayBtn) this.heroPlayBtn.textContent = '▶ Přehrát ukázky';
        
        // Zastav HTML5 audio pokud běží
        if (this.audioElement) {
            this.audioElement.pause();
        }
        
        // Zastav simulaci pokud běží
        if (this.audioInterval) {
            clearInterval(this.audioInterval);
        }
    }
    
    previousTrack() {
        this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
        this.updateTrackInfo();
        this.currentTime = 0;
        this.updateProgress();
        
        // Zastav aktuální audio
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
        
        if (this.isPlaying) {
            this.pause();
            setTimeout(() => this.play(), 100);
        }
    }
    
    nextTrack() {
        this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
        this.updateTrackInfo();
        this.currentTime = 0;
        this.updateProgress();
        
        // Zastav aktuální audio
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
        
        if (this.isPlaying) {
            this.pause();
            setTimeout(() => this.play(), 100);
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
        
        // Aktualizuj volume v HTML5 audio elementu
        if (this.audioElement) {
            this.audioElement.volume = this.isMuted ? 0 : this.volume;
        }
    }
    
    hidePlayer() {
        if (this.audioPlayer) this.audioPlayer.style.display = 'none';
        if (this.floatingBtn) this.floatingBtn.style.display = 'block';
    }
    
    showPlayer() {
        if (this.audioPlayer) this.audioPlayer.style.display = 'block';
        if (this.floatingBtn) this.floatingBtn.style.display = 'none';
    }
    
    updateTrackInfo() {
        const t = this.tracks[this.currentTrack];
        if (this.trackTitle) this.trackTitle.textContent = t.title || '';
        if (this.trackMeta) this.trackMeta.textContent = `Ukázka písničky • 0:${String(t.duration || this.duration).padStart(2, '0')}`;
    }
    
    updateProgress() {
        const progress = (this.currentTime / this.duration) * 100;
        if (this.progressBar) this.progressBar.value = progress;
        this.currentTimeEl.textContent = this.formatTime(this.currentTime);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.matches('[data-video-modal-open]')) return;

        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerEl = document.querySelector('.header');
            const headerHeight = headerEl ? headerEl.offsetHeight : 0;
            const audioEl = document.getElementById('audio-player');
            const audioPlayerHeight = audioEl ? audioEl.offsetHeight : 0;
            const offset = headerHeight + audioPlayerHeight + 20;
            
            window.scrollTo({
                top: target.offsetTop - offset,
                behavior: 'smooth'
            });
        }
    });
});

function initVideoModal() {
    const modal = document.getElementById('video-preview');
    const frame = document.getElementById('video-modal-frame');
    const title = document.getElementById('video-modal-title');
    const openButtons = document.querySelectorAll('[data-video-modal-open]');
    const closeButtons = document.querySelectorAll('[data-video-modal-close]');

    if (!modal || !frame || !openButtons.length) return;

    let lastFocusedElement = null;

    function createVideoNode(src, label) {
        if (!src) {
            const empty = document.createElement('p');
            empty.className = 'video-modal-empty';
            empty.textContent = 'Video zatím není připojené.';
            return empty;
        }

        const isEmbed = /youtube\.com|youtu\.be|vimeo\.com/.test(src);
        if (isEmbed) {
            const iframe = document.createElement('iframe');
            iframe.src = normalizeEmbedUrl(src);
            iframe.title = label || 'Ukázka Bardio';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.allowFullscreen = true;
            return iframe;
        }

        const video = document.createElement('video');
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.src = src;
        video.textContent = 'Váš prohlížeč nepodporuje přehrávání videa.';
        return video;
    }

    function normalizeEmbedUrl(src) {
        try {
            const url = new URL(src, window.location.href);
            if (url.hostname.includes('youtu.be')) {
                return `https://www.youtube.com/embed/${url.pathname.replace('/', '')}?autoplay=1`;
            }
            if (url.hostname.includes('youtube.com')) {
                const videoId = url.searchParams.get('v');
                if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            }
            if (url.hostname.includes('vimeo.com')) {
                const id = url.pathname.split('/').filter(Boolean).pop();
                if (id) return `https://player.vimeo.com/video/${id}?autoplay=1`;
            }
        } catch (error) {
            console.log('Video URL normalization failed:', error);
        }

        return src;
    }

    function openModal(trigger) {
        const src = trigger.getAttribute('data-video-src') || '';
        const label = trigger.getAttribute('data-video-title') || 'Ukázka Bardio';

        lastFocusedElement = document.activeElement;
        if (title) title.textContent = label;

        frame.replaceChildren(createVideoNode(src, label));
        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('video-modal-open');

        const closeButton = modal.querySelector('.video-modal-close');
        if (closeButton) closeButton.focus();
    }

    function closeModal() {
        if (modal.hidden) return;

        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('video-modal-open');
        frame.replaceChildren();

        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }

    openButtons.forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            openModal(button);
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeModal();
    });
}

// Initialize audio player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AudioPlayer();
    initVideoModal();
});

// Simple form handling (if you add a contact form)
function handleContactForm(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Simple validation
    if (!data.name || !data.email || !data.message) {
        alert('Prosím vyplňte všechna pole.');
        return;
    }
    
    // Simulate form submission
    alert('Děkujeme za váš zájem! Brzy vás budeme kontaktovat.');
    event.target.reset();
}

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Simple analytics (you can replace with Google Analytics)
function trackEvent(eventName, eventData = {}) {
    console.log('Event tracked:', eventName, eventData);
    // Here you would send data to your analytics service
}

// Track button clicks
document.addEventListener('click', (e) => {
    if (e.target.matches('.nav-btn, .hero-btn, .cta-btn, .service-link')) {
        trackEvent('button_click', {
            button_text: e.target.textContent,
            button_href: e.target.href
        });
    }
});

// Track audio player interactions
document.addEventListener('click', (e) => {
    if (e.target.matches('.control-btn, .hero-play-btn')) {
        trackEvent('audio_interaction', {
            button: e.target.textContent || e.target.id
        });
    }
});



function initTopPlayer() {
    const prev = document.getElementById('tp-prev');
    const play = document.getElementById('tp-play');
    const next = document.getElementById('tp-next');
    const title = document.getElementById('tp-title');
    const tabs = document.querySelectorAll('#tp-tabs .tp-tab');

    // Pokud nejsou elementy, neinicializuj
    if (!play) return;

    if (!window.__playerInstance) {
        window.__playerInstance = new AudioPlayer();
    }
    const player = window.__playerInstance;

    // Sync title on track change via updateTrackInfo override
    const originalUpdate = player.updateTrackInfo.bind(player);
    player.updateTrackInfo = function() {
        originalUpdate();
        const t = this.tracks[this.currentTrack];
        if (title && t) title.textContent = t.title || 'Ukázka písničky';
    };
    player.updateTrackInfo();

    // Controls
    if (prev) prev.addEventListener('click', () => player.previousTrack());
    if (next) next.addEventListener('click', () => player.nextTrack());
    if (play) play.addEventListener('click', () => player.togglePlayPause());

    // Tabs -> switch category playlist
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const key = tab.getAttribute('data-category');
            // Activate tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Prepare playlist from category
            const items = categories[key] || [];
            if (!items.length) return;
            player.tracks = items.map(it => ({ title: it.title, file: it.file || null, duration: it.duration }));
            player.currentTrack = 0;
            player.updateTrackInfo();
            player.pause();
            setTimeout(() => player.play(), 50);
        });
    });
}

// FAQ Accordion functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });
            
            // Toggle current item
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

// Nový přehrávač pro jak-to-funguje
class MusicPlayer {
    constructor() {
        this.currentTrack = 0;
        this.currentCategory = 'pop';
        this.isPlaying = false;
        this.audio = null;
        this.audioTrackKey = null;
        this.categoryLabels = {
            pop: 'Pop',
            rock: 'Rock',
            rap: 'Rap',
            dojemne: 'Dojemné',
            detske: 'Dětské',
            dechovka: 'Dechovka'
        };
        
        // Definice skladeb podle kategorií (klíče sjednocené s HTML)
        this.tracks = {
            pop: [
                { title: 'Osobní duet ke dni matek', file: 'https://media.bardio.cz/ukazka-1.mp3', duration: 30 },
                { title: 'K výročí svatby pro rodiče', file: 'https://media.bardio.cz/ukazka-3.mp3', duration: 30 },
                { title: 'Popová píseň #3', file: 'https://yfoqiowdqqusnvbkyqhk.supabase.co/storage/v1/object/public/Ukazky-pisni/ukazka-3.mp3', duration: 25 }
            ],
            rock: [
                { title: 'Rockové přání pro kámoše Radka', file: 'https://media.bardio.cz/ukazka-2.mp3', duration: 28 },
                { title: 'Metalová k svátku Agátě', file: 'https://media.bardio.cz/ukazka-8.mp3', duration: 26 }
            ],
            rap: [
                { title: 'Pop rap pro naši mámu', file: 'https://media.bardio.cz/ukazka-4.mp3', duration: 25 }
            ],
            dojemne: [
                { title: 'Přání a vzpomínky babičce Anežce', file: 'https://media.bardio.cz/ukazka-5.mp3', duration: 27 }
            ],
            detske: [
                { title: 'Pro Adélku, o dráčkovi', file: 'https://media.bardio.cz/ukazka-6.mp3', duration: 22 }
            ],
            dechovka: [
                { title: 'Babičce k narozeninám', file: 'https://media.bardio.cz/ukazka-7.mp3', duration: 24 }
            ]
        };
        
        this.init();
    }
    
    init() {
        this.playerElement = document.getElementById('music-player');
        if (!this.playerElement) return;

        this.isSimple = this.playerElement.getAttribute('data-player-mode') === 'simple';
        this.mainPlayButton = document.getElementById('player-main-play');
        this.prevButton = document.getElementById('player-prev');
        this.nextButton = document.getElementById('player-next');
        this.currentTitleElement = document.getElementById('sample-player-heading');
        this.currentStyleElement = document.getElementById('player-current-style');
        this.currentTimeElement = document.getElementById('player-current-time');
        this.durationElement = document.getElementById('player-duration');
        this.progressBar = document.getElementById('player-progress');
        this.progressTrack = this.playerElement.querySelector('.sample-progress-track');

        if (this.isSimple) {
            this.playlist = this.createSimplePlaylist();
            this.setupEventListeners();
            this.updateNowPlaying();
            this.updatePlayButtons();
            return;
        }

        this.tracksList = document.getElementById('tracks-list');
        if (!this.tracksList) return;

        this.categoryTabs = this.playerElement.querySelectorAll('.category-tab');
        this.setupEventListeners();
        this.loadCategory('pop');
    }
    
    setupEventListeners() {
        if (this.categoryTabs) this.categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.getAttribute('data-category');
                if (category) this.loadCategory(category);
            });
        });

        if (this.mainPlayButton) {
            this.mainPlayButton.addEventListener('click', () => {
                this.toggleTrackPlay(this.currentTrack);
            });
        }

        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => {
                this.previousTrack(this.isPlaying);
            });
        }

        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => {
                this.nextTrack(this.isPlaying);
            });
        }

        if (this.progressTrack) {
            this.progressTrack.addEventListener('click', (event) => {
                if (!this.audio) return;
                const duration = this.getDuration();
                if (!duration) return;

                const rect = this.progressTrack.getBoundingClientRect();
                const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
                this.audio.currentTime = ratio * duration;
                this.updateProgress();
            });
        }
    }

    createSimplePlaylist() {
        return Object.entries(this.tracks).flatMap(([category, tracks]) => {
            const genre = this.categoryLabels[category];
            return tracks.map(track => ({ ...track, category, genre }));
        });
    }
    
    loadCategory(category) {
        if (!this.tracks[category]) return;

        if (this.audio) {
            this.audio.pause();
            this.audio = null;
            this.audioTrackKey = null;
        }

        this.currentCategory = category;
        this.currentTrack = 0;
        this.isPlaying = false;
        
        this.updateCategoryTabs();
        this.renderTracks();
        this.updateNowPlaying();
        this.updateProgress();
    }
    
    renderTracks() {
        if (!this.tracksList) return;
        
        const tracks = this.tracks[this.currentCategory] || [];
        this.tracksList.innerHTML = '';

        tracks.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = 'track-item';
            item.dataset.index = String(index);
            item.tabIndex = 0;
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `Vybrat ukázku: ${track.title}`);

            const number = document.createElement('span');
            number.className = 'track-index';
            number.textContent = String(index + 1).padStart(2, '0');

            const info = document.createElement('div');
            info.className = 'track-info';

            const title = document.createElement('div');
            title.className = 'track-title';
            title.textContent = track.title;

            const meta = document.createElement('div');
            meta.className = 'track-duration';
            meta.textContent = `${this.categoryLabels[this.currentCategory]} · ${this.formatTime(track.duration)}`;

            const playButton = document.createElement('button');
            playButton.className = 'track-play-btn';
            playButton.type = 'button';
            playButton.dataset.index = String(index);
            playButton.setAttribute('aria-label', `Přehrát ukázku: ${track.title}`);
            playButton.textContent = '▶';

            info.append(title, meta);
            item.append(number, info, playButton);
            this.tracksList.append(item);
        });

        this.tracksList.querySelectorAll('.track-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const index = parseInt(item.getAttribute('data-index'));
                this.toggleTrackPlay(index);
            });

            item.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                const index = parseInt(item.getAttribute('data-index'));
                this.toggleTrackPlay(index);
            });
        });
        
        this.tracksList.querySelectorAll('.track-play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-index'));
                this.toggleTrackPlay(index);
            });
        });

        this.updatePlayButtons();
    }
    
    toggleTrackPlay(index) {
        const tracks = this.getCurrentPlaylist();
        if (!Number.isInteger(index) || index < 0 || index >= tracks.length) return;

        if (this.currentTrack === index && this.audio) {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        } else {
            this.currentTrack = index;
            this.play();
        }
    }
    
    play() {
        const track = this.getCurrentTrack();
        if (!track) return;

        const trackKey = this.getCurrentTrackKey();
        if (this.audioTrackKey !== trackKey) {
            if (this.audio) {
                this.audio.pause();
            }

            this.audio = new Audio(track.file);
            this.audioTrackKey = trackKey;
            this.audio.addEventListener('loadedmetadata', () => {
                this.updateTimeDisplay();
            });
            this.audio.addEventListener('timeupdate', () => {
                this.updateProgress();
            });
            this.audio.addEventListener('ended', () => {
                this.nextTrack(true);
            });
        }

        this.updateNowPlaying();

        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updatePlayButtons();
        }).catch(error => {
            this.isPlaying = false;
            this.updatePlayButtons();
            console.log('Playback failed:', error);
        });
    }
    
    pause() {
        if (this.audio) {
            this.audio.pause();
        }
        this.isPlaying = false;
        this.updatePlayButtons();
    }

    updateCategoryTabs() {
        if (!this.categoryTabs) return;
        this.categoryTabs.forEach(tab => {
            const isActive = tab.getAttribute('data-category') === this.currentCategory;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
        });
    }

    updateNowPlaying() {
        const track = this.getCurrentTrack();
        if (!track) return;

        if (this.currentTitleElement) {
            this.currentTitleElement.textContent = track.title;
        }

        if (this.currentStyleElement) {
            const genre = track.genre || this.categoryLabels[this.currentCategory];
            this.currentStyleElement.textContent = this.isSimple ? genre : `${genre} · Bardio originál`;
        }

        if (this.durationElement) {
            this.durationElement.textContent = this.formatTime(this.getDuration());
        }

        if (this.currentTimeElement && !this.audio) {
            this.currentTimeElement.textContent = '0:00';
        }
    }

    updateTimeDisplay() {
        this.updateNowPlaying();
        this.updateProgress();
    }

    updateProgress() {
        const duration = this.getDuration();
        const currentTime = this.audio && this.audioTrackKey === this.getCurrentTrackKey()
            ? this.audio.currentTime
            : 0;
        const progress = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

        if (this.currentTimeElement) {
            this.currentTimeElement.textContent = this.formatTime(currentTime);
        }

        if (this.durationElement) {
            this.durationElement.textContent = this.formatTime(duration);
        }

        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }

        if (this.progressTrack) {
            this.progressTrack.setAttribute('aria-valuenow', String(Math.round(progress)));
        }
    }
    
    updatePlayButtons() {
        if (this.tracksList) this.tracksList.querySelectorAll('.track-item').forEach((item, index) => {
            const isCurrent = index === this.currentTrack;
            item.classList.toggle('active', isCurrent);
            item.setAttribute('aria-pressed', String(isCurrent));
        });

        if (this.tracksList) this.tracksList.querySelectorAll('.track-play-btn').forEach((btn, index) => {
            const isCurrentPlaying = index === this.currentTrack && this.isPlaying;
            btn.textContent = isCurrentPlaying ? '⏸' : '▶';
            btn.classList.toggle('playing', isCurrentPlaying);
        });

        if (this.mainPlayButton) {
            this.mainPlayButton.textContent = this.isPlaying ? '⏸' : '▶';
            this.mainPlayButton.classList.toggle('playing', this.isPlaying);
            this.mainPlayButton.setAttribute(
                'aria-label',
                this.isPlaying ? 'Pozastavit aktuální ukázku' : 'Přehrát aktuální ukázku'
            );
        }
    }

    getCurrentTrack() {
        const tracks = this.getCurrentPlaylist();
        return tracks[this.currentTrack];
    }

    getCurrentPlaylist() {
        return this.isSimple ? this.playlist : (this.tracks[this.currentCategory] || []);
    }

    getCurrentTrackKey() {
        return this.isSimple ? `simple:${this.currentTrack}` : `${this.currentCategory}:${this.currentTrack}`;
    }

    getDuration() {
        const track = this.getCurrentTrack();
        if (this.audio && Number.isFinite(this.audio.duration)) {
            return this.audio.duration;
        }
        return track ? track.duration : 0;
    }

    formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return '0:00';
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${remainingSeconds}`;
    }
    
    nextTrack(autoplay = false) {
        const tracks = this.getCurrentPlaylist();
        if (!tracks.length) return;
        if (this.audio) {
            this.audio.pause();
        }

        this.currentTrack = (this.currentTrack + 1) % tracks.length;
        this.audio = null;
        this.audioTrackKey = null;
        this.isPlaying = false;
        this.updateNowPlaying();
        this.updateProgress();
        this.updatePlayButtons();

        if (autoplay) {
            this.play();
        }
    }

    previousTrack(autoplay = false) {
        const tracks = this.getCurrentPlaylist();
        if (!tracks.length) return;
        if (this.audio) {
            this.audio.pause();
        }

        this.currentTrack = (this.currentTrack - 1 + tracks.length) % tracks.length;
        this.audio = null;
        this.audioTrackKey = null;
        this.isPlaying = false;
        this.updateNowPlaying();
        this.updateProgress();
        this.updatePlayButtons();

        if (autoplay) {
            this.play();
        }
    }
}

function initMusicPlayer() {
    const playerEl = document.getElementById('music-player');
    if (!playerEl) return;                         // nic nespouštěj, když tu UI není
    if (window.__musicInitDone) return;            // idempotence
    window.__musicInitDone = true;
    try { 
        new MusicPlayer(); 
        console.log('MusicPlayer initialized successfully');
    } catch (e) { 
        console.error('Error initializing MusicPlayer:', e); 
    }
}

// Unified initialization - only MusicPlayer
document.addEventListener('DOMContentLoaded', () => {
    initFAQ();
    initMusicPlayer();
    initTimeline();
    initReviewsCarousel();
});

window.addEventListener('pageshow', (e) => { 
    if (e.persisted) {
        window.__musicInitDone = false; // Reset flag for bfcache
        initMusicPlayer(); 
        initReviewsCarousel();
    }
});

// Timeline functionality
function initTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Only handle clicks on mobile/touch devices
            if (window.innerWidth <= 768) {
                e.preventDefault();
                
                const isActive = item.classList.contains('active');
                
                // Close all other timeline items
                timelineItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                } else {
                    item.classList.add('active');
                }
            }
        });
    });
}

// Parallax scroll effect - oblouk + how it works + kompenzace mezery
function initParallax() {
    const hero = document.querySelector('.hero');
    const heroTransition = document.querySelector('.hero-transition');
    const howItWorks = document.querySelector('.how-it-works');
    const heroTransitionBottom = document.querySelector('.hero-transition-bottom');
    const stepsTimeline = document.querySelector('.steps-timeline');

    if (!hero || !heroTransition || !howItWorks || !heroTransitionBottom || !stepsTimeline) return;

    // volitelně: lepší výkon
    [heroTransition, howItWorks, heroTransitionBottom].forEach(el => {
        el.style.willChange = 'transform';
    });

    let ticking = false;
    let lastRate = null;
    let lastMargin = null;

    function apply(rate) {
        // 1) parallax pro vizuálně spojený celek (včetně horního oblouku)
        heroTransition.style.transform = `translateY(${rate}px)`;
        howItWorks.style.transform = `translateY(${rate}px)`;
        heroTransitionBottom.style.transform = `translateY(${rate}px)`;

        // 2) kompenzace díry: posuň další sekci V TOKU LAYOUTU
        // rate je záporný (např. -120px) -> margin-top dáme na stejnou hodnotu
        if (lastMargin !== rate) {
            stepsTimeline.style.marginTop = `${rate}px`;
            lastMargin = rate;
        }
    }

    function update() {
        const scrolled = window.pageYOffset || 0;
        const heroHeight = hero.offsetHeight || 0;

        // posouváme jen, dokud „trvá" hero
        const raw = -0.5 * Math.min(scrolled, heroHeight);
        if (raw !== lastRate) {
            apply(raw);
            lastRate = raw;
        }
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                update();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
}

// Jednoduchý carousel pro reference na homepage
function initReviewsCarousel() {
    const carousel = document.querySelector('.reviews-carousel');
    const track = document.querySelector('.reviews-track');
    const cards = Array.from(document.querySelectorAll('.review-card'));
    const prevBtn = document.querySelector('.reviews-prev');
    const nextBtn = document.querySelector('.reviews-next');
    const dots = Array.from(document.querySelectorAll('.reviews-dot'));

    if (!track || cards.length === 0 || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    let autoTimer = null;

    function getRelativeIndex(index) {
        return (index - currentIndex + cards.length) % cards.length;
    }

    function updateCarousel(index) {
        currentIndex = (index + cards.length) % cards.length;
        track.style.transform = '';

        cards.forEach((card, i) => {
            const relativeIndex = getRelativeIndex(i);
            const isActive = relativeIndex === 0;
            const isVisible = relativeIndex < Math.min(cards.length, 3);

            card.classList.toggle('active', isActive);
            card.classList.toggle('is-visible', isVisible);
            card.classList.toggle('is-hidden', !isVisible);
            card.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
            dot.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
        });
    }

    function stopAutoSlide() {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    }

    prevBtn.addEventListener('click', () => {
        stopAutoSlide();
        updateCarousel(currentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        stopAutoSlide();
        updateCarousel(currentIndex + 1);
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            stopAutoSlide();
            const idx = parseInt(dot.getAttribute('data-index'), 10) || 0;
            updateCarousel(idx);
        });
    });

    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            if (index === currentIndex) return;
            stopAutoSlide();
            updateCarousel(index);
        });
    });

    // Jednoduchý auto-slide, který se zastaví při první interakci
    autoTimer = setInterval(() => {
        updateCarousel(currentIndex + 1);
    }, 9000);

    ['mouseenter', 'focusin'].forEach(evt => {
        (carousel || track).addEventListener(evt, stopAutoSlide, { once: true });
    });

    updateCarousel(0);
}

// scrollování k sekci objednání
// počká, až se objeví libovolný z daných selektorů
function waitForAny(selectors, cb, timeoutMs = 10000) {
    const found = selectors.map(s => document.querySelector(s)).find(Boolean);
    if (found) return cb(found);
    const mo = new MutationObserver(() => {
      const el = selectors.map(s => document.querySelector(s)).find(Boolean);
      if (el) { mo.disconnect(); cb(el); }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    if (timeoutMs) setTimeout(() => mo.disconnect(), timeoutMs);
  }
  
  function normalize(txt){ return (txt||"").trim().toLowerCase(); }
  
  // najde „položku varianty“ podle textu v .label nebo podle value rádia
  function findVariantItem({ text, value }) {
    const items = document.querySelectorAll('label.itemLabel.custom-variant');
    const wantedText = normalize(text);
    for (const item of items) {
      const labelDiv = item.querySelector('.label');
      const input = item.querySelector('input[type="radio"]');
      const labelText = normalize(labelDiv?.textContent);
      const valueMatch = value != null && input && input.value == value;
      const textMatch = wantedText && labelText.includes(wantedText);
      if (valueMatch || textMatch) {
        return { item, input };
      }
    }
    return null;
  }
  
  function selectVariant({ text, value }) {
    const found = findVariantItem({ text, value });
    if (!found) return false;
  
    const { item, input } = found;
  
    // 1) klik na celý label
    item.click();
  
    // 2) jistota – klik přímo na radio + změnové eventy
    if (input) {
      input.click();
      input.checked = true;
      input.dispatchEvent(new Event('input',  { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return true;
  }
  
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.pick-variant[data-variant], .pick-variant[data-variant-value]');
    if (!btn) return;
  
    const text  = btn.getAttribute('data-variant') || '';
    const value = btn.hasAttribute('data-variant-value') ? btn.getAttribute('data-variant-value') : null;
  
    // scroll k cíli
    (document.querySelector('#contact') || document.body)
      .scrollIntoView({ behavior: 'smooth', block: 'start' });
  
    // počkej, až SS domaluje strukturu variant
    waitForAny(
      ['label.itemLabel.custom-variant', 'input[type="radio"][name*="payment"][value]'],
      () => { selectVariant({ text, value }); }
    );
  });
