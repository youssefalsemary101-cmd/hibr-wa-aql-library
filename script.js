
document.addEventListener("DOMContentLoaded", async function () {
  const library = document.getElementById("library");
  const wizardContent = document.getElementById("wizard-content");
  const stepCounter = document.getElementById("step-counter");
  const progressFill = document.getElementById("progress-fill");
  const nextButton = document.getElementById("wizard-next");
  const backButton = document.getElementById("wizard-back");
  const searchArea = document.getElementById("book-search-area");
  const searchInput = document.getElementById("book-search");
  const searchResults = document.getElementById("search-results");

  let bookDatabase = [];
  let steps = [];
  let currentStep = 0;

  const selected = {
    stage: "",
    grade: "",
    option: "",
    subject: "",
    term: ""
  };

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function safeURL(value) {
    try {
      const url = new URL(value);

      return ["https:", "http:"].includes(url.protocol)
        ? url.href
        : "";
    } catch {
      return "";
    }
  }

  function getTermName(term) {
    if (term === "term1") return "الفصل الدراسي الأول";
    if (term === "term2") return "الفصل الدراسي الثاني";
    return term || "غير محدد";
  }

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

  function getStageData() {
    return curriculum[selected.stage];
  }

  function getGradeData() {
    const stage = getStageData();
    return stage?.grades?.[selected.grade];
  }

  function getSubjectList() {
    const gradeData = getGradeData();

    if (Array.isArray(gradeData)) {
      return gradeData;
    }

    if (gradeData && selected.option) {
      return gradeData[selected.option] || [];
    }

    return [];
  }

  function rebuildSteps() {
    steps = [
      {
        key: "stage",
        title: "اختر المرحلة الدراسية",
        description: "حدد المرحلة التعليمية التي تدرس بها.",
        options: Object.entries(curriculum).map(([key, value]) => ({
          value: key,
          label: value.name
        }))
      }
    ];

    if (!selected.stage) return;

    const stage = getStageData();

    steps.push({
      key: "grade",
      title: "اختر الصف الدراسي",
      description: `المرحلة المختارة: ${stage.name}`,
      options: Object.keys(stage.grades).map(key => ({
        value: key,
        label: getGradeName(selected.stage, key)
      }))
    });

    if (!selected.grade) return;

    const gradeData = getGradeData();

    if (!Array.isArray(gradeData)) {
      steps.push({
        key: "option",
        title: "اختر الشعبة أو المسار",
        description: getGradeName(selected.stage, selected.grade),
        options: Object.keys(gradeData).map(option => ({
          value: option,
          label: option
        }))
      });

      if (!selected.option) return;
    }

    const subjects = getSubjectList();

    steps.push({
      key: "subject",
      title: "اختر المادة الدراسية",
      description: getGradeName(selected.stage, selected.grade),
      options: subjects.map(subject => ({
        value: subject,
        label: subject
      }))
    });

    if (!selected.subject) return;

    steps.push({
      key: "term",
      title: "اختر الفصل الدراسي",
      description: selected.subject,
      options: [
        {
          value: "term1",
          label: "الفصل الدراسي الأول"
        },
        {
          value: "term2",
          label: "الفصل الدراسي الثاني"
        }
      ]
    });

    if (!selected.term) return;

    steps.push({
      key: "books",
      title: "الكتب الدراسية",
      description:
        `${selected.subject} - ${getGradeName(selected.stage, selected.grade)}`
    });
  }

  // إنشاء رابط مستقل لصفحة كل كتاب
  function createBookPageURL(book) {
    if (!book.id) return "";

    const url = new URL("book.html", window.location.href);
    url.searchParams.set("id", book.id);

    return url.href;
  }

  // بطاقة الكتاب في الصفحة الرئيسية
  function createBookCard(book) {
    const coverURL = safeURL(book.cover);
    const pageURL = createBookPageURL(book);

    return `
      <div class="card book-card">

        ${
          coverURL
            ? `
              <img
                src="${escapeHTML(coverURL)}"
                alt="${escapeHTML(book.title)}"
                loading="lazy"
                style="
                  width:100%;
                  max-height:230px;
                  object-fit:contain;
                  border-radius:10px;
                  margin-bottom:14px;
                "
              >
            `
            : `
              <div style="
                width:100%;
                min-height:130px;
                display:flex;
                align-items:center;
                justify-content:center;
                background:var(--surface-soft, #edf5ef);
                border-radius:10px;
                margin-bottom:14px;
                color:var(--text, #245b3d);
              ">
                <span style="font-size:42px;">📚</span>
              </div>
            `
        }

        <h3>${escapeHTML(book.title)}</h3>

        <a
          class="primary-button"
          href="${escapeHTML(pageURL)}"
          style="
            display:block;
            text-align:center;
            text-decoration:none;
            margin-top:14px;
          "
        >
          فتح صفحة الكتاب
        </a>

      </div>
    `;
  }

  // فلترة الكتب حسب الاختيارات
  function getMatchingBooks() {
    return bookDatabase.filter(book =>
      book.stage === selected.stage &&
      String(book.grade) === String(selected.grade) &&
      String(book.option || "") === String(selected.option || "") &&
      book.subject === selected.subject &&
      book.term === selected.term
    );
  }

  // عرض الكتب
  function showBooks() {
    const matchingBooks = getMatchingBooks();

    wizardContent.innerHTML = `
      <h2 class="section-title">الكتب الدراسية</h2>

      <p class="section-description">
        ${escapeHTML(selected.subject)}
        - ${escapeHTML(getTermName(selected.term))}
      </p>

      <div class="books-grid">
        ${
          matchingBooks.length
            ? matchingBooks.map(createBookCard).join("")
            : `
              <div class="card">
                <h3>لا توجد كتب مضافة حاليًا</h3>
                <p>سيتم توفير الكتب هنا عند إضافتها إلى المكتبة.</p>
              </div>
            `
        }
      </div>
    `;

    if (searchArea) {
      searchArea.hidden = false;
    }

    if (nextButton) {
      nextButton.hidden = true;
    }
  }

  // عرض خطوة الاختيار الحالية
  function renderStep() {
    const step = steps[currentStep];

    if (!step) return;

    const total = steps.length;
    const isBooksStep = step.key === "books";

    if (stepCounter) {
      stepCounter.textContent =
        `الخطوة ${currentStep + 1} من ${total}`;
    }

    if (progressFill) {
      progressFill.style.width =
        `${((currentStep + 1) / total) * 100}%`;
    }

    if (backButton) {
      backButton.hidden = currentStep === 0;
    }

    if (nextButton) {
      nextButton.hidden = isBooksStep;
      nextButton.disabled = !selected[step.key];
      nextButton.textContent =
        step.key === "term" ? "عرض الكتب" : "التالي";
    }

    if (searchArea) {
      searchArea.hidden = !isBooksStep;
    }

    if (isBooksStep) {
      showBooks();
      return;
    }

    wizardContent.innerHTML = `
      <h2 class="section-title">
        ${escapeHTML(step.title)}
      </h2>

      <p class="section-description">
        ${escapeHTML(step.description)}
      </p>

      <div class="stages-grid">
        ${
          step.options.map((option, index) => `
            <button
              type="button"
              class="card stage-card choice-card ${
                selected[step.key] === option.value
                  ? "selected-choice"
                  : ""
              }"
              data-choice-index="${index}"
              style="
                cursor:pointer;
                width:100%;
                border:2px solid ${
                  selected[step.key] === option.value
                    ? "#248B52"
                    : "#E3EAE5"
                };
              "
            >
              <span style="font-size:18px;font-weight:bold;">
                ${escapeHTML(option.label)}
              </span>

              <span style="color:#248B52;margin-top:10px;">
                ${
                  selected[step.key] === option.value
                    ? "✓ تم الاختيار"
                    : "اضغط للاختيار"
                }
              </span>
            </button>
          `).join("")
        }
      </div>
    `;

    wizardContent.querySelectorAll("[data-choice-index]")
      .forEach(button => {
        button.addEventListener("click", function () {
          const option = step.options[
            Number(button.dataset.choiceIndex)
          ];

          if (!option) return;

          selectOption(step.key, option.value);
        });
      });
  }

  // تنفيذ الاختيار والانتقال للخطوة المناسبة
  function selectOption(key, value) {
    selected[key] = value;

    if (key === "stage") {
      selected.grade = "";
      selected.option = "";
      selected.subject = "";
      selected.term = "";
    }

    if (key === "grade") {
      selected.option = "";
      selected.subject = "";
      selected.term = "";
    }

    if (key === "option") {
      selected.subject = "";
      selected.term = "";
    }

    if (key === "subject") {
      selected.term = "";
    }

    rebuildSteps();

    const currentKey = steps[currentStep]?.key;

    if (currentKey !== key) {
      currentStep = steps.findIndex(item => item.key === key);
    }

    renderStep();
  }

  function goNext() {
    const step = steps[currentStep];

    if (!step || !selected[step.key]) return;

    if (currentStep < steps.length - 1) {
      currentStep++;
      renderStep();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    if (currentStep <= 0) return;

    currentStep--;
    renderStep();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (nextButton) {
    nextButton.addEventListener("click", goNext);
  }

  if (backButton) {
    backButton.addEventListener("click", goBack);
  }

  // البحث داخل الكتب المطابقة للاختيارات
  function showSearchResults(value) {
    if (!searchResults) return;

    const query = value.trim().toLowerCase();
    const matchingBooks = getMatchingBooks();

    const results = query
      ? matchingBooks.filter(book =>
          [
            book.title,
            book.subject,
            book.description
          ].some(text =>
            String(text || "").toLowerCase().includes(query)
          )
        )
      : matchingBooks;

    searchResults.innerHTML = results.length
      ? results.map(createBookCard).join("")
      : "<p>لم يتم العثور على كتب مطابقة.</p>";
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      showSearchResults(searchInput.value);
    });
  }

  // تحميل الكتب من قاعدة البيانات
  async function loadBooks() {
    if (!window.supabaseClient) {
      wizardContent.innerHTML = `
        <div class="card">
          <p>تعذر الاتصال بقاعدة البيانات. حاول تحديث الصفحة.</p>
        </div>
      `;
      return;
    }

    try {
      const { data, error } = await window.supabaseClient
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("تعذر تحميل الكتب:", error.message);

        wizardContent.innerHTML = `
          <div class="card">
            <p>تعذر تحميل الكتب حاليًا. يرجى المحاولة لاحقًا.</p>
          </div>
        `;
        return;
      }

      bookDatabase = (data || []).map(book => {
        let cover = "";

        if (book.cover_path) {
          const { data: imageData } = window.supabaseClient
            .storage
            .from("book-covers")
            .getPublicUrl(book.cover_path);

          cover = imageData?.publicUrl || "";
        }

        return {
          ...book,
          cover,
          url: book.book_url
        };
      });

      console.log(
        `تم تحميل ${bookDatabase.length} كتاب من Supabase.`
      );

    } catch (error) {
      console.error("حدث خطأ أثناء تحميل الكتب:", error);

      wizardContent.innerHTML = `
        <div class="card">
          <p>حدث خطأ أثناء تحميل الكتب. حاول مرة أخرى.</p>
        </div>
      `;
    }
  }

  if (!library || !wizardContent) {
    console.error("عناصر المكتبة غير موجودة.");
    return;
  }

  if (typeof curriculum === "undefined") {
    wizardContent.innerHTML = `
      <p>تعذر تحميل المنهج. تأكد من ملف curriculum.js.</p>
    `;
    return;
  }

  rebuildSteps();
  renderStep();

  await loadBooks();

  // إعادة عرض الكتب إذا كانت خطوة الكتب مفتوحة بالفعل
  if (steps[currentStep]?.key === "books") {
    showBooks();
  }
});
