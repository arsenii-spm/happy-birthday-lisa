(function () {
  const cfg = window.CARD_CONFIG;
  if (!cfg) return;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el && text !== undefined) el.textContent = text;
  };

  // Populate Masthead & Hero
  setText("birth-date-badge", cfg.birthDate);
  setText("age-badge", `${cfg.age} ЛЕТ`);
  setText("celebration-date-badge", cfg.celebrationDate);
  setText("hero-eyebrow", cfg.heroEyebrow);
  setText("hero-title", cfg.heroTitle);
  setText("recipient-name", cfg.recipientName);
  setText("hero-lead", cfg.heroLead);

  // Populate Letter
  setText("letter-title", cfg.letterTitle);
  setText("sender-name", cfg.senderName);

  const letterBody = document.getElementById("letter-body");
  if (letterBody && Array.isArray(cfg.letterParagraphs)) {
    letterBody.innerHTML = "";
    cfg.letterParagraphs.forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      letterBody.appendChild(p);
    });
  }

  // Populate Light Paper Note (Wishes)
  setText("note-title", cfg.noteTitle);
  const wishesList = document.getElementById("wishes-list");
  if (wishesList && Array.isArray(cfg.wishes)) {
    wishesList.innerHTML = "";
    cfg.wishes.forEach((wish) => {
      const li = document.createElement("li");
      li.textContent = wish;
      wishesList.appendChild(li);
    });
  }

  // Populate Two-Gift Widget
  setText("gifts-title", cfg.giftsTitle);
  setText("gifts-subtitle", cfg.giftsSubtitle);

  setText("locked-gift-badge", cfg.lockedGift.badge);
  setText("locked-gift-title", cfg.lockedGift.title);
  setText("locked-gift-status", cfg.lockedGift.statusText);
  setText("locked-gift-hint", cfg.lockedGift.hintText);

  setText("mom-gift-badge", cfg.momGift.badge);
  setText("mom-gift-title", cfg.momGift.title);
  setText("mom-gift-subtitle", cfg.momGift.subtitle);
  setText("mom-gift-cta", cfg.momGift.ctaText);

  // Populate Modal
  setText("modal-eyebrow", cfg.modal.eyebrow);
  setText("modal-title", cfg.modal.title);
  setText("modal-message", cfg.modal.message);
  setText("modal-signature", cfg.modal.signature);
  setText("cert-brand-name", cfg.modal.certificateBrand);
  setText("cert-type", cfg.modal.certificateType);
  setText("cert-note", cfg.modal.certificateNote);

  // Gentle nudge when clicking the locked gray gift
  const lockedCard = document.getElementById("locked-gift-card");
  if (lockedCard) {
    lockedCard.addEventListener("click", () => {
      lockedCard.classList.remove("is-nudged");
      void lockedCard.offsetWidth;
      lockedCard.classList.add("is-nudged");
    });
  }

  // Modal open / close logic
  const momCard = document.getElementById("mom-gift-card");
  const modal = document.getElementById("gift-modal");
  const closeBtn = document.getElementById("modal-close-btn");
  const toggleEmailBtn = document.getElementById("toggle-email-btn");
  const emailForm = document.getElementById("email-form");
  const emailInput = document.getElementById("recipient-email");
  const emailSubmit = document.getElementById("send-email-submit");
  const emailFeedback = document.getElementById("email-feedback");

  const openModal = () => {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    momCard?.focus();
  };

  momCard?.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) {
      closeModal();
    }
  });

  // Reveal email input row when clicking "Отправить сертификат"
  toggleEmailBtn?.addEventListener("click", () => {
    if (!emailForm) return;
    const isHidden = emailForm.hidden;
    emailForm.hidden = !isHidden;
    if (isHidden) {
      emailInput?.focus();
    }
  });

  // Initialize EmailJS if keys are provided
  const hasEmailJsConfig =
    Boolean(cfg.emailjs?.publicKey) &&
    Boolean(cfg.emailjs?.serviceId) &&
    Boolean(cfg.emailjs?.templateId);

  if (hasEmailJsConfig && window.emailjs) {
    window.emailjs.init({ publicKey: cfg.emailjs.publicKey });
  }

  const setFeedback = (message, type) => {
    if (!emailFeedback) return;
    emailFeedback.textContent = message;
    emailFeedback.classList.remove("is-error", "is-success");
    if (type) emailFeedback.classList.add(type);
  };

  emailForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput?.value.trim() || "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFeedback("Пожалуйста, введите корректный адрес электронной почты.", "is-error");
      emailInput?.focus();
      return;
    }

    if (!hasEmailJsConfig || !window.emailjs) {
      setFeedback(
        "EmailJS ещё не настроен в config.js. Добавьте ключи (см. README.md).",
        "is-error"
      );
      return;
    }

    emailSubmit.disabled = true;
    emailSubmit.textContent = "Отправка...";
    setFeedback("", "");

    try {
      await window.emailjs.send(cfg.emailjs.serviceId, cfg.emailjs.templateId, {
        to_email: email,
        recipient_name: cfg.recipientName,
        from_name: cfg.modal.signature,
        certificate_brand: cfg.modal.certificateBrand,
        message: cfg.modal.message
      });

      setFeedback(`Сертификат отправлен на ${email}!`, "is-success");
      emailForm.reset();
    } catch (error) {
      console.error("EmailJS error:", error);
      setFeedback(
        "Не удалось отправить письмо. Проверьте настройки EmailJS в config.js.",
        "is-error"
      );
    } finally {
      emailSubmit.disabled = false;
      emailSubmit.textContent = "Отправить";
    }
  });

  // Scroll reveal observer
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }
})();
