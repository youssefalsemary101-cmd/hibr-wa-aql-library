
document.addEventListener("DOMContentLoaded", function () {

  const stageButtons = document.querySelectorAll("[data-stage]");

  const stagesData = {
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

  stageButtons.forEach(function (button) {

    button.addEventListener("click", function () {

      const stageKey = button.dataset.stage;
      const stage = stagesData[stageKey];

      if (!stage) return;

      let gradesHTML = "";

      stage.grades.forEach(function (grade, index) {

        gradesHTML += `
          <div class="card grade-card">
            <h3>${grade}</h3>
            <button class="primary-button grade-button"
              data-stage-key="${stageKey}"
              data-grade-index="${index}">
              عرض المواد
            </button>
          </div>
        `;

      });

      let oldSection = document.getElementById("grades-section");

      if (oldSection) {
        oldSection.remove();
      }

      const gradesSection = document.createElement("section");

      gradesSection.id = "grades-section";
      gradesSection.className = "main-section container";

      gradesSection.innerHTML = `
        <h2 class="section-title">${stage.name}</h2>
        <p class="section-description">اختر الصف الدراسي.</p>
        <div class="stages-grid">
          ${gradesHTML}
        </div>
      `;

      document.getElementById("library").after(gradesSection);

      gradesSection.scrollIntoView({
        behavior: "smooth"
      });

    });

  });

});
