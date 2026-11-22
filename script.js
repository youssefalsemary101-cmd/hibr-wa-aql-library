
document.addEventListener("DOMContentLoaded", async function () {
  const library = document.getElementById("library");

  const latestBooks =
    document.getElementById("latest-books-container") ||
    document.getElementById("latest-books");

  const searchInput = document.getElementById("book-search");

  let bookDatabase = [];

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

  function showLatestMessage(message) {
    if (latestBooks) {
      latestBooks.innerHTML = `
        <div class="card">
          <p>${escapeHTML(message)}</p>
        </div>
      `;
    }
  }

  function clearDynamicSections() {
    document.querySelectorAll(".dynamic-section").forEach(section => {
      section.remove();
    });
  }

  function createSection(title, description, content, backFunction) {
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

    section.querySelector(".back-button").addEventListener(
      "click",
      backFunction
    );

    return section;
  }

  function createCard(title, attribute, value) {
    return `
      <div class="card stage-card">
        <h3>${escapeHTML(title)}</h3>

        <button
          class="primary-button"
          ${attribute}="${escapeHTML(value)}"
        >
          عرض
        </button>
      </div>
    `;
  }

  function goHome() {
    clearDynamicSections();

    if (library) {
      library.scrollIntoView({ behavior: "smooth" });
    }
  }

  // إنشاء رابط صفحة الكتاب الخاصة
  function getBookPageURL(book) {
    if (!book.id) return "";

    const url = new URL(window.location.href);

    url.search = "";
    url.hash = "";
    url.searchParams.set("book", book.id);

    return url.href;
  }

  // أزرار مشاركة الكتاب
  function createShareButtons(book) {
    if (!book.id) return "";

    return `
      <div class="book-share" style="
        margin-top:16px;
        padding:14px;
        border:1px solid #E3EAE5;
        border-radius:12px;
        text-align:center;
      ">

        <h4 style="margin:0 0 12px;">
          مشاركة الكتاب
        </h4>

        <div style="
          display:flex;
          flex-wrap:wrap;
          gap:8px;
          justify-content:center;
        ">

          <button
            type="button"
            class="primary-button"
            data-share-action="whatsapp"
            data-book-id="${escapeHTML(book.id)}"
            style="background:#25D366;"
          >
            واتساب
          </button>

          <button
            type="button"
            class="primary-button"
            data-share-action="facebook"
            data-book-id="${escapeHTML(book.id)}"
            style="background:#1877F2;"
          >
            فيسبوك
          </button>

          <button
            type="button"
            class="primary-button"
            data-share-action="telegram"
            data-book-id="${escapeHTML(book.id)}"
            style="background:#229ED9;"
          >
            تليجرام
          </button>

          <button
            type="button"
            class="primary-button"
            data-share-action="copy"
            data-book-id="${escapeHTML(book.id)}"
          >
            نسخ الرابط
          </button>

        </div>
      </div>
    `;
  }

  // إنشاء بطاقة الكتاب
  function createBookCard(book) {
    const coverURL = safeURL(book.cover);
    const bookURL = safeURL(book.url);

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
                "
              >
            `
            : ""
        }

        <h3>${escapeHTML(book.title)}</h3>

        ${
          bookURL
            ? `
              <a
                class="primary-button"
                href="${escapeHTML(bookURL)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                فتح الكتاب
              </a>
            `
            : "<p>رابط الكتاب غير متاح حاليًا.</p>"
        }

        ${createShareButtons(book)}

        <div
          class="book-details"
          style="
            margin-top:18px;
            padding:18px;
            border:1px solid #E3EAE5;
            border-radius:14px;
            text-align:right;
          "
        >

          <h3>تفاصيل الكتاب</h3>

          <p>
            <strong>المادة:</strong>
            ${escapeHTML(book.subject)}
          </p>

          <p>
            <strong>المرحلة:</strong>
            ${escapeHTML(book.stage)}
          </p>

          <p>
            <strong>الصف:</strong>
            ${escapeHTML(book.grade)}
          </p>

          <p>
            <strong>الشعبة أو المسار:</strong>
            ${escapeHTML(book.option || "غير محدد")}
          </p>

          <p>
            <strong>الفصل الدراسي:</strong>
            ${escapeHTML(getTermName(book.term))}
          </p>

          <p>
            <strong>السنة الدراسية:</strong>
            ${escapeHTML(book.academic_year || "غير محددة")}
          </p>

          <p>
            <strong>حجم الكتاب:</strong>
            ${escapeHTML(book.file_size || "غير محدد")}
          </p>

          <hr style="
            margin:12px 0;
            border:0;
            border-top:1px solid #E3EAE5;
          ">

          <h4>نبذة عن الكتاب</h4>

          <p>
            ${escapeHTML(
              book.description || "لا توجد نبذة مضافة لهذا الكتاب."
            )}
          </p>

        </div>
      </div>
    `;
  }

  // تنفيذ المشاركة
  async function shareBook(action, bookId) {
    const book = bookDatabase.find(item =>
      String(item.id) === String(bookId)
    );

    if (!book) {
      alert("تعذر العثور على الكتاب.");
      return;
    }

    const shareURL = getBookPageURL(book);

    if (!shareURL) {
      alert("تعذر إنشاء رابط مشاركة الكتاب.");
      return;
    }

    const shareText = `كتاب ${book.title} من مكتبة حبر وعقل`;

    let targetURL = "";

    if (action === "whatsapp") {
      targetURL =
        "https://wa.me/?text=" +
        encodeURIComponent(shareText + "\n" + shareURL);
    }

    if (action === "facebook") {
      targetURL =
        "https://www.facebook.com/sharer/sharer.php?u=" +
        encodeURIComponent(shareURL);
    }

    if (action === "telegram") {
      targetURL =
        "https://t.me/share/url?url=" +
        encodeURIComponent(shareURL) +
        "&text=" +
        encodeURIComponent(shareText);
    }

    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(shareURL);
        alert("تم نسخ رابط صفحة الكتاب بنجاح.");
      } catch (error) {
        const textArea = document.createElement("textarea");

        textArea.value = shareURL;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.select();

        const copied = document.execCommand("copy");

        textArea.remove();

        if (copied) {
          alert("تم نسخ رابط صفحة الكتاب بنجاح.");
        } else {
          window.prompt("انسخ رابط الكتاب:", shareURL);
        }
      }

      return;
    }

    if (targetURL) {
      window.open(targetURL, "_blank", "noopener,noreferrer");
    }
  }

  // استقبال ضغطات أزرار المشاركة
  document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-share-action]");

    if (!button) return;

    shareBook(
      button.dataset.shareAction,
      button.dataset.bookId
    );
  });

  // عرض صفحة كتاب تمت مشاركتها
  function showSharedBook() {
    const params = new URLSearchParams(window.location.search);
    const sharedBookId = params.get("book");

    if (!sharedBookId) return;

    const book = bookDatabase.find(item =>
      String(item.id) === String(sharedBookId)
    );

    const section = document.createElement("section");

    section.className = "main-section container dynamic-section";

    if (!book) {
      section.innerHTML = `
        <div class="card">
          <h2>الكتاب غير موجود</h2>
          <p>ربما تم حذف الكتاب أو أن الرابط غير صحيح.</p>
          <a class="primary-button" href="${escapeHTML(
            window.location.origin + window.location.pathname
          )}">
            العودة إلى المكتبة
          </a>
        </div>
      `;
    } else {
      section.innerHTML = `
        <h2 class="section-title">صفحة الكتاب</h2>
        <p class="section-description">
          مكتبة حبر وعقل التعليمية
        </p>

        ${createBookCard(book)}

        <button
          class="primary-button"
          type="button"
          id="return-to-library"
          style="margin-top:16px;"
        >
          العودة إلى المكتبة
        </button>
      `;

      section.querySelector("#return-to-library")
        .addEventListener("click", function () {
          window.location.href =
            window.location.origin + window.location.pathname;
        });
    }

    library.before(section);

    library.style.display = "none";

    if (latestBooks) {
      const latestSection = latestBooks.closest("section");

      if (
        latestSection &&
        latestSection !== library.closest("section")
      ) {
        latestSection.style.display = "none";
      }
    }

    section.scrollIntoView({ behavior: "smooth" });
  }

  // عرض الصفوف
  function showGrades(stageKey) {
    const stage = curriculum[stageKey];

    if (!stage) return;

    clearDynamicSections();

    const gradesHTML = Object.keys(stage.grades)
      .map(key =>
        createCard(
          getGradeName(stageKey, key),
          "data-grade",
          key
        )
      )
      .join("");

    const section = createSection(
      stage.name,
      "اختر الصف الدراسي.",
      gradesHTML,
      goHome
    );

    library.after(section);

    section.querySelectorAll("[data-grade]").forEach(button => {
      button.addEventListener("click", () => {
        showGradeContent(stageKey, button.dataset.grade);
      });
    });

    section.scrollIntoView({ behavior: "smooth" });
  }

  // عرض الشعب والمسارات أو المواد
  function showGradeContent(stageKey, gradeKey) {
    const stage = curriculum[stageKey];

    if (!stage || !stage.grades[gradeKey]) return;

    const gradeData = stage.grades[gradeKey];

    clearDynamicSections();

    if (Array.isArray(gradeData)) {
      showSubjects(
        stageKey,
        gradeKey,
        "",
        gradeData,
        () => showGrades(stageKey)
      );

      return;
    }

    const optionsHTML = Object.keys(gradeData)
      .map(option =>
        createCard(option, "data-option", option)
      )
      .join("");

    const section = createSection(
      getGradeName(stageKey, gradeKey),
      "اختر الشعبة أو المسار.",
      optionsHTML,
      () => showGrades(stageKey)
    );

    library.after(section);

    section.querySelectorAll("[data-option]").forEach(button => {
      button.addEventListener("click", () => {
        const option = button.dataset.option;

        showSubjects(
          stageKey,
          gradeKey,
          option,
          gradeData[option],
          () => showGradeContent(stageKey, gradeKey)
        );
      });
    });

    section.scrollIntoView({ behavior: "smooth" });
  }

  // عرض المواد
  function showSubjects(
    stageKey,
    gradeKey,
    optionName,
    subjectList,
    backFunction
  ) {
    clearDynamicSections();

    const subjectsHTML = subjectList
      .map(subject =>
        createCard(subject, "data-subject", subject)
      )
      .join("");

    const gradeName = getGradeName(stageKey, gradeKey);

    const section = createSection(
      optionName || gradeName,
      optionName
        ? `${gradeName} - ${optionName}`
        : "اختر المادة.",
      subjectsHTML,
      backFunction
    );

    library.after(section);

    section.querySelectorAll("[data-subject]").forEach(button => {
      button.addEventListener("click", () => {
        showBooks(
          stageKey,
          gradeKey,
          optionName,
          button.dataset.subject,
          () => showSubjects(
            stageKey,
            gradeKey,
            optionName,
            subjectList,
            backFunction
          )
        );
      });
    });

    section.scrollIntoView({ behavior: "smooth" });
  }

  // عرض كتب المادة
  function showBooks(
    stageKey,
    gradeKey,
    optionName,
    subjectName,
    backFunction
  ) {
    clearDynamicSections();

    const matchingBooks = bookDatabase.filter(book =>
      book.stage === stageKey &&
      String(book.grade) === String(gradeKey) &&
      String(book.option || "") === String(optionName || "") &&
      book.subject === subjectName
    );

    const booksHTML = matchingBooks.length
      ? matchingBooks.map(createBookCard).join("")
      : `
        <div class="card">
          <h3>لا توجد كتب مضافة حاليًا</h3>
          <p>
            سيتم توفير الكتب هنا عند إضافتها إلى المكتبة.
          </p>
        </div>
      `;

    const section = createSection(
      subjectName,
      getGradeName(stageKey, gradeKey),
      booksHTML,
      backFunction
    );

    library.after(section);

    section.scrollIntoView({ behavior: "smooth" });
  }

  // أحدث الكتب
  function showLatestBooks() {
    if (!latestBooks) return;

    latestBooks.innerHTML = bookDatabase.length
      ? bookDatabase.slice(0, 6).map(createBookCard).join("")
      : `
        <div class="card">
          <p>سيتم إضافة الكتب قريبًا.</p>
        </div>
      `;
  }

  // البحث
  function showSearchResults(value) {
    const query = value.trim().toLowerCase();

    if (!query) {
      const old = document.getElementById("search-results");

      if (old) old.remove();

      return;
    }

    let result = document.getElementById("search-results");

    if (!result) {
      result = document.createElement("section");

      result.id = "search-results";
      result.className = "container main-section";

      library.after(result);
    }

    const matches = bookDatabase.filter(book =>
      [
        book.title,
        book.subject,
        book.description
      ].some(text =>
        String(text || "").toLowerCase().includes(query)
      )
    );

    result.innerHTML = `
      <h2 class="section-title">نتائج البحث</h2>

      <div class="books-grid">
        ${
          matches.length
            ? matches.map(createBookCard).join("")
            : "<p>لم يتم العثور على كتب مطابقة.</p>"
        }
      </div>
    `;
  }

  // تحميل الكتب من Supabase
  async function loadBooks() {
    if (!window.supabaseClient) {
      console.error("اتصال Supabase غير جاهز.");

      showLatestMessage(
        "تعذر الاتصال بقاعدة البيانات. حاول تحديث الصفحة."
      );

      return;
    }

    showLatestMessage("جاري تحميل الكتب...");

    try {
      const { data, error } = await window.supabaseClient
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("تعذر تحميل الكتب:", error.message);

        showLatestMessage(
          "تعذر تحميل الكتب حاليًا. يرجى المحاولة لاحقًا."
        );

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

      showLatestBooks();

      console.log(
        `تم تحميل ${bookDatabase.length} كتاب من Supabase.`
      );

      // فتح صفحة الكتاب عند استخدام رابط المشاركة
      showSharedBook();

    } catch (error) {
      console.error("حدث خطأ أثناء الاتصال:", error);

      showLatestMessage(
        "حدث خطأ أثناء تحميل الكتب. حاول مرة أخرى."
      );
    }
  }

  // التأكد من وجود عناصر الموقع
  if (!library) {
    console.error("عنصر المكتبة غير موجود في الصفحة.");
    return;
  }

  // التأكد من تحميل المنهج
  if (typeof curriculum === "undefined") {
    library.innerHTML = `
      <p>
        تعذر تحميل المنهج. تأكد من ملف curriculum.js.
      </p>
    `;

    return;
  }

  // أزرار المراحل
  document.querySelectorAll("[data-stage]").forEach(button => {
    button.addEventListener("click", () => {
      showGrades(button.dataset.stage);
    });
  });

  // البحث
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      showSearchResults(searchInput.value);
    });
  }

  // تحميل الكتب عند فتح الصفحة
  await loadBooks();
});
