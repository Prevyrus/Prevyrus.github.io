(function main() {
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");
  const anchors = [...document.querySelectorAll(".nav-links a")];

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => navLinks.classList.toggle("is-open"));
    anchors.forEach((a) => a.addEventListener("click", () => navLinks.classList.remove("is-open")));
  }

  const sections = anchors
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = "#" + entry.target.id;
            anchors.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === id));
          }
        });
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  }
})();
