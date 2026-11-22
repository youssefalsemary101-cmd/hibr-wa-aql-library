
document.addEventListener("DOMContentLoaded", function () {

  const library = document.getElementById("library");
  const latestBooks = document.getElementById("latest-books");

  if (typeof curriculum === "undefined") {
    library.innerHTML = `
      <h2 class="section-title">تعذر تحميل المنهج</h2>
      <p>تأكد من وجود ملف curriculum.js وربطه بالصفحة.</p>
    `;
    return;
  }

  // تنظيف الأقسام السابقة
  function clearDynamicSections() {
    document.querySelectorAll(".dynamic-section").forEach(section => {
      section.remove();
    });
  }

  // حماية النصوص
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

  // زر الرجوع للصفحة الرئيسية
  function goHome() {
    clearDynamicSections();
    library.scrollIntoView({ behavior: "smooth" });
  }

  // إنشاء قسم جديد
  function createSection(title, description, content, backFunction = goHome) {

    const section = document.createElement("section");

    section.className = "main-section container dynamic-section";

    section.innerHTML = `
      <button class="primary-button back-button" type="button">
        ← رجوع
      </button>

      <h2 class="section-title">${escapeHTML(title)}</h2>

      <p class="section-description">
        ${escapeHTML(description)}
      </p>

      <div class="stages-grid">
        ${content}
      </div>
    `;

    section.querySelector(".back-button").addEventListener("click", function () {
      backFunction();
    });

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

  // أسماء الصفوف
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

  // عرض الصفوف
  function showGrades(stageKey) {

    const stage = curriculum[stageKey];

    if (!stage) return;

    clearDynamicSections();

    const gradesHTML = Object.keys(stage.grades).map(gradeKey => {

      return createCard(
        getGradeName(stageKey, gradeKey),
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

  // عرض محتويات الصف
  function showGradeContent(stageKey, gradeKey) {

    const stage = curriculum[stageKey];

    if (!stage || !stage.grades[gradeKey]) return;

    const gradeData = stage.grades[gradeKey];
    const gradeName = getGradeName(stageKey, gradeKey);

    clearDynamicSections();

    // الصف الذي يحتوي على مواد مباشرة
    if (Array.isArray(gradeData)) {

      showSubjects(
        stageKey,
        gradeKey,
        null,
        gradeData,
        function () {
          showGrades(stageKey);
        }
      );

      return;
    }

    // الصف الذي يحتوي على شعب أو مسارات
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
        optionsHTML,
        function () {
          showGrades(stageKey);
        }
      );

      library.after(section);

      section.querySelectorAll("[data-option]").forEach(button => {

        button.addEventListener("click", function () {

          const optionName = button.dataset.option;

          showSubjects(
            stageKey,
            gradeKey,
            optionName,
            gradeData[optionName],
            function () {
              showGradeContent(stageKey, gradeKey);
            }
          );

        });

      });

      section.scrollIntoView({ behavior: "smooth" });
    }
  }

  // عرض المواد
  function showSubjects(
    stageKey,
    gradeKey,
    optionName,
    subjectList,
    backFunction
  ) {

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
      subjectsHTML,
      backFunction
    );

    library.after(section);

    section.querySelectorAll("[data-subject]").forEach(button => {

      button.addEventListener("click", function () {

        showBooks(
          stageKey,
          gradeKey,
          optionName,
          button.dataset.subject,
          function () {
            showSubjects(
              stageKey,
              gradeKey,
              optionName,
              subjectList,
              backFunction
            );
          }
        );

      });

    });

    section.scrollIntoView({ behavior: "smooth" });
  }

  // صفحة الكتب
  function showBooks(
    stageKey,
    gradeKey,
    optionName,
    subjectName,
    backFunction
  ) {

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
      `,
      backFunction
    );

    library.after(section);

    section.scrollIntoView({ behavior: "smooth" });
  }

  // أزرار المراحل
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
