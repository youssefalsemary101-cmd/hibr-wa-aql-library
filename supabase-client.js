
(function () {
  const SUPABASE_URL =
    "https://ntkjkwpafdrlwkwklvky.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_ajByNpSKhCXvBg8zmd7GlQ_pmejFg-b";

  if (!window.supabase) {
    console.error("تعذر تحميل مكتبة Supabase");
    return;
  }

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  console.log("تم الاتصال بإعدادات Supabase");
})();
