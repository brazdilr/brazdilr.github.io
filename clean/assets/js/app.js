const sampleTracks = [
    {
        title: "Osobní duet ke dni matek",
        style: "Pop",
        src: "assets/audio/renata.mp3"
    },
    {
        title: "K výročí svatby pro rodiče",
        style: "Dojemné",
        src: "assets/audio/renata.mp3"
    },
    {
        title: "Rockové přání pro kámoše",
        style: "Rock",
        src: "assets/audio/renata.mp3"
    },
    {
        title: "Babičce k narozeninám",
        style: "Dechovka",
        src: "assets/audio/renata.mp3"
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
    const cards = Array.from(document.querySelectorAll("[data-review-card]"));
    const dots = Array.from(document.querySelectorAll("[data-review-dot]"));
    const prevButton = document.querySelector("[data-review-prev]");
    const nextButton = document.querySelector("[data-review-next]");

    if (!cards.length || !prevButton || !nextButton) return;

    let current = 0;

    function relativeIndex(index) {
        return (index - current + cards.length) % cards.length;
    }

    function render(index) {
        current = (index + cards.length) % cards.length;

        cards.forEach((card, cardIndex) => {
            const position = relativeIndex(cardIndex);
            const isActive = position === 0;
            const isVisible = position < Math.min(cards.length, 3);

            card.classList.toggle("is-active", isActive);
            card.classList.toggle("is-visible", isVisible);
            card.classList.toggle("is-hidden", !isVisible);
            card.setAttribute("aria-hidden", isVisible ? "false" : "true");
        });

        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === current;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-current", String(isActive));
        });
    }

    prevButton.addEventListener("click", () => render(current - 1));
    nextButton.addEventListener("click", () => render(current + 1));

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            render(Number(dot.dataset.reviewDot || 0));
        });
    });

    render(0);
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
