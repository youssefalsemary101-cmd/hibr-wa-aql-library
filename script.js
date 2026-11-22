
document.addEventListener("DOMContentLoaded", function () {

  const library = document.getElementById("library");
  const latestBooks = document.getElementById("latest-books");

  const stages = {
    primary: {
      name: "المرحلة الابتدائية",
      grades: [
        "الصف الأول الابتدائي",
        "الصف الثاني الابتدائي",
        "الصف الثالث الابتدائي",
        "الصف الرابع الابتدائي",
        "الصف الخامس الابتدائي",
        "الصف السادس الابتدائي"
      ]
    },
    preparatory: {
      name: "المرحلة الإعدادية",
      grades: [
        "الصف الأول الإعدادي",
        "الصف الثاني الإعدادي",
        "الصف الثالث الإعدادي"
      ]
    },
    secondary: {
      name: "الثانوية العامة",
      grades: [
        "الصف الأول الثانوي",
        "الصف الثاني الثانوي",
        "الصف الثالث الثانوي"
      ]
    },
    baccalaureate: {
      name: "البكالوريا",
      grades: [
        "الصف الأول البكالوريا",
        "الصف الثاني البكالوريا",
        "الصف الثالث البكالوريا"
      ]
    }
  };

  // المواد المبدئية - سيتم تخصيصها حسب الصف والمنهج
  const subjects = [
    "اللغة العربية",
    "اللغة الإنجليزية",
    "الرياضيات",
    "العلوم",
    "الدراسات الاجتماعية"
  ];

  function clearDynamicSections() {
    document.querySelectorAll(".dynamic-section").forEach(section => {
      section.remove();
    });
  }

  function createSection(title, description, content) {
    const section = document.createElement("section");
    section.className = "main-section container dynamic-section";

    section.innerHTML = `
      <h2 class="section-title">${title}</h2>
      <p class="section-description">${description}</p>
      <div class="stages-grid">${content}</div>
    `;

    return section;
  }

  // عرض الصفوف
  function showGrades(stageKey) {
    const stage = stages[stageKey];
    if (!stage) return;

    clearDynamicSections();

    const gradesHTML = stage.grades.map((grade, index) => `
      <div class="card stage-card">
        <h3>${grade}</h3>
        <button class="primary-button" data-grade="${index}">
          عرض المواد
        </button>
      </div>
    `).join("");

    const section = createSection(
      stage.name,
      "اختر الصف الدراسي للوصول إلى المواد.",
      gradesHTML
    );

    library.after(section);

    section.querySelectorAll("[data-grade]").forEach(button => {
      button.addEventListener("click", function () {
        showSubjects(stageKey, Number(button.dataset.grade));
      });
    });

    section.scrollIntoView({ behavior: "smooth" });
  }

  // عرض المواد
  function showSubjects(stageKey, gradeIndex) {
    const stage = stages[stageKey];
    const gradeName = stage.grades[gradeIndex];

    clearDynamicSections();

    const subjectsHTML = subjects.map(subject => `
      <div class="card stage-card">
        <h3>${subject}</h3>
        <button class="primary-button" data-subject="${subject}">
          عرض الكتب
        </button>
      </div>
    `).join("");

    const section = createSection(
      gradeName,
      "اختر المادة التي تريد تصفح كتبها.",
      subjectsHTML
    );

    library.after(section);

    section.querySelectorAll("[data-subject]").forEach(button => {
      button.addEventListener("click", function () {
        showBooks(stageKey, gradeIndex, button.dataset.subject);
      });
    });

    section.scrollIntoView({ behavior: "smooth" });
  }

  // عرض الكتب - واجهة مؤقتة حتى إضافة الكتب
  function showBooks(stageKey, gradeIndex, subjectName) {
    const stage = stages[stageKey];
    const gradeName = stage.grades[gradeIndex];

    clearDynamicSections();

    const section = createSection(
      subjectName,
      `${stage.name} - ${gradeName}`,
      `
        <div class="card">
          <h3>لا توجد كتب مضافة حاليًا</h3>
          <p>سيتم إضافة الكتب الخاصة بهذه المادة قريبًا.</p>
        </div>
      `
    );

    library.after(section);
    section.scrollIntoView({ behavior: "smooth" });
  }

  // أزرار اختيار المرحلة
  document.querySelectorAll("[data-stage]").forEach(button => {
    button.addEventListener("click", function () {
      showGrades(button.dataset.stage);
    });
  });

  // البحث المبدئي
  const searchInput = document.getElementById("book-search");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const query = searchInput.value.trim();

      if (!query) {
        latestBooks.innerHTML = `
          <div class="card">
            <p>سيتم إضافة الكتب قريبًا.</p>
          </div>
        `;
        return;
      }

      latestBooks.innerHTML = `
        <div class="card">
          <p>بحث عن: ${query.replace(/[&<>"']/g, "")}</p>
          <p>سيتم تفعيل البحث في الكتب بعد إضافة محتوى المكتبة.</p>
        </div>
      `;
    });
  }

});
