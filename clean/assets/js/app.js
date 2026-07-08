const sampleTracks = [
    {
        title: "Rockové přání pro kámoše Radka",
        style: "Rock",
        src: "https://media.bardio.cz/ukazka-2.mp3"
    },
    {
        title: "Osobní duet ke dni matek",
        style: "Pop",
        src: "https://media.bardio.cz/ukazka-1.mp3"
    },
    {
        title: "Přání a vzpomínky babičce Anežce",
        style: "Dojemné",
        src: "https://media.bardio.cz/ukazka-5.mp3"
    },
    {
        title: "Pop rap pro naši mámu",
        style: "Rap",
        src: "https://media.bardio.cz/ukazka-4.mp3"
    },
    {
        title: "K výročí svatby pro rodiče",
        style: "Dojemné",
        src: "https://media.bardio.cz/ukazka-3.mp3"
    },
    {
        title: "Babičce k narozeninám",
        style: "Dechovka",
        src: "https://media.bardio.cz/ukazka-7.mp3"
    }
];

function initNavigation() {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.getElementById("nav-menu");

    if (!toggle || !menu) return;

    function setOpen(isOpen) {
        menu.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
    }

    toggle.addEventListener("click", () => {
        setOpen(!menu.classList.contains("is-open"));
    });

    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setOpen(false));
    });
}

function initSamplePlayer() {
    const title = document.getElementById("sample-title");
    const style = document.getElementById("sample-style");
    const playButton = document.querySelector("[data-player-play]");
    const prevButton = document.querySelector("[data-player-prev]");
    const nextButton = document.querySelector("[data-player-next]");

    if (!title || !style || !playButton || !prevButton || !nextButton) return;

    let current = 0;
    let audio = null;
    let isPlaying = false;

    function currentTrack() {
        return sampleTracks[current];
    }

    function render() {
        const track = currentTrack();
        title.textContent = track.title;
        style.textContent = track.style;
        playButton.textContent = isPlaying ? "⏸" : "▶";
        playButton.classList.toggle("is-playing", isPlaying);
        playButton.setAttribute("aria-label", isPlaying ? "Pozastavit aktuální ukázku" : "Přehrát aktuální ukázku");
    }

    function loadAudio() {
        const track = currentTrack();
        if (audio) {
            audio.pause();
        }

        audio = new Audio(track.src);
        audio.addEventListener("ended", () => {
            goTo(current + 1, true);
        });
    }

    function play() {
        if (!audio) {
            loadAudio();
        }

        audio.play().then(() => {
            isPlaying = true;
            render();
        }).catch(() => {
            isPlaying = false;
            render();
        });
    }

    function pause() {
        if (audio) {
            audio.pause();
        }

        isPlaying = false;
        render();
    }

    function goTo(index, autoplay = false) {
        current = (index + sampleTracks.length) % sampleTracks.length;
        isPlaying = false;
        loadAudio();
        render();

        if (autoplay) {
            play();
        }
    }

    playButton.addEventListener("click", () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    });

    prevButton.addEventListener("click", () => goTo(current - 1, isPlaying));
    nextButton.addEventListener("click", () => goTo(current + 1, isPlaying));

    render();
}

function initReviews() {
    const track = document.querySelector("[data-reviews]");
    const cards = Array.from(document.querySelectorAll("[data-review-card]"));
    const dotsContainer = document.querySelector("[data-review-dots]");
    const prevButton = document.querySelector("[data-review-prev]");
    const nextButton = document.querySelector("[data-review-next]");

    if (!track || !cards.length || !dotsContainer || !prevButton || !nextButton) return;

    let current = 0;
    let dots = [];
    let scrollFrame = null;
    let resizeTimer = null;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function reviewGap() {
        return parseFloat(getComputedStyle(track).gap || "0") || 0;
    }

    function visibleCount() {
        if (!cards[0]) return 1;
        const cardWidth = cards[0].getBoundingClientRect().width;
        if (!cardWidth) return 1;
        return Math.max(1, Math.min(cards.length, Math.round((track.clientWidth + reviewGap()) / (cardWidth + reviewGap()))));
    }

    function maxIndex() {
        return Math.max(0, cards.length - visibleCount());
    }

    function clampIndex(index) {
        return Math.max(0, Math.min(maxIndex(), index));
    }

    function normalizeIndex(index) {
        const last = maxIndex();
        if (index < 0) return last;
        if (index > last) return 0;
        return index;
    }

    function buildDots() {
        const count = maxIndex() + 1;
        if (dots.length === count) return;

        dotsContainer.textContent = "";
        dots = Array.from({ length: count }, (_, dotIndex) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.dataset.reviewDot = String(dotIndex);
            dot.setAttribute("aria-label", `Zobrazit reference ${dotIndex + 1}`);
            dot.addEventListener("click", () => scrollToCard(dotIndex));
            dotsContainer.append(dot);
            return dot;
        });
    }

    function updateState(index) {
        current = clampIndex(index);

        cards.forEach((card, cardIndex) => {
            const isActive = cardIndex === current;
            card.classList.toggle("is-active", isActive);
            if (isActive) {
                card.setAttribute("aria-current", "true");
            } else {
                card.removeAttribute("aria-current");
            }
        });

        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === current;
            dot.classList.toggle("is-active", isActive);
            if (isActive) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });
    }

    function closestCardIndex() {
        const scrollLeft = track.scrollLeft;

        return cards.reduce((closestIndex, card, cardIndex) => {
            const cardLeft = card.offsetLeft - track.offsetLeft;
            const closestLeft = cards[closestIndex].offsetLeft - track.offsetLeft;

            return Math.abs(cardLeft - scrollLeft) < Math.abs(closestLeft - scrollLeft)
                ? cardIndex
                : closestIndex;
        }, 0);
    }

    function scrollToCard(index, behavior = "smooth") {
        buildDots();
        const nextIndex = normalizeIndex(index);
        const card = cards[nextIndex];
        const left = card.offsetLeft - track.offsetLeft;

        updateState(nextIndex);
        track.scrollTo({
            left,
            behavior: prefersReducedMotion.matches ? "auto" : behavior
        });
    }

    track.addEventListener("scroll", () => {
        if (scrollFrame) cancelAnimationFrame(scrollFrame);
        scrollFrame = requestAnimationFrame(() => {
            updateState(closestCardIndex());
            scrollFrame = null;
        });
    }, { passive: true });

    track.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        scrollToCard(current + (event.key === "ArrowRight" ? 1 : -1));
    });

    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            buildDots();
            scrollToCard(clampIndex(current), "auto");
        }, 120);
    });

    prevButton.addEventListener("click", () => scrollToCard(current - 1));
    nextButton.addEventListener("click", () => scrollToCard(current + 1));

    buildDots();
    scrollToCard(0, "auto");
}

function initFaq() {
    document.querySelectorAll(".faq-item").forEach((item) => {
        const button = item.querySelector("button");
        if (!button) return;

        button.addEventListener("click", () => {
            const isOpen = item.classList.toggle("is-open");
            button.setAttribute("aria-expanded", String(isOpen));
            const icon = button.querySelector("span");
            if (icon) {
                icon.textContent = isOpen ? "−" : "+";
            }
        });
    });
}

function createVideoEmbed(src) {
    const empty = document.createElement("p");

    if (!src) {
        empty.textContent = "Video zatím není připojené.";
        return empty;
    }

    if (/youtube\.com|youtu\.be|vimeo\.com/.test(src)) {
        const iframe = document.createElement("iframe");
        iframe.src = src;
        iframe.title = "Ukázka Bardio";
        iframe.allow = "autoplay; fullscreen; picture-in-picture";
        iframe.allowFullscreen = true;
        return iframe;
    }

    const video = document.createElement("video");
    video.src = src;
    video.controls = true;
    video.autoplay = true;
    return video;
}

function initVideoModal() {
    const modal = document.querySelector("[data-video-modal]");
    const frame = document.querySelector("[data-video-frame]");
    const openers = document.querySelectorAll("[data-video-open]");
    const closers = document.querySelectorAll("[data-video-close]");

    if (!modal || !frame || !openers.length) return;

    let lastFocusedElement = null;

    function open(src) {
        lastFocusedElement = document.activeElement;
        frame.replaceChildren(createVideoEmbed(src));
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        modal.querySelector(".video-close")?.focus();
    }

    function close() {
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        frame.replaceChildren();

        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
    }

    openers.forEach((opener) => {
        opener.addEventListener("click", () => open(opener.dataset.videoSrc || ""));
    });

    closers.forEach((closer) => {
        closer.addEventListener("click", close);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) {
            close();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initSamplePlayer();
    initReviews();
    initFaq();
    initVideoModal();
});
