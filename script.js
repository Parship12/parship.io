(function () {
  // Get theme from localStorage or default to 'dark'
  function getTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "dark"; // Default to dark
  }

  // Apply theme
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    updateThemeIcon(theme);
  }

  // Update theme icon
  function updateThemeIcon(theme) {
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");

    if (!sunIcon || !moonIcon) return;
    if (theme === "dark") {
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    } else {
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    }
  }

  // Toggle theme
  function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  }
  const theme = getTheme();
  applyTheme(theme);

  document.addEventListener("DOMContentLoaded", function () {
    updateThemeIcon(getTheme());

    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }

    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", function (e) {
        // Only update if user hasn't manually set a preference
        if (!localStorage.getItem("theme")) {
          applyTheme(e.matches ? "dark" : "light");
        }
      });
    }
  });
})();

// GitHub Contributions
(function () {
  const GITHUB_USERNAME = "Parship12";

  async function fetchGitHubContributions() {
    const totalElement = document.getElementById("github-total");
    const chartElement = document.getElementById("github-chart");

    if (!totalElement || !chartElement) return;
    totalElement.textContent = "Loading...";

    try {
      chartElement.src = `https://ghchart.rshah.org/${GITHUB_USERNAME}?theme=default`;
      chartElement.alt = `${GITHUB_USERNAME}'s GitHub contribution graph`;
      chartElement.onerror = function () {
        chartElement.src = `https://github-contributions.vercel.app/api/v1/${GITHUB_USERNAME}?no-frame=true`;
      };

      let totalContributions = 0;
      const currentYear = new Date().getFullYear();

      // Try primary API
      try {
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          totalContributions = data?.total?.[currentYear] || data?.contributions?.total || 0;
        }
      } catch (e) {
        console.log("Primary API failed, trying alternative...");
      }

      if (totalContributions === 0) {
        try {
          const response = await fetch(
            `https://github-contributions.vercel.app/api/v1/${GITHUB_USERNAME}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.contributions && Array.isArray(data.contributions)) {
              totalContributions = data.contributions.reduce(
                (sum, day) => sum + (day.count || 0),
                0
              );
            }
          }
        } catch (e) {
          console.log("Alternative API also failed");
        }
      }

      // Update total display
      if (totalContributions > 0) {
        totalElement.textContent = totalContributions.toLocaleString();
      } else {
        totalElement.textContent = "Unable to load";
      }
    } catch (error) {
      console.error("Error fetching GitHub contributions:", error);
      totalElement.textContent = "Error loading";
      chartElement.alt = "GitHub contribution graph (unavailable)";
    }
  }

  // Initialize on page load
  document.addEventListener("DOMContentLoaded", function () {
    if (GITHUB_USERNAME && GITHUB_USERNAME !== "YOUR_GITHUB_USERNAME") {
      fetchGitHubContributions();
    } else {
      const totalElement = document.getElementById("github-total");
      const chartElement = document.getElementById("github-chart");
      if (totalElement) {
        totalElement.textContent = "Update username in script.js";
      }
      if (chartElement) {
        chartElement.style.display = "none";
      }
    }
  });
})();

// Navigation is now always visible at the bottom - no scroll transparency needed

// Smooth scrolling for anchor links
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href === "#" || href === "#resume" || href === "#blogs") {
          return; // Don't scroll for placeholder links
        }

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const targetPosition = target.offsetTop - navHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });
  });
})();

(function () {
  const padding = 50;
  let mouseX = padding;
  let mouseY = padding;
  let currentX = padding;
  let currentY = padding;
  let hasMoved = false;

  // Track mouse position
  document.addEventListener("mousemove", function (e) {
    if (!hasMoved) {
      hasMoved = true;
    }
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener("DOMContentLoaded", function () {
    const customCursor = document.querySelector(".custom-cursor");
    if (!customCursor) return;

    // Set initial position at top-left corner with padding
    customCursor.style.left = padding + "px";
    customCursor.style.top = padding + "px";
    customCursor.style.display = "block";
    customCursor.style.visibility = "visible";
    customCursor.style.opacity = "1";

    function animate() {
      if (hasMoved) {
        currentX += (mouseX - currentX) * 0.15;
        currentY += (mouseY - currentY) * 0.15;
      } else {
        // Stay at corner position
        currentX = padding;
        currentY = padding;
      }

      customCursor.style.left = currentX + "px";
      customCursor.style.top = currentY + "px";

      requestAnimationFrame(animate);
    }
    animate();
  });
})();
