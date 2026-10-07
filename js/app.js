/**
 * Fitora – CORE APPLICATION CONTROLLER
 * Handles global navigation, modals, toasts, sidebar, and auth UI.
 */


// Toast notification helper
function showToast(message, type = "success", title = "") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: "fa-circle-check",
    info: "fa-circle-info",
    warning: "fa-triangle-exclamation",
    error: "fa-circle-xmark"
  };

  const defaultTitles = {
    success: "Success",
    info: "Information",
    warning: "Notice",
    error: "Error"
  };

  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || 'fa-bell'} toast-icon"></i>
    <div class="toast-body">
      <div class="toast-title">${title || defaultTitles[type] || 'Notification'}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// Modal helper functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    // If mobile sidebar drawer is open, close it cleanly so modal is fully visible
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    if (sidebar && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
    }
    if (overlay && overlay.classList.contains("active")) {
      overlay.classList.remove("active");
    }
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
}

window.openModal = openModal;
window.closeModal = closeModal;

// Initialize Application UI
document.addEventListener("DOMContentLoaded", () => {

  // Highlight active nav item based on current URL path
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-item a, .bottom-nav-item");
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      const parent = link.closest(".nav-item") || link;
      parent.classList.add("active");
    }
  });

  // Mobile menu drawer toggle
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const closeSidebarBtn = document.querySelector(".sidebar-close-btn");
  let overlay = document.querySelector(".sidebar-overlay");

  if (mobileToggle && sidebar) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
    }

    mobileToggle.addEventListener("click", () => {
      sidebar.classList.add("open");
      overlay.classList.add("active");
    });

    const closeSidebar = () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
    };

    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener("click", closeSidebar);
    }
    overlay.addEventListener("click", closeSidebar);
  }

  // Bind close buttons on all modals
  document.querySelectorAll(".modal-close-btn, [data-close-modal]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal-overlay");
      if (modal) {
        modal.classList.remove("open");
        document.body.style.overflow = "";
      }
    });
  });

  // Close modal when clicking backdrop
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("open");
        document.body.style.overflow = "";
      }
    });
  });

  // Quick action log button in topbar
  const quickLogBtn = document.querySelector(".quick-action-btn");
  if (quickLogBtn) {
    quickLogBtn.addEventListener("click", () => {
      openModal("quickLogModal");
    });
  }

  // Quick Log Modal Form Handler
  const quickLogForm = document.getElementById("quickLogForm");
  if (quickLogForm) {
    quickLogForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const sport = document.getElementById("quickLogSport").value;
      const title = document.getElementById("quickLogTitle").value || `${sport} Session`;
      const duration = document.getElementById("quickLogDuration").value || "45m";
      const calories = parseInt(document.getElementById("quickLogCalories").value) || 350;
      const highlight = document.getElementById("quickLogNotes").value || "Completed planned target";

      const iconMap = {
        "Gym": "fa-dumbbell",
        "Cricket": "fa-baseball-bat-ball",
        "Badminton": "fa-medal"
      };

      const badgeMap = {
        "Gym": "badge-emerald",
        "Cricket": "badge-cyan",
        "Badminton": "badge-purple"
      };

      const newActivity = {
        id: "act-" + Date.now(),
        sport: sport,
        title: title,
        date: "Just now",
        duration: duration,
        calories: calories,
        highlight: highlight,
        icon: iconMap[sport] || "fa-bolt",
        badgeClass: badgeMap[sport] || "badge-emerald"
      };

      const activities = JSON.parse(localStorage.getItem("Fitora_recent_activities") || "[]");
      activities.unshift(newActivity);
      localStorage.setItem("Fitora_recent_activities", JSON.stringify(activities));

      closeModal("quickLogModal");
      quickLogForm.reset();
      showToast(`${sport} session recorded successfully!`, "success", "Activity Logged");

      // Reload or trigger update if on dashboard
      if (typeof window.refreshDashboardFeed === "function") {
        window.refreshDashboardFeed();
      }
    });
  }

  // Render current user details from localStorage (set on login/register)
  const storedUser = JSON.parse(localStorage.getItem("Fitora_user") || "null");
  if (storedUser) {
    document.querySelectorAll(".sidebar-user-name, .topbar-user-name").forEach(el => {
      el.textContent = storedUser.name || 'Athlete';
    });
    document.querySelectorAll(".sidebar-user-role").forEach(el => {
      el.textContent = storedUser.fitnessGoal || storedUser.selectedSport || 'Fitora Athlete';
    });
    document.querySelectorAll(".sidebar-user-avatar, .user-profile-avatar").forEach(el => {
      if (storedUser.avatar) el.src = storedUser.avatar;
    });
  }

  // Logout
  document.querySelectorAll(".sidebar-logout-btn, .logout-action").forEach(btn => {
    btn.addEventListener("click", () => {
      if (typeof showToast === "function") showToast("Logging out...", "info");
      setTimeout(() => {
        if (window.Fitora && window.Fitora.Auth) {
          window.Fitora.Auth.logout();
        } else {
          localStorage.removeItem('Fitora_token');
          localStorage.removeItem('Fitora_user');
          window.location.href = "login.html";
        }
      }, 500);
    });
  });

  // Handle profile clicking across all pages
  document.querySelectorAll(".sidebar-user-card, .user-profile-menu").forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      // Don't trigger if logout button was clicked
      if (e.target.closest(".sidebar-logout-btn")) return;
      if (typeof window.openProfileModal === "function") {
        window.openProfileModal();
      } else {
        window.location.href = "index.html?profile=1";
      }
    });
  });

  // Handle bottom nav profile link
  document.querySelectorAll(".bottom-nav-item").forEach(link => {
    const text = link.textContent.trim().toLowerCase();
    if (text.includes("profile")) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        if (typeof window.openProfileModal === "function") {
          window.openProfileModal();
        } else {
          window.location.href = "index.html?profile=1";
        }
      });
    }
  });

  // Auto-open profile modal if URL has ?profile=1
  if (new URLSearchParams(window.location.search).get('profile')) {
    setTimeout(() => {
      if (typeof window.openProfileModal === "function") {
        window.openProfileModal();
      }
    }, 250);
  }
});
