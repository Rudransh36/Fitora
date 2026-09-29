/**
 * PULSEFIT / ATHLEX - CORE APPLICATION CONTROLLER
 * Handles global state, mock data seeding, navigation, modals, and toasts.
 */

// Default mock athlete data
const DEFAULT_USER = {
  name: "Alex Rivera",
  username: "alex_pro",
  email: "alex@pulsefit.io",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  fitnessLevel: "Advanced Athlete",
  streakDays: 14,
  primarySports: ["Gym", "Cricket", "Badminton"]
};

// Seed initial state in localStorage if empty
function initializeMockDatabase() {
  if (!localStorage.getItem("pulsefit_user")) {
    localStorage.setItem("pulsefit_user", JSON.stringify(DEFAULT_USER));
  }

  if (!localStorage.getItem("pulsefit_recent_activities")) {
    const initialActivities = [
      {
        id: "act-1",
        sport: "Gym",
        title: "Upper Body Hypertrophy",
        date: "Today, 08:30 AM",
        duration: "1h 15m",
        calories: 520,
        highlight: "Bench Press 105kg x 3",
        icon: "fa-dumbbell",
        badgeClass: "badge-emerald"
      },
      {
        id: "act-2",
        sport: "Cricket",
        title: "T20 League Match vs Strikers",
        date: "Yesterday, 04:00 PM",
        duration: "2h 45m",
        calories: 840,
        highlight: "72* (44) & 2/28",
        icon: "fa-baseball-bat-ball",
        badgeClass: "badge-cyan"
      },
      {
        id: "act-3",
        sport: "Badminton",
        title: "Club Singles Championship",
        date: "2 days ago",
        duration: "55m",
        calories: 490,
        highlight: "Won 2-1 (21-17, 18-21, 21-14)",
        icon: "fa-medal",
        badgeClass: "badge-purple"
      },
      {
        id: "act-4",
        sport: "Gym",
        title: "Legs & Core Power",
        date: "3 days ago",
        duration: "1h 05m",
        calories: 580,
        highlight: "Squat 140kg x 5",
        icon: "fa-dumbbell",
        badgeClass: "badge-emerald"
      }
    ];
    localStorage.setItem("pulsefit_recent_activities", JSON.stringify(initialActivities));
  }

  // Seed gym data
  if (!localStorage.getItem("pulsefit_gym_records")) {
    const gymRecords = {
      bench: 110,
      squat: 145,
      deadlift: 180,
      overhead: 75,
      pullups: 25
    };
    localStorage.setItem("pulsefit_gym_records", JSON.stringify(gymRecords));
  }

  // Seed cricket matches
  if (!localStorage.getItem("pulsefit_cricket_matches")) {
    const cricketMatches = [
      {
        id: "crick-1",
        opponent: "Strikers CC",
        format: "T20",
        venue: "Riverside Oval",
        date: "Sep 28, 2026",
        result: "Won by 24 runs",
        runs: 72,
        balls: 44,
        fours: 7,
        sixes: 3,
        notOut: true,
        overs: 4.0,
        wickets: 2,
        runsConceded: 28,
        distanceRun: "4.8 km"
      },
      {
        id: "crick-2",
        opponent: "Apex Warriors",
        format: "50-Over",
        venue: "City Stadium",
        date: "Sep 21, 2026",
        result: "Lost by 3 wickets",
        runs: 48,
        balls: 52,
        fours: 5,
        sixes: 1,
        notOut: false,
        overs: 8.0,
        wickets: 3,
        runsConceded: 42,
        distanceRun: "7.2 km"
      },
      {
        id: "crick-3",
        opponent: "Weekend Nets Intensive",
        format: "Net Practice",
        venue: "Athletic Academy",
        date: "Sep 15, 2026",
        result: "Completed 60 mins batting",
        runs: 85,
        balls: 60,
        fours: 10,
        sixes: 4,
        notOut: true,
        overs: 5.0,
        wickets: 4,
        runsConceded: 18,
        distanceRun: "3.5 km"
      }
    ];
    localStorage.setItem("pulsefit_cricket_matches", JSON.stringify(cricketMatches));
  }

  // Seed badminton matches
  if (!localStorage.getItem("pulsefit_badminton_matches")) {
    const badmintonMatches = [
      {
        id: "badm-1",
        opponent: "Marcus Vance",
        mode: "Singles",
        date: "Sep 27, 2026",
        scoreSummary: "21-17, 18-21, 21-14",
        result: "Win",
        duration: "52m",
        smashes: 18,
        unforcedErrors: 9,
        avgRally: 8.5
      },
      {
        id: "badm-2",
        opponent: "Liam & Kevin",
        mode: "Doubles",
        date: "Sep 23, 2026",
        scoreSummary: "21-19, 21-16",
        result: "Win",
        duration: "40m",
        smashes: 24,
        unforcedErrors: 5,
        avgRally: 6.8
      },
      {
        id: "badm-3",
        opponent: "Chen Wei",
        mode: "Singles",
        date: "Sep 19, 2026",
        scoreSummary: "19-21, 21-15, 17-21",
        result: "Loss",
        duration: "64m",
        smashes: 15,
        unforcedErrors: 14,
        avgRally: 10.2
      }
    ];
    localStorage.setItem("pulsefit_badminton_matches", JSON.stringify(badmintonMatches));
  }
}

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
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
}

// Initialize Application UI
document.addEventListener("DOMContentLoaded", () => {
  initializeMockDatabase();

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

      const activities = JSON.parse(localStorage.getItem("pulsefit_recent_activities") || "[]");
      activities.unshift(newActivity);
      localStorage.setItem("pulsefit_recent_activities", JSON.stringify(activities));

      closeModal("quickLogModal");
      quickLogForm.reset();
      showToast(`${sport} session recorded successfully!`, "success", "Activity Logged");

      // Reload or trigger update if on dashboard
      if (typeof window.refreshDashboardFeed === "function") {
        window.refreshDashboardFeed();
      }
    });
  }

  // Render current user details
  const storedUser = JSON.parse(localStorage.getItem("pulsefit_user") || "null") || DEFAULT_USER;
  document.querySelectorAll(".sidebar-user-name, .topbar-user-name").forEach(el => {
    el.textContent = storedUser.name;
  });
  document.querySelectorAll(".sidebar-user-role").forEach(el => {
    el.textContent = storedUser.fitnessLevel;
  });
  document.querySelectorAll(".sidebar-user-avatar, .user-profile-avatar").forEach(el => {
    el.src = storedUser.avatar;
  });

  // Simulated Logout
  document.querySelectorAll(".sidebar-logout-btn, .logout-action").forEach(btn => {
    btn.addEventListener("click", () => {
      showToast("Logging out...", "info");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 800);
    });
  });
});
