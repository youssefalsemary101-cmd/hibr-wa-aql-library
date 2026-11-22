
document.addEventListener("DOMContentLoaded", function () {

  const library = document.getElementById("library");
  const latestBooks = document.getElementById("latest-books");

  // التأكد من تحميل بيانات المنهج
  if (typeof curriculum === "undefined") {
    library.innerHTML = `
      <h2 class="section-title">تعذر تحميل المنهج</h2>
      <p>تأكد من وجود ملف curriculum.js وربطه بالصفحة.</p>
    `;
    return;
  }

  // تنظيف الأقسام التي يتم إنشاؤها أثناء التنقل
  function clearDynamicSections() {
    document.querySelectorAll(".dynamic-section").forEach(section => {
      section.remove();
    });
  }

  // حماية النصوص التي تظهر داخل HTML
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  // إنشاء قسم جديد
  function createSection(title, description, content) {
    const section = document.createElement("section");

    section.className = "main-section container dynamic-section";

    section.innerHTML = `
      <h2 class="section-title">${escapeHTML(title)}</h2>
      <p class="section-description">${escapeHTML(description)}</p>
      <div class="stages-grid">${content}</div>
    `;

    return section;
  }

  // إنشاء بطاقة
  function createCard(title, buttonText, attribute, value) {
    return `
      <div class="card stage-card">
        <h3>${escapeHTML(title)}</h3>
        <button class="primary-button" ${attribute}="${escapeHTML(value)}">
          ${escapeHTML(buttonText)}
        </button>
      </div>
    `;
  }

  // عرض الصفوف
  function showGrades(stageKey) {
    const stage = curriculum[stageKey];

    if (!stage) return;

    clearDynamicSections();

    const gradeEntries = Object.entries(stage.grades);

    const gradesHTML = gradeEntries.map(([gradeKey, gradeData]) => {

      const gradeName = getGradeName(stageKey, gradeKey);

      return createCard(
        gradeName,
        "عرض المواد",
        "data-grade",
        gradeKey
      );

    }).join("");

    const section = createSection(
      stage.name,
      "اختر الصف الدراسي.",
      gradesHTML
    );

    library.after(section);

    section.querySelectorAll("[data-grade]").forEach(button => {
      button.addEventListener("click", function () {
        showGradeContent(stageKey, button.dataset.grade);
      });
    });

    section.scrollIntoView({ behavior: "smooth" });
  }

  // اسم الصف
  function getGradeName(stageKey, gradeKey) {
    const number = Number(gradeKey);

    if (stageKey === "primary") {
      return `الصف ${number} الابتدائي`;
    }

    if (stageKey === "preparatory") {
      return `الصف ${number} الإعدادي`;
    }

    if (stageKey === "secondary") {
      return `الصف ${number} الثانوي`;
    }

    if (stageKey === "baccalaureate") {
      return `الصف ${number} البكالوريا`;
    }

    return `الصف ${gradeKey}`;
  }

  // عرض المواد أو الشعب أو المسارات
  function showGradeContent(stageKey, gradeKey) {
    const stage = curriculum[stageKey];
    const gradeData = stage.grades[gradeKey];
    const gradeName = getGradeName(stageKey, gradeKey);

    clearDynamicSections();

    // إذا كانت بيانات الصف عبارة عن قائمة مواد
    if (Array.isArray(gradeData)) {
      showSubjects(stageKey, gradeKey, null, gradeData);
      return;
    }

    // إذا كان الصف يحتوي على شعب أو مسارات
    if (typeof gradeData === "object" && gradeData !== null) {

      const optionsHTML = Object.keys(gradeData).map(option => {
        return createCard(
          option,
          "عرض المواد",
          "data-option",
          option
        );
      }).join("");

      const section = createSection(
        gradeName,
        "اختر الشعبة أو المسار.",
        optionsHTML
      );

      library.after(section);

      section.querySelectorAll("[data-option]").forEach(button => {
        button.addEventListener("click", function () {
          const optionName = button.dataset.option;
          const optionData = gradeData[optionName];

          showSubjects(
            stageKey,
            gradeKey,
            optionName,
            optionData
          );
        });
      });

      section.scrollIntoView({ behavior: "smooth" });
    }
  }

  // عرض المواد
  function showSubjects(stageKey, gradeKey, optionName, subjectList) {
    const stage = curriculum[stageKey];
    const gradeName = getGradeName(stageKey, gradeKey);

    clearDynamicSections();

    const subjectsHTML = subjectList.map(subject => {
      return createCard(
        subject,
        "فتح المادة",
        "data-subject",
        subject
      );
    }).join("");

    const title = optionName || gradeName;

    const description = optionName
      ? `${gradeName} - ${optionName}`
      : "اختر المادة التي تريد تصفح كتبها.";

    const section = createSection(
      title,
      description,
      subjectsHTML
    );

    library.after(section);

    section.querySelectorAll("[data-subject]").forEach(button => {
      button.addEventListener("click", function () {
        showBooks(
          stageKey,
          gradeKey,
          optionName,
          button.dataset.subject
        );
      });
    });

    section.scrollIntoView({ behavior: "smooth" });
  }

  // صفحة الكتب
  function showBooks(stageKey, gradeKey, optionName, subjectName) {
    const stage = curriculum[stageKey];
    const gradeName = getGradeName(stageKey, gradeKey);

    clearDynamicSections();

    const description = optionName
      ? `${gradeName} - ${optionName}`
      : gradeName;

    const section = createSection(
      subjectName,
      description,
      `
        <div class="card">
          <h3>كتب ${escapeHTML(subjectName)}</h3>
          <p>لا توجد كتب مضافة لهذه المادة حاليًا.</p>
          <p>سيتم توفير الكتب هنا عند إضافتها إلى المكتبة.</p>
        </div>
      `
    );

    library.after(section);

    section.scrollIntoView({ behavior: "smooth" });
  }

  // أزرار المراحل التعليمية
  document.querySelectorAll("[data-stage]").forEach(button => {
    button.addEventListener("click", function () {
      showGrades(button.dataset.stage);
    });
  });

  // أحدث الكتب
  if (latestBooks) {
    latestBooks.innerHTML = `
      <div class="card">
        <p>سيتم عرض أحدث الكتب المضافة هنا.</p>
      </div>
    `;
  }

});
