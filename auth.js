/* =========================================================
   Bestlink OMS — Login logic
   Uses localStorage as a temporary "database" per the brief.
   Demo accounts are seeded on first load so the module is
   runnable standalone (no backend yet).
   ========================================================= */

const OMS_ROLES = {
  student: { label: "Student", icon: "fa-user-graduate", demoUser: "juan.delacruz", demoPass: "student123", landing: "dashboard.html" },
  officer:  { label: "Officer",  icon: "fa-id-badge",     demoUser: "maria.santos",   demoPass: "officer123", landing: "dashboard.html" },
  adviser:  { label: "Adviser",  icon: "fa-chalkboard-teacher", demoUser: "prof.reyes", demoPass: "adviser123", landing: "dashboard.html" },
  admin:    { label: "OSA / Admin", icon: "fa-user-shield", demoUser: "osa.admin", demoPass: "admin123", landing: "dashboard.html" },
};

function seedDemoData() {
  if (!localStorage.getItem("oms_seeded")) {
    const orgCategories = {
      loc: ["League of Organizational Chairpersons (LOC)"],
      academic: ["ACADS","ACES","AISS","BLISS","BRAVE","CJSU","EYO","G.A.L.A.W.","GEMs","GOLD","JFINEX","HRS","JMA","LAKAS","LAPIS","LIBRO","OMEGA","PsychSoc","RSD","SIGMA","TECHs","TTS","WIKA"],
      nonacademic: ["ACAC","CESC","EBCP Chess Team","RCYC-BCP","SMC","ALL STAR","B-FORCE","Creative Arts","CDC","DLC","Ikatlong Lahi Royalties","Image Alchemy","SIKAT","Unlimited Voice"],
      independent: ["Peer Counselor","NEWSLINK","Gender and Development Core Group"],
    };
    localStorage.setItem("oms_org_categories", JSON.stringify(orgCategories));
    localStorage.setItem("oms_seeded", "true");
  }
}

function initRoleTabs() {
  const tabs = document.querySelectorAll(".role-tabs button");
  const userIdLabel = document.getElementById("userIdLabel");
  const demoHint = document.getElementById("demoHint");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const role = tab.dataset.role;
      document.getElementById("loginForm").dataset.role = role;
      if (userIdLabel) {
        userIdLabel.textContent = role === "student" ? "Student ID / Username" : "Username";
      }
      if (demoHint) {
        const r = OMS_ROLES[role];
        demoHint.innerHTML = `<i class="fa-solid fa-circle-info me-1"></i>Demo login — Username: <strong>${r.demoUser}</strong> · Password: <strong>${r.demoPass}</strong>`;
      }
    });
  });
}

function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const role = form.dataset.role || "student";
    const roleMeta = OMS_ROLES[role];
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      Swal.fire({ icon: "warning", title: "Missing details", text: "Please enter your username and password.", confirmButtonColor: "#0B5ED7" });
      return;
    }

    // Demo validation against seeded credentials for the selected role
    if (username === roleMeta.demoUser && password === roleMeta.demoPass) {
      const session = {
        role,
        name: {
          student: "Juan Dela Cruz",
          officer: "Maria Santos",
          adviser: "Prof. Angelo Reyes",
          admin: "OSA Administrator",
        }[role],
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem("oms_session", JSON.stringify(session));

      Swal.fire({
        icon: "success",
        title: `Welcome, ${session.name}`,
        text: `Signed in as ${roleMeta.label}. Redirecting to your dashboard…`,
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = roleMeta.landing + "?role=" + role;
      });
    } else {
      Swal.fire({ icon: "error", title: "Invalid credentials", text: "Please check your username and password, or use the demo credentials shown below.", confirmButtonColor: "#0B5ED7" });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  seedDemoData();
  initRoleTabs();
  initLoginForm();

  const params = new URLSearchParams(window.location.search);
  const preselect = params.get("role");
  if (preselect && OMS_ROLES[preselect]) {
    document.querySelector(`.role-tabs button[data-role="${preselect}"]`)?.click();
  }
});
