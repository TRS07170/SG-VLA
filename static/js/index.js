(function () {
  "use strict";

  const whenReady = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  };

  const writeToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.left = "-9999px";
    helper.style.top = "0";
    document.body.appendChild(helper);
    helper.select();

    const copied = document.execCommand("copy");
    helper.remove();

    if (!copied) {
      throw new Error("The browser did not allow clipboard access.");
    }
  };

  const setupCitationCopy = () => {
    const buttons = document.querySelectorAll(
      "#copy-bibtex, [data-copy-target]"
    );

    buttons.forEach((button) => {
      const selector = button.dataset.copyTarget || "#bibtex-code";
      const source = document.querySelector(selector);
      if (!source) {
        return;
      }

      const statusSelector = button.dataset.copyStatus || "#copy-status";
      const status = document.querySelector(statusSelector);
      const originalLabel = button.textContent.trim() || "Copy";
      let resetTimer;

      button.addEventListener("click", async () => {
        window.clearTimeout(resetTimer);

        try {
          await writeToClipboard(source.textContent.trim());
          button.textContent = "Copied!";
          button.dataset.copyState = "success";
          if (status) {
            status.textContent = "BibTeX copied to clipboard.";
          }
        } catch (_error) {
          button.textContent = "Copy failed";
          button.dataset.copyState = "error";
          if (status) {
            status.textContent =
              "Could not copy automatically. Select the citation and copy it manually.";
          }
        }

        resetTimer = window.setTimeout(() => {
          button.textContent = originalLabel;
          delete button.dataset.copyState;
          if (status) {
            status.textContent = "";
          }
        }, 2600);
      });
    });
  };

  const setupViewportVideos = () => {
    const videos = Array.from(
      document.querySelectorAll(
        "video[data-autoplay], .teaser video, .video-card video, video.autoplay-when-visible"
      )
    );

    if (!videos.length) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const visibleVideos = new Set();

    const pauseVideo = (video) => {
      if (!video.paused) {
        video.pause();
      }
    };

    const playVideo = (video) => {
      if (
        reducedMotion.matches ||
        document.hidden ||
        video.dataset.autoplay === "false"
      ) {
        return;
      }

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Autoplay can be blocked by browser or power-saving policies.
          // Controls remain available for explicit playback.
        });
      }
    };

    videos.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
    });

    let observer;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
              visibleVideos.add(video);
              playVideo(video);
            } else {
              visibleVideos.delete(video);
              pauseVideo(video);
            }
          });
        },
        {
          rootMargin: "0px 0px -8% 0px",
          threshold: [0, 0.35, 0.75],
        }
      );

      videos.forEach((video) => observer.observe(video));
    } else if (!reducedMotion.matches) {
      videos.forEach((video) => {
        visibleVideos.add(video);
        playVideo(video);
      });
    }

    const handleMotionPreference = () => {
      if (reducedMotion.matches) {
        videos.forEach(pauseVideo);
        return;
      }
      visibleVideos.forEach(playVideo);
    };

    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", handleMotionPreference);
    } else if (typeof reducedMotion.addListener === "function") {
      reducedMotion.addListener(handleMotionPreference);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        videos.forEach(pauseVideo);
      } else {
        visibleVideos.forEach(playVideo);
      }
    });
  };

  const makeScrollableTablesKeyboardAccessible = () => {
    document.querySelectorAll(".table-container").forEach((container) => {
      if (!container.hasAttribute("tabindex")) {
        container.setAttribute("tabindex", "0");
      }
      if (!container.hasAttribute("role")) {
        container.setAttribute("role", "region");
      }
      if (
        !container.hasAttribute("aria-label") &&
        !container.hasAttribute("aria-labelledby")
      ) {
        const caption = container.querySelector("caption");
        container.setAttribute(
          "aria-label",
          caption ? caption.textContent.trim() : "Scrollable results table"
        );
      }
    });
  };

  whenReady(() => {
    setupCitationCopy();
    setupViewportVideos();
    makeScrollableTablesKeyboardAccessible();
  });
})();
