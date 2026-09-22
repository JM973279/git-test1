/**
 * sidebarUI.js — 사이드바 열기/닫기, 섹션 토글 공통 로직.
 * index.html(SPA)과 pages/*.html 정적 페이지 양쪽에서 공유한다.
 */
const DESKTOP_BREAKPOINT = 1024;
let _sidebarOpen = window.innerWidth > DESKTOP_BREAKPOINT;
const MENU_SECTION_ORDER = ['curriculum', 'quiz', 'visualization', 'portfolio', 'quant'];

// SPA와 정적 페이지가 같은 메뉴 순서를 유지하도록 실제 DOM 순서를 맞춘다.
function orderSidebarSections() {
  const nav = document.querySelector('.sidebar-nav');
  if (!nav) return;

  const sections = new Map(
    [...nav.querySelectorAll(':scope > .nav-section')].map((section) => {
      const id = MENU_SECTION_ORDER.find((item) => section.querySelector(`#nav-${item}`));
      return [id, section];
    }),
  );
  MENU_SECTION_ORDER.forEach((id) => {
    const section = sections.get(id);
    if (section) nav.append(section);
  });

  // RAG는 10단원 학습 직후에 두고, 인프라 비교 메뉴만 맨 마지막에 둔다.
  const ragItem = nav.querySelector(':scope > .nav-item[data-view="rag-chat"]');
  const curriculumSection = [...nav.querySelectorAll(':scope > .nav-section')]
    .find((section) => section.querySelector('#nav-curriculum'));
  if (ragItem && curriculumSection) curriculumSection.after(ragItem);
  const llmItem = nav.querySelector(':scope > .nav-item[data-view="llm-bench"]');
  if (llmItem) nav.append(llmItem);
}
window._orderSidebarSections = orderSidebarSections;

function ensureSidebarChatbot() {
  if (document.getElementById('floating-chatbot')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <section class="floating-chatbot" id="floating-chatbot" aria-label="금융지식 RAG 도우미">
      <div class="floating-chatbot-panel" id="floating-chatbot-panel" hidden>
        <header class="floating-chatbot-head">
          <span><i class="fa-solid fa-robot"></i> 금융지식 RAG 도우미</span>
          <button type="button" id="floating-chatbot-close" aria-label="대화창 닫기"><i class="fa-solid fa-xmark"></i></button>
        </header>
        <div class="floating-chatbot-messages" id="floating-chatbot-messages" aria-live="polite">
          <p class="floating-chatbot-welcome">10개 금융 단원의 근거 문서에서 답을 찾습니다.</p>
        </div>
        <form class="floating-chatbot-form" id="floating-chatbot-form">
          <input id="floating-chatbot-input" type="text" maxlength="300" placeholder="예: 듀레이션과 만기의 차이는?" aria-label="금융지식 질문" />
          <button type="submit" aria-label="질문 보내기"><i class="fa-solid fa-paper-plane"></i></button>
        </form>
      </div>
      <button type="button" class="floating-chatbot-trigger" id="floating-chatbot-trigger" aria-label="금융지식 RAG 도우미 열기" aria-expanded="false">
        <i class="fa-solid fa-comment-dots"></i><span>RAG 도우미</span>
      </button>
    </section>`);

  const panel = document.getElementById('floating-chatbot-panel');
  const trigger = document.getElementById('floating-chatbot-trigger');
  const close = document.getElementById('floating-chatbot-close');
  const form = document.getElementById('floating-chatbot-form');
  const input = document.getElementById('floating-chatbot-input');
  const submit = form?.querySelector('button[type="submit"]');
  const messages = document.getElementById('floating-chatbot-messages');
  const appendMessage = (text, className) => {
    const message = document.createElement('p');
    message.className = `floating-chatbot-message ${className}`;
    message.textContent = text;
    messages?.append(message);
    messages?.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
  };
  const setOpen = (open) => {
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? '금융지식 RAG 도우미 닫기' : '금융지식 RAG 도우미 열기');
    if (open) input?.focus();
  };
  trigger?.addEventListener('click', () => setOpen(panel.hidden));
  close?.addEventListener('click', () => setOpen(false));

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = input?.value.trim();
    if (!question || !messages) return;

    appendMessage(question, 'is-user');
    input.value = '';
    input.disabled = true;
    if (submit) submit.disabled = true;
    try {
      const response = await fetch('/api/rag/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question, top_k: 4, provider: 'rag' }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || 'RAG 답변을 받지 못했습니다.');
      appendMessage(payload.answer || '관련 문서를 찾지 못했습니다.', 'is-enterprise');
    } catch (error) {
      appendMessage(error.message || 'RAG 연결에 실패했습니다.', 'is-enterprise');
    } finally {
      input.disabled = false;
      if (submit) submit.disabled = false;
      input.focus();
    }
  });
}
window._ensureSidebarChatbot = ensureSidebarChatbot;

// ── Enterprise 안내 모달 (회원가입/로그인 클릭 시) ──
function openEnterpriseModal() {
  const overlay = document.getElementById('enterprise-modal-overlay');
  if (!overlay) return;
  overlay.hidden = false;
  document.body.classList.add('modal-open');
}
function closeEnterpriseModal() {
  const overlay = document.getElementById('enterprise-modal-overlay');
  if (!overlay) return;
  overlay.hidden = true;
  document.body.classList.remove('modal-open');
}
window.closeEnterpriseModal = closeEnterpriseModal;

document.querySelectorAll('.js-enterprise-gate').forEach((el) => {
  el.addEventListener('click', (event) => {
    event.preventDefault();
    openEnterpriseModal();
  });
});
document.getElementById('enterprise-modal-overlay')?.addEventListener('click', (event) => {
  if (event.target.id === 'enterprise-modal-overlay') closeEnterpriseModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeEnterpriseModal();
});

function syncSidebarToggle() {
  const toggle = document.getElementById('sidebar-toggle');
  if (!toggle) return;
  toggle.setAttribute('aria-expanded', String(_sidebarOpen));
  toggle.setAttribute('aria-label', _sidebarOpen ? '메뉴 닫기' : '메뉴 열기');
}

function toggleSidebar() {
  _sidebarOpen ? closeSidebar() : openSidebar();
}
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.body.classList.remove('sidebar-collapsed');
  if (window.innerWidth <= DESKTOP_BREAKPOINT) {
    document.getElementById('overlay').classList.add('show');
  }
  _sidebarOpen = true;
  syncSidebarToggle();
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
  if (window.innerWidth > DESKTOP_BREAKPOINT) {
    document.body.classList.add('sidebar-collapsed');
  }
  _sidebarOpen = false;
  syncSidebarToggle();
}
function toggleNav(id) {
  const el = document.getElementById('nav-' + id);
  const chev = document.getElementById('chev-' + id);
  const open = el.classList.toggle('open');
  if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
}
// auto-open a section (e.g. quiz/learn while that view is active)
window._openNavSection = function(id) {
  const el = document.getElementById('nav-' + id);
  const chev = document.getElementById('chev-' + id);
  if (el && !el.classList.contains('open')) {
    el.classList.add('open');
    if (chev) chev.style.transform = 'rotate(180deg)';
  }
};
// close every section (used before opening only the section(s) currently in use)
function closeAllNavSections() {
  document.querySelectorAll('.nav-children').forEach((el) => {
    el.classList.remove('open');
    const chev = document.getElementById('chev-' + el.id.replace(/^nav-/, ''));
    if (chev) chev.style.transform = '';
  });
}
// close everything, then open only the section(s) relevant to the current view
window._setActiveNavSections = function(ids) {
  closeAllNavSections();
  (ids || []).forEach((id) => window._openNavSection(id));
};

window.addEventListener('resize', () => {
  const isMobile = window.innerWidth <= DESKTOP_BREAKPOINT;
  document.getElementById('overlay').classList.remove('show');

  if (isMobile) {
    document.body.classList.remove('sidebar-collapsed');
    document.getElementById('sidebar').classList.remove('open');
    _sidebarOpen = false;
  } else {
    document.getElementById('sidebar').classList.toggle('open', !document.body.classList.contains('sidebar-collapsed'));
    _sidebarOpen = !document.body.classList.contains('sidebar-collapsed');
  }

  syncSidebarToggle();
});

if (window.innerWidth > DESKTOP_BREAKPOINT) {
  document.getElementById('sidebar').classList.add('open');
}
orderSidebarSections();
ensureSidebarChatbot();
syncSidebarToggle();
