/* =========================================================
   Bestlink OMS — Dashboard logic (OSA / Admin view)
   ========================================================= */

const CAT_COLORS = {
  loc: "#071C36",
  academic: "#0B5ED7",
  nonacademic: "#FFC107",
  independent: "#14919B",
};

function guardSession() {
  const raw = localStorage.getItem("oms_session");
  if (!raw) {
    window.location.href = "login.html";
    return null;
  }
  return JSON.parse(raw);
}

function paintIdentity(session) {
  const roleLabel = {
    student: "Student",
    officer: "Organization Officer",
    adviser: "Adviser",
    admin: "OSA / Admin",
  }[session.role] || "User";

  document.querySelectorAll("[data-user-name]").forEach((el) => (el.textContent = session.name));
  document.querySelectorAll("[data-user-role]").forEach((el) => (el.textContent = roleLabel));
  document.querySelectorAll("[data-user-initials]").forEach((el) => {
    const initials = session.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
    el.textContent = initials.toUpperCase();
  });
  document.querySelectorAll("[data-greeting]").forEach((el) => {
    const hour = new Date().getHours();
    const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    el.textContent = `Good ${part}, ${session.name.split(" ")[0]}`;
  });
}

function initSidebarToggle() {
  const btn = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  if (!btn || !sidebar) return;
  btn.addEventListener("click", () => {
    if (window.innerWidth <= 767) {
      sidebar.classList.toggle("mobile-open");
    } else {
      sidebar.classList.toggle("collapsed");
    }
  });
}

function initDarkMode() {
  const toggle = document.getElementById("darkModeToggle");
  if (!toggle) return;
  const saved = localStorage.getItem("oms_dark") === "1";
  document.body.classList.toggle("dark", saved);
  toggle.checked = saved;
  toggle.addEventListener("change", () => {
    document.body.classList.toggle("dark", toggle.checked);
    localStorage.setItem("oms_dark", toggle.checked ? "1" : "0");
  });
}

function initNotifications() {
  const bell = document.getElementById("notifBell");
  if (!bell) return;
  bell.addEventListener("click", () => {
    Swal.fire({
      title: "Notifications",
      html: `
        <div style="text-align:left; font-size:0.85rem;">
          <p class="mb-2"><strong>New budget request</strong><br><span style="color:#6B7686;">SIGMA submitted a ₱8,500 budget request for their General Assembly.</span></p>
          <p class="mb-2"><strong>Membership applications pending</strong><br><span style="color:#6B7686;">12 new applications await review across 5 organizations.</span></p>
          <p class="mb-0"><strong>Election reminder</strong><br><span style="color:#6B7686;">LOC officer elections open for filing of candidacy on Aug 4.</span></p>
        </div>`,
      confirmButtonText: "Close",
      confirmButtonColor: "#0B5ED7",
    });
  });
}

function initLogout() {
  document.querySelectorAll("[data-logout]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      Swal.fire({
        icon: "question",
        title: "Sign out?",
        text: "You'll need to sign in again to access your dashboard.",
        showCancelButton: true,
        confirmButtonText: "Sign out",
        confirmButtonColor: "#0B5ED7",
      }).then((res) => {
        if (res.isConfirmed) {
          localStorage.removeItem("oms_session");
          window.location.href = "login.html";
        }
      });
    });
  });
}

function buildCharts() {
  const ctxColors = document.body.classList.contains("dark") ? "#8DA0BC" : "#6B7686";
  Chart.defaults.font.family = "Inter, sans-serif";
  Chart.defaults.color = ctxColors;

  // Membership per organization (top 8 orgs, category-colored)
  const membershipCtx = document.getElementById("membershipChart");
  if (membershipCtx) {
    new Chart(membershipCtx, {
      type: "bar",
      data: {
        labels: ["ACES", "TECHs", "SIGMA", "LAKAS", "CDC", "ALL STAR", "NEWSLINK", "SIKAT"],
        datasets: [{
          label: "Active members",
          data: [86, 74, 68, 61, 57, 52, 34, 41],
          backgroundColor: ["#0B5ED7","#0B5ED7","#0B5ED7","#0B5ED7","#FFC107","#FFC107","#14919B","#FFC107"],
          borderRadius: 6,
          maxBarThickness: 28,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.15)" } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  // Activities per month
  const activitiesCtx = document.getElementById("activitiesChart");
  if (activitiesCtx) {
    new Chart(activitiesCtx, {
      type: "line",
      data: {
        labels: ["Feb","Mar","Apr","May","Jun","Jul"],
        datasets: [{
          label: "Activities held",
          data: [9, 14, 11, 6, 4, 17],
          borderColor: "#0B5ED7",
          backgroundColor: "rgba(11,94,215,0.1)",
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#0B5ED7",
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.15)" } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  // Budget allocation (doughnut, category colors)
  const budgetCtx = document.getElementById("budgetChart");
  if (budgetCtx) {
    new Chart(budgetCtx, {
      type: "doughnut",
      data: {
        labels: ["Academic orgs", "Non-academic orgs", "Independent orgs", "LOC council"],
        datasets: [{
          data: [148000, 96000, 22000, 30000],
          backgroundColor: [CAT_COLORS.academic, CAT_COLORS.nonacademic, CAT_COLORS.independent, CAT_COLORS.loc],
          borderWidth: 0,
        }],
      },
      options: {
        cutout: "68%",
        plugins: { legend: { position: "bottom", labels: { boxWidth: 8, usePointStyle: true, padding: 14, font: { size: 11 } } } },
      },
    });
  }

  // Organization performance (radar)
  const perfCtx = document.getElementById("performanceChart");
  if (perfCtx) {
    new Chart(perfCtx, {
      type: "radar",
      data: {
        labels: ["Attendance", "Documentation", "Budget use", "Activities", "Membership growth"],
        datasets: [
          {
            label: "ACES",
            data: [88, 74, 65, 90, 80],
            borderColor: "#0B5ED7",
            backgroundColor: "rgba(11,94,215,0.12)",
          },
          {
            label: "CDC",
            data: [70, 82, 88, 60, 55],
            borderColor: "#E6AC00",
            backgroundColor: "rgba(255,193,7,0.15)",
          },
        ],
      },
      options: {
        plugins: { legend: { position: "bottom", labels: { boxWidth: 8, usePointStyle: true, font: { size: 11 } } } },
        scales: { r: { grid: { color: "rgba(148,163,184,0.2)" }, angleLines: { color: "rgba(148,163,184,0.2)" }, pointLabels: { font: { size: 10 } } } },
      },
    });
  }
}

function initTable() {
  const table = document.getElementById("recentActivitiesTable");
  if (table && window.jQuery) {
    $(table).DataTable({
      pageLength: 5,
      lengthChange: false,
      searching: false,
      info: false,
      order: [],
      language: { paginate: { previous: "‹", next: "›" } },
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const session = guardSession();
  if (!session) return;
  paintIdentity(session);
  initSidebarToggle();
  initDarkMode();
  initNotifications();
  initLogout();
  buildCharts();
  initTable();
});
