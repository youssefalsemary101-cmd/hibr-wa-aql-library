
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

  // سجل التنقل للرجوع إلى الصفحة السابقة
  let navigationHistory = [];

  // الصفحة الحالية
  let currentPage = null;

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

  // الانتقال إلى صفحة جديدة
  function navigateTo(pageFunction) {
    if (currentPage) {
      navigationHistory.push(currentPage);
    }

    currentPage = pageFunction;
    pageFunction();
  }

  // الرجوع للصفحة السابقة
  function goBack() {
    if (navigationHistory.length === 0) {
      clearDynamicSections();
      currentPage = null;
      library.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const previousPage = navigationHistory.pop();

    currentPage = previousPage;
    previousPage();
  }

  // إنشاء زر الرجوع
  function createBackButton() {
    return `
      <button class="primary-button back-button" type="button">
        ← رجوع
      </button>
    `;
  }

  // إنشاء قسم جديد
  function createSection(title, description, content, showBack = true) {
    const section = document.createElement("section");

    section.className = "main-section container dynamic-section";

    section.innerHTML = `
      ${showBack ? createBackButton() : ""}
      <h2 class="section-title">${escapeHTML(title)}</h2>
      <p class="section-description">${escapeHTML(description)}</p>
      <div class="stages-grid">${content}</div>
    `;

    if (showBack) {
      const backButton = section.querySelector(".back-button");

      backButton.addEventListener("click", goBack);
    }

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

    const gradesHTML = gradeEntries.map(([gradeKey]) => {

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

        const gradeKey = button.dataset.grade;

        navigateTo(function () {
          showGradeContent(stageKey, gradeKey);
        });

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

    if (!stage || !stage.grades[gradeKey]) return;

    const gradeData = stage.grades[gradeKey];
    const gradeName = getGradeName(stageKey, gradeKey);

    clearDynamicSections();

    // إذا كانت بيانات الصف عبارة عن قائمة مواد
    if (Array.isArray(gradeData)) {

      showSubjects(
        stageKey,
        gradeKey,
        null,
        gradeData,
        function () {
          showGradeContent(stageKey, gradeKey);
        }
      );

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

          navigateTo(function () {
            showSubjects(
              stageKey,
              gradeKey,
              optionName,
              optionData,
              function () {
                showGradeContent(stageKey, gradeKey);
              }
            );
          });

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
      subjectsHTML
    );

    library.after(section);

    // تحديد صفحة الرجوع
    section.querySelector(".back-button").addEventListener("click", function () {
      if (backFunction) {
        backFunction();
      }
    });

    section.querySelectorAll("[data-subject]").forEach(button => {
      button.addEventListener("click", function () {

        const subjectName = button.dataset.subject;

        navigateTo(function () {
          showBooks(
            stageKey,
            gradeKey,
            optionName,
            subjectName
          );
        });

      });
    });

    section.scrollIntoView({ behavior: "smooth" });
  }

  // صفحة الكتب
  function showBooks(stageKey, gradeKey, optionName, subjectName) {
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

      navigationHistory = [];
      currentPage = function () {
        showGrades(button.dataset.stage);
      };

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
