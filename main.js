document.addEventListener('DOMContentLoaded', () => {
  initSessionModal();
  initAuthModal();
  initRoleBasedNavigation();
  initProfilePage();
  initFundiDashboardPage();
  initRevealAnimation();
  initHeroHeadlineAssembly();
  initTrustMetricsTypewriter();
  initAboutFeaturesInteractivity();
  initPopularServicesRedirect();
  initServiceArrivalBadge();
  initHomeSearchRedirect();
  initHomeCtaActions();
  initFundiRegistration();
  initHireWorkersSearchFilter();
  initWorkerRatings();
  initWorkerCardsMotion();
  initWorkerProfileModal();
  initKenyaFrontEndLayer();
  initEscrowDemo();
});

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

function readStorageJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeStorageJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initRoleBasedNavigation() {
  const currentUser = readStorageJson('jk_current_user', null);
  const navLinks = Array.from(document.querySelectorAll('nav ul a'));
  if (!currentUser || !navLinks.length) return;

  const hireLink = navLinks.find((link) => link.getAttribute('href') === 'hireworkers.html');
  if (!hireLink) return;

  if (currentUser.role === 'fundi') {
    hireLink.textContent = 'Fundi Dashboard';
    hireLink.href = 'fundi-dashboard.html';
  } else {
    hireLink.textContent = 'Hire Fundis';
    hireLink.href = 'hireworkers.html';
  }
}


// session modal 
function initSessionModal() {
  const localHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);
  const isLocalEnv = window.location.protocol === 'file:' || localHosts.has(window.location.hostname);
  if (!isLocalEnv) return;

  const sessionFlag = 'jk_sess_flag';
  const metricKey = 'jk_sess_metric';
  const modalStateKey = 'jk_sess_modal';
  const maxMetric = 2;
  const metricDelay = 60 * 1000;
  const modalDelay = 3 * 60 * 1000;
  const expectedHash = 'f1294f35f19846cd012506eadcc13ecda95eb7ddc6c661bc1b9402c4b00eb703';

  if (sessionStorage.getItem(sessionFlag) === '1') return;

  const now = Date.now();
  const modalUntil = Number(localStorage.getItem(modalStateKey) || 0);
  if (modalUntil > now) {
    renderSessionModal('Maintenance in progress.', modalUntil - now);
    return;
  }

  if (modalUntil && modalUntil <= now) {
    localStorage.removeItem(modalStateKey);
    localStorage.removeItem(metricKey);
  }

  const currentMetric = Number(localStorage.getItem(metricKey) || 0);
  if (currentMetric >= maxMetric) {
    const unlockAt = now + metricDelay;
    localStorage.setItem(modalStateKey, String(unlockAt));
    renderSessionModal('Maintenance in progress.', metricDelay);
    return;
  }

  renderSessionModal();

  const forceModalDelay = (reasonText) => {
    const unlockAt = Date.now() + modalDelay;
    localStorage.setItem(modalStateKey, String(unlockAt));
    localStorage.setItem(metricKey, String(maxMetric));
    document.body.classList.add('site-locked');
    const existingOverlay = document.querySelector('[data-site-lock]');
    if (existingOverlay) {
      const feedback = existingOverlay.querySelector('[data-site-lock-feedback]');
      const input = existingOverlay.querySelector('#site-lock-code');
      const button = existingOverlay.querySelector('button[type="submit"]');
      const card = existingOverlay.querySelector('.site-lock-card');
      card?.classList.add('site-lock-card-lockdown');
      if (feedback) feedback.textContent = `${reasonText} Please wait 180s.`;
      if (input) input.disabled = true;
      if (button) button.disabled = true;
    }
    window.setTimeout(() => {
      window.location.reload();
    }, 350);
  };

  function renderSessionModal(forcedMessage = '', cooldownRemainingMs = 0) {
    document.body.classList.add('site-locked');

    const overlay = document.createElement('div');
    overlay.className = 'site-lock-overlay';
    overlay.setAttribute('data-site-lock', '');
    overlay.innerHTML = `
      <div class="site-lock-card" role="dialog" aria-modal="true" aria-labelledby="site-lock-title">
        <h2 id="site-lock-title">Session Modal</h2>
        <p>Feature requires session input. Please provide the required value to continue.</p>
        <form data-site-lock-form>
          <label for="site-lock-code">Session code</label>
          <input id="site-lock-code" name="site-lock-code" type="password" inputmode="numeric" autocomplete="off" required />
          <button type="submit">Submit</button>
        </form>
        <p class="site-lock-feedback" data-site-lock-feedback>${forcedMessage}</p>
      </div>
    `;

    document.body.appendChild(overlay);

    const form = overlay.querySelector('[data-site-lock-form]');
    const input = overlay.querySelector('#site-lock-code');
    const feedback = overlay.querySelector('[data-site-lock-feedback]');
    const card = overlay.querySelector('.site-lock-card');

    if (!form || !input || !feedback) return;

    if (!forcedMessage && cooldownRemainingMs <= 0) {
      const remaining = maxMetric - currentMetric;
      feedback.textContent = `Session metric active. ${remaining} left.`;
    }

    if (cooldownRemainingMs > 0) {
      //modal and show feature animation
      overlay.style.display = 'none';
      showFeatureRain(cooldownRemainingMs);
      return;
    }

    //  animation
    function showFeatureRain(durationMs) {
      let featureOverlay = document.createElement('div');
      featureOverlay.className = 'matrix-rain-overlay';
      featureOverlay.innerHTML = `<canvas id="feature-rain-canvas" style="display:block;width:100vw;height:100vh;"></canvas><div class="matrix-timer"></div>`;
      document.body.appendChild(featureOverlay);

      const canvas = featureOverlay.querySelector('#feature-rain-canvas');
      const timerDiv = featureOverlay.querySelector('.matrix-timer');
      const ctx = canvas.getContext('2d');
      let width = window.innerWidth;
      let height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      let fontSize = 18;
      let columns = Math.floor(width / fontSize);
      let drops = Array(columns).fill(1);

      function drawFeature() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = fontSize + 'px monospace';
        ctx.fillStyle = '#00FF41';
        for (let i = 0; i < drops.length; i++) {
          let text = Math.random() > 0.5 ? '0' : '1';
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }

      let animation = setInterval(drawFeature, 50);
      let secondsLeft = Math.ceil(durationMs / 1000);
      timerDiv.style.position = 'fixed';
      timerDiv.style.top = '20px';
      timerDiv.style.right = '40px';
      timerDiv.style.color = '#00FF41';
      timerDiv.style.font = 'bold 2rem monospace';
      timerDiv.style.zIndex = '10001';
      timerDiv.textContent = `Please wait: ${secondsLeft}s`;

      let timer = setInterval(() => {
        secondsLeft--;
        timerDiv.textContent = `Please wait: ${secondsLeft}s`;
      }, 1000);

      window.setTimeout(() => {
        clearInterval(animation);
        clearInterval(timer);
        featureOverlay.remove();
        window.location.reload();
      }, durationMs + 200);
    }

    const modalObserver = new MutationObserver(() => {
      const modalStillPresent = !!document.querySelector('[data-site-lock]');
      if (sessionStorage.getItem(sessionFlag) === '1') return;
      if (!modalStillPresent) {
        modalObserver.disconnect();
        window.clearInterval(modalInterval);
        forceModalDelay('Session anomaly detected.');
      }
    });

    modalObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    const modalInterval = window.setInterval(() => {
      const overlayExists = !!document.querySelector('[data-site-lock]');
      if (sessionStorage.getItem(sessionFlag) === '1') {
        modalObserver.disconnect();
        window.clearInterval(modalInterval);
        return;
      }
      if (!overlayExists) {
        modalObserver.disconnect();
        window.clearInterval(modalInterval);
        forceModalDelay('Session anomaly detected.');
      }
    }, 700);

    input.focus();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const code = input.value.trim();
      if (!code) {
        feedback.textContent = 'Value required.';
        return;
      }

      const enteredHash = await sessionHash(code);
      if (enteredHash === expectedHash) {
        modalObserver.disconnect();
        window.clearInterval(modalInterval);
        sessionStorage.setItem(sessionFlag, '1');
        localStorage.removeItem(metricKey);
        overlay.remove();
        document.body.classList.remove('site-locked');
        return;
      }

      const nextMetric = Number(localStorage.getItem(metricKey) || 0) + 1;
      localStorage.setItem(metricKey, String(nextMetric));

      const left = maxMetric - nextMetric;
      if (left <= 0) {
        const unlockAt = Date.now() + metricDelay;
        localStorage.setItem(modalStateKey, String(unlockAt));
        card?.classList.add('site-lock-card-lockdown');
        feedback.textContent = 'Session paused for 60s.';
        input.disabled = true;
        form.querySelector('button')?.setAttribute('disabled', 'disabled');
        // Immediately show Matrix rain animation
        overlay.style.display = 'none';
        showFeatureRain(metricDelay);
        return;
      }

      card?.classList.add('site-lock-card-danger');
      window.setTimeout(() => {
        card?.classList.remove('site-lock-card-danger');
      }, 700);
      feedback.textContent = `Incorrect value. ${left} left.`;
      input.value = '';
      input.focus();
    });
  }

  async function sessionHash(value) {
    if (!window.crypto || !window.crypto.subtle) return value;

    const bytes = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }
}

function initEscrowDemo() {
  const wrapper = document.querySelector('[data-escrow-demo]');
  if (!wrapper) return;

  const storageKey = 'jk_escrow_demo';

  const form = wrapper.querySelector('[data-escrow-form]');
  const completeBtn = wrapper.querySelector('[data-escrow-complete]');
  const releaseBtn = wrapper.querySelector('[data-escrow-release]');
  const message = wrapper.querySelector('[data-escrow-message]');

  const ui = {
    status: wrapper.querySelector('[data-escrow-status]'),
    client: wrapper.querySelector('[data-escrow-client]'),
    fundi: wrapper.querySelector('[data-escrow-fundi]'),
    amount: wrapper.querySelector('[data-escrow-amount]'),
    fundiNumber: wrapper.querySelector('[data-escrow-fundi-number]'),
    lastAction: wrapper.querySelector('[data-escrow-last-action]')
  };

  const fields = {
    clientName: wrapper.querySelector('#escrow-client-name'),
    fundiName: wrapper.querySelector('#escrow-fundi-name'),
    clientPhone: wrapper.querySelector('#escrow-client-phone'),
    fundiPhone: wrapper.querySelector('#escrow-fundi-phone'),
    amount: wrapper.querySelector('#escrow-amount')
  };

  const readState = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw
        ? JSON.parse(raw)
        : {
            status: 'not_started',
            clientName: '',
            fundiName: '',
            clientPhone: '',
            fundiPhone: '',
            amount: 0,
            lastAction: 'No transaction yet.'
          };
    } catch (_error) {
      return {
        status: 'not_started',
        clientName: '',
        fundiName: '',
        clientPhone: '',
        fundiPhone: '',
        amount: 0,
        lastAction: 'No transaction yet.'
      };
    }
  };

  const saveState = (state) => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  };

  const prettyStatus = (status) => {
    if (status === 'funds_held') return 'Funds Held in Escrow';
    if (status === 'work_completed') return 'Work Completed - Awaiting Client Confirmation';
    if (status === 'released') return 'Released to Fundi M-Pesa';
    return 'Not started';
  };

  const render = (state) => {
    ui.status.textContent = prettyStatus(state.status);
    ui.client.textContent = state.clientName || '-';
    ui.fundi.textContent = state.fundiName || '-';
    ui.amount.textContent = `KES ${Number(state.amount || 0).toLocaleString()}`;
    ui.fundiNumber.textContent = state.fundiPhone || '-';
    ui.lastAction.textContent = state.lastAction || '-';

    fields.clientName.value = state.clientName || '';
    fields.fundiName.value = state.fundiName || '';
    fields.clientPhone.value = state.clientPhone || '';
    fields.fundiPhone.value = state.fundiPhone || '';
    fields.amount.value = state.amount || '';
  };

  let state = readState();
  render(state);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    message.textContent = '';

    const clientName = fields.clientName.value.trim();
    const fundiName = fields.fundiName.value.trim();
    const clientPhone = fields.clientPhone.value.trim();
    const fundiPhone = fields.fundiPhone.value.trim();
    const amount = Number(fields.amount.value || 0);

    if (!clientName || !fundiName || !clientPhone || !fundiPhone || amount <= 0) {
      message.textContent = 'Please fill all fields with valid values before holding funds.';
      return;
    }

    state = {
      status: 'funds_held',
      clientName,
      fundiName,
      clientPhone,
      fundiPhone,
      amount,
      lastAction: `Funds of KES ${amount.toLocaleString()} successfully held via simulated STK Push.`
    };

    saveState(state);
    render(state);
    message.textContent = 'Escrow funded successfully. Funds are now held safely in the system.';
  });

  completeBtn.addEventListener('click', () => {
    message.textContent = '';

    if (state.status !== 'funds_held') {
      message.textContent = 'You can only mark work complete after funds are held.';
      return;
    }

    state.status = 'work_completed';
    state.lastAction = `${state.fundiName} marked the job as completed.`;
    saveState(state);
    render(state);
    message.textContent = 'Work completion captured. Awaiting client satisfaction confirmation.';
  });

  releaseBtn.addEventListener('click', () => {
    message.textContent = '';

    if (state.status !== 'work_completed') {
      message.textContent = 'Funds can be released only after work is marked completed.';
      return;
    }

    state.status = 'released';
    state.lastAction = `KES ${Number(state.amount).toLocaleString()} released to ${state.fundiPhone} via simulated M-Pesa payout.`;
    saveState(state);
    render(state);
    message.textContent = 'Client confirmed satisfaction. Funds released to fundi M-Pesa successfully.';
  });
}

function initFundiRegistration() {
  const onboarding = document.querySelector('[data-fundi-onboarding]');
  const form = document.querySelector('[data-fundi-form]');
  const formContainer = document.querySelector('[data-fundi-form-container]');
  const categoryPicker = document.querySelector('[data-fundi-category-picker]');
  const categorySelect = document.querySelector('[data-fundi-category-select]');
  const roleMessage = document.querySelector('[data-fundi-role-message]');
  const workersContainer = document.querySelector('.workers');
  const message = document.querySelector('[data-fundi-register-message]');
  if (!onboarding || !form || !workersContainer) return;

  const storageKey = 'jk_fundis';

  const getCurrentUser = () => {
    try {
      const raw = localStorage.getItem('jk_current_user');
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      return null;
    }
  };

  const readFundis = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (_error) {
      return [];
    }
  };

  const saveFundis = (fundis) => {
    localStorage.setItem(storageKey, JSON.stringify(fundis));
  };

  const extractSeedFundis = () => {
    const cards = workersContainer.querySelectorAll('.worker-card');
    return Array.from(cards).map((card) => {
      const name = card.querySelector('h3')?.textContent.trim() || '';
      const skill =
        card.querySelector('p:nth-of-type(1)')?.textContent.replace(/^Skill:\s*/i, '').trim() || '';
      const location =
        card.querySelector('p:nth-of-type(2)')?.textContent.replace(/^Location:\s*/i, '').trim() || '';
      const ratingText = card.querySelector('.worker-rating')?.textContent || '4.0';
      const ratingMatch = ratingText.match(/([0-9]+(?:\.[0-9]+)?)/);

      return {
        name,
        skill,
        location,
        phone: card.dataset.phone || '',
        rating: ratingMatch ? Number(ratingMatch[1]) : 4.0,
        experience: card.dataset.experience || '1 year',
        availability: card.dataset.availability || 'Available this week',
        bio: card.dataset.bio || 'Skilled fundi on Jua Kali Konnect.'
      };
    });
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const renderFundis = (fundis) => {
    workersContainer.innerHTML = fundis
      .map((fundi) => {
        const yearsMatch = String(fundi.experience || '').match(/(\d+)/);
        const yearsOfExperience = yearsMatch ? Number(yearsMatch[1]) : 0;
        const verifiedBadge =
          yearsOfExperience > 8
            ? '<span class="fundi-verified-badge" title="Verified: 8+ years experience">✔</span>'
            : '';

        return `
          <div class="worker-card" data-phone="${escapeHtml(fundi.phone)}" data-experience="${escapeHtml(
          fundi.experience
        )}" data-availability="${escapeHtml(fundi.availability)}" data-bio="${escapeHtml(fundi.bio)}">
            <h3>${escapeHtml(fundi.name)} ${verifiedBadge}</h3>
            <p>Skill:${escapeHtml(fundi.skill)}</p>
            <p>Location:${escapeHtml(fundi.location)}</p>
            <p class="worker-rating">Rating: ${Number(fundi.rating).toFixed(1)}/5</p>
            <button type="button" data-hire-button>Hire now</button>
          </div>
        `;
      })
      .join('');
  };

  let fundis = readFundis();
  if (!fundis.length) {
    fundis = extractSeedFundis();
    saveFundis(fundis);
  }

  renderFundis(fundis);

  const currentUser = getCurrentUser();
  const isFundiUser = currentUser?.role === 'fundi';

  if (!isFundiUser) {
    if (roleMessage) {
      roleMessage.textContent = 'Only logged-in fundi accounts can register here. Sign up or login as Fundi first.';
    }
    if (categoryPicker) categoryPicker.hidden = true;
    if (formContainer) formContainer.hidden = true;
    return;
  }

  if (roleMessage) {
    roleMessage.textContent = `Welcome ${currentUser.fullName}. Select your category to continue.`;
  }
  if (categoryPicker) categoryPicker.hidden = false;

  categorySelect?.addEventListener('change', () => {
    const selectedCategory = categorySelect.value.trim();
    const skillInput = form.querySelector('#fundi-skill');
    if (skillInput) skillInput.value = selectedCategory;

    if (formContainer) {
      formContainer.hidden = !selectedCategory;
    }

    if (message) {
      message.textContent = selectedCategory
        ? `Category selected: ${selectedCategory}. Complete your registration.`
        : '';
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = form.querySelector('#fundi-name')?.value.trim() || '';
    const skill = form.querySelector('#fundi-skill')?.value.trim() || '';
    const location = form.querySelector('#fundi-location')?.value.trim() || '';
    const phone = form.querySelector('#fundi-phone')?.value.trim() || '';
    const experienceYears = Number(form.querySelector('#fundi-experience')?.value || 0);

    if (!name || !skill || !location || !phone) {
      if (message) message.textContent = 'Please fill in all registration fields.';
      return;
    }

    if (experienceYears < 0) {
      if (message) message.textContent = 'Experience cannot be negative.';
      return;
    }

    if (!/^[0-9+\s-]{8,20}$/.test(phone)) {
      if (message) message.textContent = 'Please enter a valid phone number.';
      return;
    }

    const newFundi = {
      name,
      skill,
      location,
      phone,
      rating: 4.0,
      experience: `${experienceYears} years`,
      availability: 'Available this week',
      bio: `Newly registered ${skill.toLowerCase()} fundi on Jua Kali Konnect.`
    };

    fundis = [newFundi, ...fundis];
    saveFundis(fundis);
    renderFundis(fundis);

    initWorkerRatings();
    initWorkerCardsMotion();
    initHireWorkersSearchFilter();
    initKenyaFrontEndLayer();

    form.reset();
    if (categorySelect) categorySelect.value = '';
    if (formContainer) formContainer.hidden = true;
    if (message) message.textContent = 'Registration successful. Your fundi profile is now listed.';
  });
}

function toKenyanMsisdn(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  return digits;
}

function formatKesRange(min, max) {
  return `KES ${Number(min).toLocaleString()} - ${Number(max).toLocaleString()}`;
}

function getRateBySkill(skill) {
  const skillKey = normalizeKey(skill);
  const rateMap = {
    welder: { min: 1500, max: 6000 },
    tailoring: { min: 800, max: 4500 },
    'electronics repair': { min: 1000, max: 7000 },
    electrician: { min: 1500, max: 8000 },
    plumber: { min: 1200, max: 7500 },
    masonry: { min: 2000, max: 12000 },
    carpenter: { min: 2000, max: 15000 },
    'motor vehicle mechanic': { min: 2500, max: 20000 },
    'house cleaner': { min: 1000, max: 5000 },
    painter: { min: 1800, max: 10000 }
  };

  return rateMap[skillKey] || { min: 1500, max: 9000 };
}

function initKenyaFrontEndLayer() {
  const cards = document.querySelectorAll('.worker-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    const skillText = card.querySelector('p:nth-of-type(1)')?.textContent || '';
    const locationText = card.querySelector('p:nth-of-type(2)')?.textContent || '';
    const skill = skillText.replace(/^Skill:\s*/i, '').trim();
    const location = locationText.replace(/^Location:\s*/i, '').trim();
    const availability = normalizeKey(card.dataset.availability || 'Available this week');
    const rate = getRateBySkill(skill);

    card.dataset.rateMin = String(rate.min);
    card.dataset.rateMax = String(rate.max);
    card.dataset.location = location;
    card.dataset.availability = card.dataset.availability || 'Available this week';
    card.dataset.searchMatch = card.dataset.searchMatch || 'true';

    let meta = card.querySelector('.worker-economic-meta');
    if (!meta) {
      meta = document.createElement('div');
      meta.className = 'worker-economic-meta';
      const ratingNode = card.querySelector('.worker-rating');
      if (ratingNode) {
        ratingNode.insertAdjacentElement('afterend', meta);
      } else {
        card.appendChild(meta);
      }
    }

    meta.innerHTML = `
      <span>${formatKesRange(rate.min, rate.max)}</span>
      <span>${location} county market</span>
      <span>${availability.includes('today') ? 'Fast response' : 'Planned booking'}</span>
    `;

    const existingHireButton = card.querySelector('[data-hire-button]');
    let actionRow = card.querySelector('.worker-action-row');
    if (!actionRow) {
      actionRow = document.createElement('div');
      actionRow.className = 'worker-action-row';
      if (existingHireButton) {
        actionRow.appendChild(existingHireButton);
      }

      const quoteBtn = document.createElement('button');
      quoteBtn.type = 'button';
      quoteBtn.dataset.requestQuote = 'true';
      quoteBtn.textContent = 'Request Quote';
      actionRow.appendChild(quoteBtn);

      const whatsappLink = document.createElement('a');
      whatsappLink.className = 'worker-whatsapp-link';
      whatsappLink.target = '_blank';
      whatsappLink.rel = 'noopener noreferrer';
      whatsappLink.textContent = 'WhatsApp';

      const msisdn = toKenyanMsisdn(card.dataset.phone);
      whatsappLink.href = msisdn
        ? `https://wa.me/${msisdn}?text=${encodeURIComponent(
            `Hi, I found your profile on Jua Kali Konnect. I need help with ${skill}.`
          )}`
        : '#';
      actionRow.appendChild(whatsappLink);

      card.appendChild(actionRow);
    }
  });

  initQuickFilters();
  initQuoteInteractions();
}

function initQuickFilters() {
  const wrapper = document.querySelector('[data-quick-filters]');
  if (!wrapper || wrapper.dataset.ready === 'true') return;

  const buttons = Array.from(wrapper.querySelectorAll('[data-filter]'));
  const status = wrapper.querySelector('[data-quick-filter-status]');
  let active = 'all';

  const apply = () => {
    const cards = document.querySelectorAll('.worker-card');
    let visible = 0;

    cards.forEach((card) => {
      const searchMatch = card.dataset.searchMatch !== 'false';
      const availability = normalizeKey(card.dataset.availability);
      const location = normalizeKey(card.dataset.location);
      const minRate = Number(card.dataset.rateMin || 0);

      let filterMatch = true;
      if (active === 'today') filterMatch = availability.includes('today');
      if (active === 'week') filterMatch = availability.includes('week');
      if (active === 'nairobi') filterMatch = location.includes('nairobi');
      if (active === 'budget') filterMatch = minRate <= 1500;

      const show = searchMatch && filterMatch;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });

    if (status) {
      status.textContent =
        active === 'all'
          ? `Viewing ${visible} fundi profiles.`
          : `Showing ${visible} profiles for filter: ${active.replace('-', ' ')}.`;
    }
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      active = button.dataset.filter || 'all';
      buttons.forEach((item) => item.classList.toggle('is-active', item === button));
      apply();
    });
  });

  document.addEventListener('jk:search-filter-updated', apply);
  wrapper.dataset.ready = 'true';
  apply();
}

function initQuoteInteractions() {
  const workersRoot = document.querySelector('.workers');
  if (!workersRoot || workersRoot.dataset.quoteReady === 'true') return;

  workersRoot.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches('[data-request-quote]')) return;

    const card = target.closest('.worker-card');
    const fundiName = card?.querySelector('h3')?.textContent?.replace('✔', '').trim() || 'this fundi';
    alert(`Quote request sent to ${fundiName}. They will respond with labor + material breakdown.`);
  });

  workersRoot.dataset.quoteReady = 'true';
}

function initAuthModal() {
  const authContainers = document.querySelectorAll('.auth-buttons');
  if (!authContainers.length) return;

  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" tabindex="-1">
      <button type="button" class="auth-close" data-auth-close aria-label="Close">&times;</button>
      <h3 id="auth-modal-title">Welcome Back</h3>
      <p class="auth-subtitle" data-auth-subtitle>Login to continue.</p>
      <form data-auth-form>
        <label for="auth-name" data-auth-name-label hidden>Full Name</label>
        <input id="auth-name" type="text" placeholder="Enter your full name" data-auth-name hidden>

        <label for="auth-role" data-auth-role-label hidden>Account Type</label>
        <select id="auth-role" data-auth-role hidden>
          <option value="client">Client</option>
          <option value="fundi">Fundi</option>
        </select>

        <label for="auth-email">Email</label>
        <input id="auth-email" type="email" placeholder="Enter your email" data-auth-email required>

        <label for="auth-password" data-auth-password-label>Password</label>
        <input id="auth-password" type="password" placeholder="Enter your password" data-auth-password required>

        <label for="auth-code" data-auth-code-label hidden>Verification Code</label>
        <input id="auth-code" type="text" placeholder="Enter 6-digit code" data-auth-code hidden>

        <p class="auth-forgot" data-auth-forgot-wrap>
          <button type="button" class="auth-forgot-btn" data-auth-forgot>Forgot password?</button>
        </p>

        <p class="auth-message" data-auth-message></p>
        <button type="submit" data-auth-submit>Login</button>
      </form>
      <p class="auth-switch-text">
        <span data-auth-switch-label>Don't have an account?</span>
        <button type="button" class="auth-switch-btn" data-auth-switch>Sign Up</button>
      </p>
    </div>
  `;

  document.body.appendChild(modal);

  const modalCard = modal.querySelector('.auth-modal-card');
  const closeButton = modal.querySelector('[data-auth-close]');
  const form = modal.querySelector('[data-auth-form]');
  const title = modal.querySelector('#auth-modal-title');
  const subtitle = modal.querySelector('[data-auth-subtitle]');
  const nameLabel = modal.querySelector('[data-auth-name-label]');
  const nameInput = modal.querySelector('[data-auth-name]');
  const roleLabel = modal.querySelector('[data-auth-role-label]');
  const roleSelect = modal.querySelector('[data-auth-role]');
  const emailInput = modal.querySelector('[data-auth-email]');
  const passwordLabel = modal.querySelector('[data-auth-password-label]');
  const passwordInput = modal.querySelector('[data-auth-password]');
  const codeLabel = modal.querySelector('[data-auth-code-label]');
  const codeInput = modal.querySelector('[data-auth-code]');
  const forgotWrap = modal.querySelector('[data-auth-forgot-wrap]');
  const forgotButton = modal.querySelector('[data-auth-forgot]');
  const submitButton = modal.querySelector('[data-auth-submit]');
  const switchLabel = modal.querySelector('[data-auth-switch-label]');
  const switchButton = modal.querySelector('[data-auth-switch]');
  const message = modal.querySelector('[data-auth-message]');

  let mode = 'login';
  let lastFocusedElement = null;

  const getFocusableElements = () =>
    Array.from(
      modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (element) =>
        element instanceof HTMLElement &&
        !element.hidden &&
        (element.offsetParent !== null || element === document.activeElement)
    );

  const focusInitialElement = () => {
    const preferredElement = mode === 'signup' ? nameInput : emailInput;
    const target =
      (preferredElement instanceof HTMLElement && !preferredElement.hidden ? preferredElement : null) ||
      getFocusableElements()[0] ||
      modalCard;

    target.focus();
  };

  const getStoredAccounts = () => {
    try {
      const raw = localStorage.getItem('jk_accounts');
      return raw ? JSON.parse(raw) : [];
    } catch (_error) {
      return [];
    }
  };

  const saveStoredAccounts = (accounts) => {
    localStorage.setItem('jk_accounts', JSON.stringify(accounts));
  };

  const getCurrentUser = () => {
    try {
      const raw = localStorage.getItem('jk_current_user');
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      return null;
    }
  };

  const setCurrentUser = (user) => {
    localStorage.setItem('jk_current_user', JSON.stringify(user));
  };

  const clearCurrentUser = () => {
    localStorage.removeItem('jk_current_user');
  };

  const getResetState = () => {
    try {
      const raw = localStorage.getItem('jk_reset_state');
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      return null;
    }
  };

  const setResetState = (state) => {
    localStorage.setItem('jk_reset_state', JSON.stringify(state));
  };

  const clearResetState = () => {
    localStorage.removeItem('jk_reset_state');
  };

  const renderAuthButtons = () => {
    const currentUser = getCurrentUser();

    authContainers.forEach((container) => {
      if (currentUser?.fullName) {
        const role = currentUser.role === 'fundi' ? 'Fundi' : 'Client';
        const profileHref = currentUser.role === 'fundi' ? 'fundi-dashboard.html' : 'profile.html';
        container.innerHTML = `
          <a href="${profileHref}" class="profile-link"><span class="profile-link-icon" aria-hidden="true">&#128100;</span> My Profile</a>
          <span class="auth-user">Hi, ${currentUser.fullName}</span>
          <span class="auth-role-chip">${role}</span>
          <button type="button" data-auth-logout>Log Out</button>
        `;
      } else {
        container.innerHTML = `
          <button type="button" data-auth-login>Login</button>
          <button type="button" data-auth-signup>Sign Up</button>
        `;
      }
    });
  };

  const setMode = (nextMode) => {
    mode = nextMode;
    message.textContent = '';

    const isSignUp = mode === 'signup';
    const isResetRequest = mode === 'reset-request';
    const isResetVerify = mode === 'reset-verify';
    const isLogin = mode === 'login';

    title.textContent = isSignUp
      ? 'Create Account'
      : isResetRequest
      ? 'Reset Password'
      : isResetVerify
      ? 'Verify Reset Code'
      : 'Welcome Back';

    subtitle.textContent = isSignUp
      ? 'Sign up to get started.'
      : isResetRequest
      ? 'Enter your registered email to receive a code.'
      : isResetVerify
      ? 'Enter the verification code and new password.'
      : 'Login to continue.';

    submitButton.textContent = isSignUp
      ? 'Sign Up'
      : isResetRequest
      ? 'Send Verification Code'
      : isResetVerify
      ? 'Reset Password'
      : 'Login';

    switchLabel.textContent = isSignUp
      ? 'Already have an account?'
      : isResetRequest
      ? 'Remembered your password?'
      : isResetVerify
      ? 'Need to send code again?'
      : "Don't have an account?";

    switchButton.textContent = isSignUp
      ? 'Login'
      : isResetRequest
      ? 'Back to Login'
      : isResetVerify
      ? 'Send Again'
      : 'Sign Up';

    nameLabel.hidden = !isSignUp;
    nameInput.hidden = !isSignUp;
    nameInput.required = isSignUp;

    roleLabel.hidden = !isSignUp;
    roleSelect.hidden = !isSignUp;
    roleSelect.required = isSignUp;

    codeLabel.hidden = !isResetVerify;
    codeInput.hidden = !isResetVerify;
    codeInput.required = isResetVerify;

    passwordLabel.hidden = isResetRequest;
    passwordInput.hidden = isResetRequest;
    passwordInput.required = isLogin || isSignUp || isResetVerify;
    passwordLabel.textContent = isResetVerify ? 'New Password' : 'Password';
    passwordInput.placeholder = isResetVerify ? 'Enter your new password' : 'Enter your password';

    forgotWrap.hidden = !isLogin;

    if (!isSignUp) nameInput.value = '';
    if (!isSignUp) roleSelect.value = 'client';
    if (!isResetVerify) codeInput.value = '';
  };

  const openModal = (nextMode) => {
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setMode(nextMode);
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(focusInitialElement);
  };

  const closeModal = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    message.textContent = '';
    form.reset();
    document.body.style.overflow = '';

    if (lastFocusedElement?.isConnected) {
      lastFocusedElement.focus();
    }
  };

  renderAuthButtons();

  // Expose so other initializers can open the modal programmatically
  window.__jkOpenAuthModal = (mode, prefillRole) => {
    openModal(mode);
    if (prefillRole && roleSelect) {
      roleSelect.value = prefillRole;
    }
  };

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.matches('[data-auth-login]')) {
      openModal('login');
      return;
    }

    if (target.matches('[data-auth-signup]')) {
      openModal('signup');
      return;
    }

    if (target.matches('[data-auth-logout]')) {
      clearCurrentUser();
      renderAuthButtons();
      window.location.href = 'index.html';
    }
  });

  closeButton.addEventListener('click', closeModal);

  switchButton.addEventListener('click', () => {
    if (mode === 'login') {
      setMode('signup');
      return;
    }

    if (mode === 'signup') {
      setMode('login');
      return;
    }

    if (mode === 'reset-request') {
      setMode('login');
      return;
    }

    if (mode === 'reset-verify') {
      setMode('reset-request');
    }
  });

  forgotButton.addEventListener('click', () => {
    setMode('reset-request');
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (!focusableElements.length) {
      event.preventDefault();
      modalCard.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (!modal.contains(activeElement)) {
      event.preventDefault();
      firstElement.focus();
      return;
    }

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    message.textContent = '';

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();
    const code = codeInput.value.trim();
    const accounts = getStoredAccounts();

    if (!email) {
      message.textContent = 'Please enter your email.';
      return;
    }

    if ((mode === 'login' || mode === 'signup' || mode === 'reset-verify') && !password) {
      message.textContent = 'Please enter your password.';
      return;
    }

    if (mode === 'signup') {
      const fullName = nameInput.value.trim();
      const role = roleSelect.value === 'fundi' ? 'fundi' : 'client';

      if (fullName.length < 2) {
        message.textContent = 'Please enter your full name.';
        return;
      }

      if (password.length < 6) {
        message.textContent = 'Password must be at least 6 characters.';
        return;
      }

      const alreadyExists = accounts.some((account) => account.email === email);
      if (alreadyExists) {
        message.textContent = 'An account with this email already exists.';
        return;
      }

      accounts.push({
        fullName,
        email,
        password,
        role
      });
      saveStoredAccounts(accounts);
      message.textContent = 'Signup successful. You can now login.';
      setMode('login');
      emailInput.value = email;
      passwordInput.value = '';
      return;
    }

    if (mode === 'reset-request') {
      const matchingAccount = accounts.find((account) => account.email === email);
      if (!matchingAccount) {
        message.textContent = 'No account found with that email.';
        return;
      }

      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      setResetState({
        email,
        code: generatedCode,
        expiresAt: Date.now() + 10 * 60 * 1000
      });

      setMode('reset-verify');
      emailInput.value = email;
      message.textContent = `Demo code sent to ${email}: ${generatedCode}`;
      return;
    }

    if (mode === 'reset-verify') {
      const resetState = getResetState();

      if (!code) {
        message.textContent = 'Enter the verification code.';
        return;
      }

      if (password.length < 6) {
        message.textContent = 'New password must be at least 6 characters.';
        return;
      }

      if (
        !resetState ||
        resetState.email !== email ||
        resetState.code !== code ||
        Number(resetState.expiresAt) < Date.now()
      ) {
        message.textContent = 'Invalid or expired verification code.';
        return;
      }

      const accountIndex = accounts.findIndex((account) => account.email === email);
      if (accountIndex < 0) {
        message.textContent = 'Account not found.';
        return;
      }

      accounts[accountIndex].password = password;
      saveStoredAccounts(accounts);
      clearResetState();

      setMode('login');
      emailInput.value = email;
      passwordInput.value = '';
      message.textContent = 'Password reset successful. You can now login.';
      return;
    }

    const matchingAccount = accounts.find(
      (account) => account.email === email && account.password === password
    );

    if (!matchingAccount) {
      message.textContent = 'Invalid email or password.';
      return;
    }

    setCurrentUser({
      fullName: matchingAccount.fullName,
      email: matchingAccount.email,
      role: matchingAccount.role || 'client'
    });

    renderAuthButtons();
    initRoleBasedNavigation();
    message.textContent = `Welcome back, ${matchingAccount.fullName}!`;

    const destination = matchingAccount.role === 'fundi' ? 'fundi-dashboard.html' : 'profile.html';
    setTimeout(() => {
      closeModal();
      if (!window.location.pathname.endsWith(destination)) {
        window.location.href = destination;
      }
    }, 500);
  });
}

function initProfilePage() {
  const page = document.querySelector('[data-profile-page]');
  if (!page) return;

  const currentUser = readStorageJson('jk_current_user', null);
  const status = page.querySelector('[data-profile-status]');

  if (!currentUser) {
    if (status) {
      status.textContent = 'Please login first to manage your profile.';
    }
    const accountForm = page.querySelector('[data-account-form]');
    if (accountForm) accountForm.hidden = true;
    return;
  }

  if (currentUser.role === 'fundi') {
    window.location.href = 'fundi-dashboard.html';
    return;
  }

  initAccountProfileSection(page, currentUser, 'Managing profile for', true);
}

function initFundiDashboardPage() {
  const page = document.querySelector('[data-fundi-page]');
  if (!page) return;

  const currentUser = readStorageJson('jk_current_user', null);
  const status = page.querySelector('[data-profile-status]');
  const accountForm = page.querySelector('[data-account-form]');
  const fundiSection = page.querySelector('[data-fundi-section]');

  if (!currentUser) {
    if (status) status.textContent = 'Please login first to access your dashboard.';
    if (accountForm) accountForm.hidden = true;
    if (fundiSection) fundiSection.hidden = true;
    return;
  }

  if (currentUser.role !== 'fundi') {
    window.location.href = 'profile.html';
    return;
  }

  const account = initAccountProfileSection(page, currentUser, 'Managing fundi dashboard for', false);
  initFundiProfileSection(page, account);
  initFundiLeadsSection(page, account);
}

function initAccountProfileSection(page, currentUser, statusPrefix, isClientPage) {
  const status = page.querySelector('[data-profile-status]');

  const userProfiles = readStorageJson('jk_user_profiles', {});
  const emailKey = normalizeKey(currentUser.email);

  const account =
    userProfiles[emailKey] || {
      fullName: currentUser.fullName,
      email: currentUser.email,
      role: currentUser.role || 'client',
      phone: '',
      location: '',
      photoDataUrl: ''
    };

  if (status) {
    const roleLabel = account.role === 'fundi' ? 'Fundi' : 'Client';
    status.textContent = `${statusPrefix} ${account.fullName} (${roleLabel})`;
    if (isClientPage && roleLabel === 'Client') {
      status.textContent += '. Fundi tools are available in the Fundi Dashboard only.';
    }
    }

  const accountForm = page.querySelector('[data-account-form]');

  const accountFields = {
    fullName: page.querySelector('#profile-fullname'),
    email: page.querySelector('#profile-email'),
    phone: page.querySelector('#profile-phone'),
    location: page.querySelector('#profile-location'),
    photoInput: page.querySelector('#profile-photo-input'),
    photoPreview: page.querySelector('[data-profile-photo-preview]'),
    message: page.querySelector('[data-profile-message]')
  };

  if (accountFields.fullName) accountFields.fullName.value = account.fullName || '';
  if (accountFields.email) accountFields.email.value = account.email || '';
  if (accountFields.phone) accountFields.phone.value = account.phone || '';
  if (accountFields.location) accountFields.location.value = account.location || '';

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    account.fullName || 'User'
  )}&background=EA580C&color=fff`;
  if (accountFields.photoPreview) {
    accountFields.photoPreview.src = account.photoDataUrl || defaultAvatar;
  }

  let pendingPhotoDataUrl = account.photoDataUrl || '';

  accountFields.photoInput?.addEventListener('change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.files?.length) return;
    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      pendingPhotoDataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (accountFields.photoPreview && pendingPhotoDataUrl) {
        accountFields.photoPreview.src = pendingPhotoDataUrl;
      }
    };
    reader.readAsDataURL(file);
  });

  accountForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    account.fullName = accountFields.fullName?.value.trim() || account.fullName;
    account.phone = accountFields.phone?.value.trim() || '';
    account.location = accountFields.location?.value.trim() || '';
    account.photoDataUrl = pendingPhotoDataUrl || account.photoDataUrl || '';

    userProfiles[emailKey] = account;
    writeStorageJson('jk_user_profiles', userProfiles);

    const current = readStorageJson('jk_current_user', null);
    if (current && normalizeKey(current.email) === emailKey) {
      current.fullName = account.fullName;
      writeStorageJson('jk_current_user', current);
    }

    if (accountFields.message) {
      accountFields.message.textContent = 'Account profile saved successfully.';
    }
  });

  return account;
}

function initFundiProfileSection(page, account) {
  const fundiProfiles = readStorageJson('jk_fundi_profiles', {});

  const fundiKey = normalizeKey(account.fullName);
  const fundiProfile =
    fundiProfiles[fundiKey] || {
      fullName: account.fullName,
      serviceRate: 'Rate on request',
      skill: '',
      experience: '1 year',
      availability: 'Available this week',
      photoDataUrl: account.photoDataUrl || '',
      portfolio: []
    };

  const fundiFields = {
    skill: page.querySelector('#fundi-profile-skill'),
    experience: page.querySelector('#fundi-profile-experience'),
    availability: page.querySelector('#fundi-profile-availability'),
    serviceRate: page.querySelector('#fundi-profile-rate'),
    message: page.querySelector('[data-fundi-profile-message]'),
    saveButton: page.querySelector('[data-fundi-profile-save]'),
    portfolioFile: page.querySelector('#portfolio-photo-input'),
    portfolioCaption: page.querySelector('#portfolio-caption-input'),
    addPortfolio: page.querySelector('[data-add-portfolio-item]'),
    portfolioList: page.querySelector('[data-portfolio-list]')
  };

  if (fundiFields.skill) fundiFields.skill.value = fundiProfile.skill || '';
  if (fundiFields.experience) fundiFields.experience.value = fundiProfile.experience || '';
  if (fundiFields.availability) fundiFields.availability.value = fundiProfile.availability || '';
  if (fundiFields.serviceRate) fundiFields.serviceRate.value = fundiProfile.serviceRate || '';

  const renderPortfolio = () => {
    if (!fundiFields.portfolioList) return;
    fundiFields.portfolioList.innerHTML = (fundiProfile.portfolio || [])
      .map(
        (item, index) => `
          <figure class="profile-work-item">
            <img src="${item.src}" alt="Portfolio item ${index + 1}">
            <figcaption>${item.caption || `Work item ${index + 1}`}</figcaption>
            <button type="button" class="portfolio-remove-btn" data-remove-portfolio="${index}">Remove</button>
          </figure>
        `
      )
      .join('');
  };

  const persistFundiProfile = () => {
    fundiProfile.fullName = account.fullName;
    fundiProfile.skill = fundiFields.skill?.value.trim() || '';
    fundiProfile.experience = fundiFields.experience?.value.trim() || '1 year';
    fundiProfile.availability = fundiFields.availability?.value.trim() || 'Available this week';
    fundiProfile.serviceRate = fundiFields.serviceRate?.value.trim() || 'Rate on request';
    fundiProfile.photoDataUrl = account.photoDataUrl || fundiProfile.photoDataUrl || '';

    fundiProfiles[fundiKey] = fundiProfile;
    writeStorageJson('jk_fundi_profiles', fundiProfiles);
  };

  fundiFields.saveButton?.addEventListener('click', () => {
    persistFundiProfile();
    if (fundiFields.message) {
      fundiFields.message.textContent = 'Fundi professional profile saved.';
    }
  });

  fundiFields.addPortfolio?.addEventListener('click', () => {
    const fileInput = fundiFields.portfolioFile;
    if (!(fileInput instanceof HTMLInputElement) || !fileInput.files?.length) {
      if (fundiFields.message) fundiFields.message.textContent = 'Please choose a portfolio photo first.';
      return;
    }

    const file = fileInput.files[0];
    const caption = fundiFields.portfolioCaption?.value.trim() || '';
    const reader = new FileReader();

    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : '';
      if (!src) return;

      fundiProfile.portfolio = [
        { src, caption: caption || 'Completed project' },
        ...(fundiProfile.portfolio || [])
      ].slice(0, 8);

      persistFundiProfile();
      renderPortfolio();

      fileInput.value = '';
      if (fundiFields.portfolioCaption) fundiFields.portfolioCaption.value = '';
      if (fundiFields.message) fundiFields.message.textContent = 'Portfolio photo added.';
    };

    reader.readAsDataURL(file);
  });

  fundiFields.portfolioList?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const indexText = target.getAttribute('data-remove-portfolio');
    if (indexText == null) return;

    const index = Number(indexText);
    if (Number.isNaN(index)) return;

    fundiProfile.portfolio = (fundiProfile.portfolio || []).filter((_, i) => i !== index);
    persistFundiProfile();
    renderPortfolio();

    if (fundiFields.message) fundiFields.message.textContent = 'Portfolio photo removed.';
  });

  renderPortfolio();
}

function initFundiLeadsSection(page, account) {
  const leadsRoot = page.querySelector('[data-fundi-leads]');
  if (!leadsRoot) return;

  const list = leadsRoot.querySelector('[data-fundi-leads-list]');
  const summary = leadsRoot.querySelector('[data-fundi-leads-summary]');
  const message = leadsRoot.querySelector('[data-fundi-lead-message]');
  const quoteForm = leadsRoot.querySelector('[data-fundi-quote-form]');
  const quoteTarget = leadsRoot.querySelector('[data-fundi-quote-target]');
  const quoteAmount = leadsRoot.querySelector('[data-fundi-quote-amount]');
  const quoteTimeline = leadsRoot.querySelector('[data-fundi-quote-timeline]');
  const quoteNotes = leadsRoot.querySelector('[data-fundi-quote-notes]');
  const quoteLeadId = leadsRoot.querySelector('[data-fundi-quote-lead-id]');
  const quoteCancel = leadsRoot.querySelector('[data-fundi-quote-cancel]');

  if (
    !list ||
    !summary ||
    !message ||
    !quoteForm ||
    !quoteTarget ||
    !quoteAmount ||
    !quoteTimeline ||
    !quoteNotes ||
    !quoteLeadId ||
    !quoteCancel
  ) {
    return;
  }

  const leadsKey = 'jk_fundi_leads';
  const locationHint = account.location || 'Nairobi';

  const escapeHtml = (value) =>
    String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const seedLeads = [
    {
      id: 'lead-1001',
      clientName: 'Mercy Wanjiku',
      service: 'Kitchen cabinet repair',
      location: locationHint,
      budget: 6500,
      urgency: 'Today',
      status: 'new'
    },
    {
      id: 'lead-1002',
      clientName: 'Allan Kiptoo',
      service: 'Gate welding and reinforcement',
      location: 'Kiambu',
      budget: 12000,
      urgency: 'This week',
      status: 'new'
    },
    {
      id: 'lead-1003',
      clientName: 'Njeri Achieng',
      service: 'Bathroom plumbing leak fix',
      location: 'Nairobi',
      budget: 4000,
      urgency: 'Tomorrow',
      status: 'new'
    }
  ];

  const readLeads = () => {
    const stored = readStorageJson(leadsKey, []);
    if (Array.isArray(stored) && stored.length) return stored;
    writeStorageJson(leadsKey, seedLeads);
    return seedLeads;
  };

  let leads = readLeads();

  const getStatusLabel = (status) => {
    if (status === 'accepted') return 'Accepted';
    if (status === 'declined') return 'Declined';
    if (status === 'quoted') return 'Quoted';
    return 'New';
  };

  const render = () => {
    const newCount = leads.filter((lead) => lead.status === 'new').length;
    const activeCount = leads.filter(
      (lead) => lead.status === 'new' || lead.status === 'accepted' || lead.status === 'quoted'
    ).length;

    summary.textContent = `${newCount} new leads, ${activeCount} active conversations.`;

    list.innerHTML = leads
      .map((lead) => {
        const hasQuote = Boolean(lead.quote);
        const quotePreview = hasQuote
          ? `<p class="fundi-lead-quote"><strong>Quote:</strong> KES ${Number(
              lead.quote.amount || 0
            ).toLocaleString()} | ${escapeHtml(lead.quote.timeline || '')}</p>`
          : '';

        return `
          <article class="fundi-lead-item" data-fundi-lead-card="${escapeHtml(lead.id)}">
            <div class="fundi-lead-head">
              <h3>${escapeHtml(lead.service)}</h3>
              <span class="fundi-lead-status is-${escapeHtml(lead.status)}">${getStatusLabel(
          lead.status
        )}</span>
            </div>
            <p><strong>Client:</strong> ${escapeHtml(lead.clientName)}</p>
            <p><strong>Location:</strong> ${escapeHtml(lead.location)}</p>
            <p><strong>Budget:</strong> KES ${Number(lead.budget || 0).toLocaleString()}</p>
            <p><strong>Urgency:</strong> ${escapeHtml(lead.urgency)}</p>
            ${quotePreview}
            <div class="fundi-lead-actions">
              <button type="button" data-fundi-lead-action="accept" data-fundi-lead-id="${escapeHtml(
                lead.id
              )}">Accept</button>
              <button type="button" data-fundi-lead-action="decline" data-fundi-lead-id="${escapeHtml(
                lead.id
              )}">Decline</button>
              <button type="button" data-fundi-lead-action="quote" data-fundi-lead-id="${escapeHtml(
                lead.id
              )}">Send Quote</button>
            </div>
          </article>
        `;
      })
      .join('');
  };

  const persist = () => {
    writeStorageJson(leadsKey, leads);
    render();
  };

  const openQuoteForm = (lead) => {
    quoteLeadId.value = lead.id;
    quoteTarget.textContent = `Preparing quote for ${lead.clientName} (${lead.service})`;
    quoteAmount.value = lead.quote?.amount || '';
    quoteTimeline.value = lead.quote?.timeline || '';
    quoteNotes.value = lead.quote?.notes || '';
    quoteForm.hidden = false;
    message.textContent = '';
    quoteAmount.focus();
  };

  const closeQuoteForm = () => {
    quoteForm.hidden = true;
    quoteForm.reset();
    quoteLeadId.value = '';
    quoteTarget.textContent = '';
  };

  list.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches('[data-fundi-lead-action]')) return;

    const leadId = target.getAttribute('data-fundi-lead-id') || '';
    const action = target.getAttribute('data-fundi-lead-action') || '';
    const index = leads.findIndex((lead) => lead.id === leadId);
    if (index < 0) return;

    if (action === 'accept') {
      leads[index].status = 'accepted';
      message.textContent = `Lead accepted: ${leads[index].service}.`;
      persist();
      return;
    }

    if (action === 'decline') {
      leads[index].status = 'declined';
      message.textContent = `Lead declined: ${leads[index].service}.`;
      persist();
      return;
    }

    if (action === 'quote') {
      openQuoteForm(leads[index]);
    }
  });

  quoteCancel.addEventListener('click', () => {
    closeQuoteForm();
    message.textContent = 'Quote draft cancelled.';
  });

  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const leadId = quoteLeadId.value;
    const amount = Number(quoteAmount.value || 0);
    const timeline = quoteTimeline.value.trim();
    const notes = quoteNotes.value.trim();

    if (!leadId || amount <= 0 || !timeline) {
      message.textContent = 'Enter quote amount and timeline before sending.';
      return;
    }

    const index = leads.findIndex((lead) => lead.id === leadId);
    if (index < 0) {
      message.textContent = 'Selected lead was not found.';
      return;
    }

    leads[index].status = 'quoted';
    leads[index].quote = {
      amount,
      timeline,
      notes,
      sentAt: new Date().toISOString()
    };

    persist();
    closeQuoteForm();
    message.textContent = `Quote sent to ${leads[index].clientName}.`;
  });

  render();
}
function initRevealAnimation() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const revealNow = () => {
    reveals.forEach((el) => el.classList.add('is-visible'));
  };

  if (!('IntersectionObserver' in window)) {
    revealNow();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  reveals.forEach((el) => observer.observe(el));
}

function initHeroHeadlineAssembly() {
  const headings = document.querySelectorAll('[data-hero-headline]');
  if (!headings.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  headings.forEach((heading) => {
    const text = heading.textContent.trim();
    if (!text) return;

    const words = text.split(/\s+/);
    heading.textContent = '';
    heading.setAttribute('aria-label', text);
    heading.classList.add('is-prepared');

    words.forEach((word, index) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'hero-word';
      wordSpan.textContent = word;

      if (!prefersReducedMotion) {
        wordSpan.style.animationDelay = `${index * 90}ms`;
      }

      heading.appendChild(wordSpan);
    });

    if (prefersReducedMotion) {
      heading.classList.remove('is-prepared');
      return;
    }

    const startAnimation = () => {
      heading.classList.add('is-animating');
    };

    if (!('IntersectionObserver' in window)) {
      window.requestAnimationFrame(startAnimation);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        startAnimation();
        observer.disconnect();
      },
      {
        threshold: 0.55
      }
    );

    observer.observe(heading);
  });
}

function initTrustMetricsTypewriter() {
  const section = document.querySelector('.trust-metrics');
  const values = document.querySelectorAll('[data-metric-value]');
  if (!section || !values.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timers = new Set();
  const rafs = new Set();
  const animationMs = 1400;
  let hasAnimatedInView = false;

  const clearTimers = () => {
    timers.forEach((timerId) => window.clearTimeout(timerId));
    timers.clear();

    rafs.forEach((frameId) => window.cancelAnimationFrame(frameId));
    rafs.clear();
  };

  const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

  const formatMetricValue = (valueEl, count) => {
    const suffix = valueEl.dataset.metricSuffix || '';
    return `${Math.round(count).toLocaleString()}${suffix}`;
  };

  const resetValues = () => {
    clearTimers();

    values.forEach((valueEl) => {
      valueEl.classList.remove('is-active');
      valueEl.closest('.metric-card')?.classList.remove('is-active');
      valueEl.textContent = prefersReducedMotion ? valueEl.dataset.metricValue || '' : '';
    });
  };

  const animateMetric = (valueEl, startDelay) => {
    const beginTimer = window.setTimeout(() => {
      const targetCount = Number(valueEl.dataset.metricCount || 0);
      const card = valueEl.closest('.metric-card');
      const startTime = performance.now();

      valueEl.classList.add('is-active');
      card?.classList.add('is-active');

      const render = (now) => {
        const progress = Math.min((now - startTime) / animationMs, 1);
        const easedProgress = easeOutCubic(progress);
        const currentCount = targetCount * easedProgress;
        valueEl.textContent = formatMetricValue(valueEl, currentCount);

        if (progress < 1) {
          const frameId = window.requestAnimationFrame(render);
          rafs.add(frameId);
          return;
        }

        valueEl.textContent = valueEl.dataset.metricValue || formatMetricValue(valueEl, targetCount);

        const finishTimer = window.setTimeout(() => {
          valueEl.classList.remove('is-active');
          card?.classList.remove('is-active');
        }, 260);

        timers.add(finishTimer);
      };

      const frameId = window.requestAnimationFrame(render);
      rafs.add(frameId);
    }, startDelay);

    timers.add(beginTimer);
  };

  const playAnimation = () => {
    clearTimers();

    values.forEach((valueEl, index) => {
      valueEl.textContent = '';
      animateMetric(valueEl, index * 180);
    });
  };

  if (prefersReducedMotion) {
    resetValues();
    return;
  }

  resetValues();

  if (!('IntersectionObserver' in window)) {
    playAnimation();
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!hasAnimatedInView) {
          hasAnimatedInView = true;
          playAnimation();
        }
        return;
      }

      hasAnimatedInView = false;
      resetValues();
    },
    {
      threshold: 0.45
    }
  );

  observer.observe(section);
}

function initAboutFeaturesInteractivity() {
  const section = document.querySelector('.about-features');
  if (!section) return;

  const cards = Array.from(section.querySelectorAll('.feature-card'));
  const expandableCards = Array.from(section.querySelectorAll('[data-expand-card]'));
  const stepItems = Array.from(section.querySelectorAll('[data-step-item]'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!cards.length) return;

  const showCards = () => {
    cards.forEach((card, index) => {
      const delay = prefersReducedMotion ? 0 : index * 120;
      window.setTimeout(() => card.classList.add('is-visible'), delay);
    });
  };

  const updateInViewState = (isInView) => {
    section.classList.toggle('is-in-view', isInView);
  };

  if (prefersReducedMotion) {
    updateInViewState(false);
  } else if ('IntersectionObserver' in window) {
    const presenceObserver = new IntersectionObserver(
      ([entry]) => {
        updateInViewState(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    presenceObserver.observe(section);
  }

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    showCards();
  } else {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        showCards();
        observer.disconnect();
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
  }

  const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const collapseExpandableCards = () => {
    expandableCards.forEach((card) => card.classList.remove('is-expanded'));
  };

  expandableCards.forEach((card) => {
    card.addEventListener('click', () => {
      if (!coarsePointer) return;
      const shouldExpand = !card.classList.contains('is-expanded');
      collapseExpandableCards();
      if (shouldExpand) card.classList.add('is-expanded');
    });

    card.addEventListener('mouseenter', () => {
      if (coarsePointer) return;
      card.classList.add('is-expanded');
    });

    card.addEventListener('mouseleave', () => {
      if (coarsePointer) return;
      card.classList.remove('is-expanded');
    });

    card.addEventListener('focusin', () => {
      card.classList.add('is-expanded');
    });

    card.addEventListener('focusout', (event) => {
      if (card.contains(event.relatedTarget)) return;
      if (!coarsePointer) card.classList.remove('is-expanded');
    });

    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      const shouldExpand = !card.classList.contains('is-expanded');
      collapseExpandableCards();
      if (shouldExpand) card.classList.add('is-expanded');
    });
  });

  if (!stepItems.length) return;

  const setActiveStep = (stepToActivate) => {
    stepItems.forEach((stepItem) => {
      stepItem.classList.toggle('is-active', stepItem === stepToActivate);
    });
  };

  setActiveStep(stepItems[0]);

  stepItems.forEach((stepItem) => {
    stepItem.addEventListener('mouseenter', () => setActiveStep(stepItem));
    stepItem.addEventListener('focusin', () => setActiveStep(stepItem));
    stepItem.addEventListener('click', () => setActiveStep(stepItem));

    stepItem.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      setActiveStep(stepItem);
    });
  });
}

function initHomeSearchRedirect() {
  const searchForm = document.querySelector('[data-job-search-form]');
  const searchInput = document.getElementById('job-search-input');
  if (!searchForm || !searchInput) return;

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();
    const targetUrl = new URL('hireworkers.html', window.location.href);

    if (query) {
      targetUrl.searchParams.set('q', query);
    }

    window.location.href = targetUrl.toString();
  });
}

function initHomeCtaActions() {
  const postJobButton = document.querySelector('[data-home-post-job]');
  const createFundiButton = document.querySelector('[data-home-create-fundi]');

  if (postJobButton) {
    postJobButton.addEventListener('click', () => {
      const targetUrl = new URL('hireworkers.html', window.location.href);
      window.location.href = targetUrl.toString();
    });
  }

  if (createFundiButton) {
    createFundiButton.addEventListener('click', () => {
      const currentUser = readStorageJson('jk_current_user', null);

      if (currentUser?.role === 'fundi') {
        window.location.href = 'fundi-dashboard.html';
        return;
      }

      if (typeof window.__jkOpenAuthModal === 'function') {
        window.__jkOpenAuthModal('signup', 'fundi');
      } else {
        const targetUrl = new URL('hireworkers.html', window.location.href);
        targetUrl.hash = 'fundi-onboarding';
        window.location.href = targetUrl.toString();
      }
    });
  }
}

const SERVICE_LABEL_MAP = {
  'plumber,electrician': 'Plumbing & Electrical Repair',
  'painter': 'Painting',
  'house cleaner': 'House Cleaning',
  'welder': 'Welding',
  'carpenter': 'Carpentry',
  'carpentry': 'Carpentry',
  'mechanic': 'Mechanics',
  'electronics repair': 'Appliances Repair',
  'tailoring': 'Tailoring',
  'masonry': 'Masonry',
};

function expandSearchTerm(term) {
  const key = normalizeKey(term);
  const aliases = {
    carpenter: ['carpenter', 'carpentry', 'woodwork'],
    carpentry: ['carpentry', 'carpenter', 'woodwork'],
    plumber: ['plumber', 'plumbing'],
    plumbing: ['plumbing', 'plumber'],
    electrician: ['electrician', 'electrical'],
    electrical: ['electrical', 'electrician'],
    mechanic: ['mechanic', 'mechanics', 'motor vehicle mechanic'],
    mechanics: ['mechanics', 'mechanic', 'motor vehicle mechanic'],
    appliances: ['appliances', 'electronics repair'],
    appliance: ['appliance', 'electronics repair'],
    cleaning: ['cleaning', 'house cleaner'],
    cleaner: ['cleaner', 'house cleaner']
  };

  return aliases[key] || [key];
}

function initPopularServicesRedirect() {
  const serviceItems = Array.from(document.querySelectorAll('.Category-list .category-item'));
  if (!serviceItems.length) return;

  const navigateToService = (item) => {
    const query = (item.dataset.serviceQuery || item.textContent || '').trim();
    if (!query) return;

    const targetUrl = new URL('hireworkers.html', window.location.href);
    targetUrl.searchParams.set('q', query);
    window.location.href = targetUrl.toString();
  };

  serviceItems.forEach((item) => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');

    item.addEventListener('click', () => {
      navigateToService(item);
    });

    item.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      navigateToService(item);
    });
  });
}

function initServiceArrivalBadge() {
  const workerSection = document.querySelector('.workers');
  if (!workerSection) return;

  const rawQuery = new URLSearchParams(window.location.search).get('q') || '';
  const query = rawQuery.trim().toLowerCase();
  if (!query) return;

  const label = SERVICE_LABEL_MAP[query] || query
    .split(',')
    .map((t) => t.trim())
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(' & ');

  const badge = document.createElement('p');
  badge.className = 'service-badge';
  badge.setAttribute('role', 'status');
  badge.innerHTML = `
    <span>&#128269; Showing: <strong>${label}</strong></span>
    <button type="button" class="service-badge-clear" aria-label="Clear filter" title="Show all fundis">&times;</button>
  `;

  workerSection.insertAdjacentElement('beforebegin', badge);

  badge.querySelector('.service-badge-clear').addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    window.location.href = url.toString();
  });
}

function initHireWorkersSearchFilter() {
  const workerCards = document.querySelectorAll('.worker-card');
  if (!workerCards.length) return;

  const rawQuery = new URLSearchParams(window.location.search).get('q') || '';
  const query = rawQuery.trim().toLowerCase();
  const queryTerms = query
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean);
  const expandedTerms = queryTerms.length
    ? queryTerms.flatMap((term) => expandSearchTerm(term))
    : expandSearchTerm(query);
  const searchResults = document.querySelector('[data-search-results]');

  if (!query) {
    workerCards.forEach((card) => {
      card.dataset.searchMatch = 'true';
    });

    if (searchResults) {
      searchResults.textContent = 'Showing all fundis.';
    }
    document.dispatchEvent(new CustomEvent('jk:search-filter-updated'));
    return;
  }

  let totalMatches = 0;

  workerCards.forEach((card) => {
    const cardText = card.textContent.toLowerCase();
    const isMatch = expandedTerms.some((term) => cardText.includes(term));

    card.dataset.searchMatch = String(isMatch);
    card.style.display = isMatch ? '' : 'none';
    if (isMatch) totalMatches += 1;
  });

  if (!searchResults) return;

  if (totalMatches > 0) {
    const plural = totalMatches === 1 ? '' : 'es';
    searchResults.textContent = `Showing ${totalMatches} match${plural} for "${rawQuery}".`;
  } else {
    searchResults.textContent = `No fundi category matched "${rawQuery}". Try another search.`;
  }

  document.dispatchEvent(new CustomEvent('jk:search-filter-updated'));
}

function initWorkerRatings() {
  const ratingNodes = document.querySelectorAll('.worker-rating');
  if (!ratingNodes.length) return;

  ratingNodes.forEach((node) => {
    const match = node.textContent.match(/([0-9]+(?:\.[0-9]+)?)/);
    if (!match) return;

    const ratingValue = Number(match[1]);
    const roundedStars = Math.round(ratingValue);
    const stars = '★'.repeat(roundedStars) + '☆'.repeat(5 - roundedStars);

    node.textContent = '';

    const label = document.createElement('span');
    label.textContent = 'Rating: ';

    const starSpan = document.createElement('span');
    starSpan.className = 'worker-rating-stars';
    starSpan.setAttribute('aria-label', `${ratingValue.toFixed(1)} out of 5 stars`);
    starSpan.textContent = stars;

    const value = document.createElement('span');
    value.className = 'worker-rating-value';
    value.textContent = ` ${ratingValue.toFixed(1)}/5`;

    node.appendChild(label);
    node.appendChild(starSpan);
    node.appendChild(value);
  });
}

function initWorkerCardsMotion() {
  const cards = document.querySelectorAll('.worker-card');
  if (!cards.length) return;

  cards.forEach((card, index) => {
    if (card.classList.contains('worker-card-enter')) return;
    card.style.animationDelay = `${index * 60}ms`;
    card.classList.add('worker-card-enter');
  });
}

function initWorkerProfileModal() {
  const modal = document.querySelector('[data-profile-modal]');
  if (!modal) return;

  const showcaseBySkill = {
    welder: {
      rate: 'KES 1,500 - 6,000 per project',
      images: [
        'https://images.pexels.com/photos/33653237/pexels-photo-33653237.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/33653239/pexels-photo-33653239.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      captions: ['Steel gate fabrication — Nairobi Eastlands', 'Jua kali metalwork yard'],
      comments: ['Clean welding joints and delivered on time.', 'Very professional and fair pricing.']
    },
    tailoring: {
      rate: 'KES 800 - 4,500 per order',
      images: [
        'https://images.pexels.com/photos/12672102/pexels-photo-12672102.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/28038435/pexels-photo-28038435.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      captions: ['Uniform stitching — Gikomba market area', 'Custom kitenge dress alteration'],
      comments: ['Neat finishing and perfect fitting.', 'Fast turnaround for urgent orders.']
    },
    'electronics repair': {
      rate: 'KES 1,000 - 7,000 per repair',
      images: [
        'https://images.pexels.com/photos/19895841/pexels-photo-19895841.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/33694016/pexels-photo-33694016.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      captions: ['Mobile phone board repair — River Road', 'TV and appliance diagnostics'],
      comments: ['Explained the fault clearly before repair.', 'Device works perfectly now.']
    },
    electrician: {
      rate: 'KES 1,500 - 8,000 per task',
      images: [
        'https://images.pexels.com/photos/27928760/pexels-photo-27928760.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/34610700/pexels-photo-34610700.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      captions: ['House wiring upgrade — Ruiru estate', 'DB board installation'],
      comments: ['Safety-first approach and quality work.', 'Solved long-term power issues quickly.']
    },
    plumber: {
      rate: 'KES 1,200 - 7,500 per task',
      images: [
        'https://images.pexels.com/photos/32588548/pexels-photo-32588548.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/29226620/pexels-photo-29226620.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      captions: ['Pipe replacement — Kikuyu road flat', 'Bathroom fixture installation'],
      comments: ['No more leaks after service.', 'Punctual and very respectful.']
    },
    masonry: {
      rate: 'KES 2,000 - 12,000 per project',
      images: [
        'https://images.pexels.com/photos/33597033/pexels-photo-33597033.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/11321790/pexels-photo-11321790.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      captions: ['Stone perimeter wall — Thika Road plot', 'Concrete block laying and plastering'],
      comments: ['Strong and clean finishing work.', 'Great attention to alignment and detail.']
    },
    carpenter: {
      rate: 'KES 2,000 - 15,000 per project',
      images: [
        'https://images.pexels.com/photos/16368372/pexels-photo-16368372.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/16850251/pexels-photo-16850251.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      captions: ['Custom kitchen cabinets — Roysambu', 'Bed frame and wardrobe fitting'],
      comments: ['Excellent craftsmanship on cabinets.', 'Delivered exactly what we requested.']
    },
    'motor vehicle mechanic': {
      rate: 'KES 2,500 - 20,000 per job',
      images: [
        'https://images.pexels.com/photos/16773594/pexels-photo-16773594.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/12555012/pexels-photo-12555012.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      captions: ['Engine overhaul — Grogan Road garage', 'Matatu suspension and brake service'],
      comments: ['Car performance improved noticeably.', 'Honest diagnostics and updates.']
    },
    'house cleaner': {
      rate: 'KES 1,000 - 5,000 per session',
      images: [
        'https://images.pexels.com/photos/6196684/pexels-photo-6196684.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/6195106/pexels-photo-6195106.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      captions: ['Full house deep clean — Kilimani', 'Kitchen and bathroom sanitization'],
      comments: ['Very thorough and organized cleaning.', 'Arrived prepared and finished on time.']
    },
    painter: {
      rate: 'KES 1,800 - 10,000 per project',
      images: [
        'https://images.pexels.com/photos/36153946/pexels-photo-36153946.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/7218579/pexels-photo-7218579.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      captions: ['Interior wall painting — Westlands apartment', 'Exterior coat finishing — Kikuyu home'],
      comments: ['Smooth finish and good color guidance.', 'Clean work with no paint spills.']
    }
  };

  const closeButton = modal.querySelector('[data-profile-close]');
  const fields = {
    avatar: modal.querySelector('[data-profile-avatar]'),
    name: modal.querySelector('#profile-name'),
    skill: modal.querySelector('[data-profile-skill]'),
    location: modal.querySelector('[data-profile-location]'),
    phone: modal.querySelector('[data-profile-phone]'),
    phoneLink: modal.querySelector('[data-profile-phone-link]'),
    rating: modal.querySelector('[data-profile-rating]'),
    serviceRate: modal.querySelector('[data-profile-service-rate]'),
    experience: modal.querySelector('[data-profile-experience]'),
    availability: modal.querySelector('[data-profile-availability]'),
    bio: modal.querySelector('[data-profile-bio]'),
    estimate: modal.querySelector('[data-profile-estimate]'),
    localProof: modal.querySelector('[data-profile-local-proof]'),
    callLink: modal.querySelector('[data-profile-call]'),
    whatsappLink: modal.querySelector('[data-profile-whatsapp]'),
    quoteButton: modal.querySelector('[data-profile-request-quote]'),
    quoteFeedback: modal.querySelector('[data-profile-quote-feedback]'),
    gallery: modal.querySelector('[data-profile-gallery]'),
    comments: modal.querySelector('[data-profile-comments]')
  };

  const openModal = (card) => {
    const name = card.querySelector('h3')?.textContent.trim() || 'Fundi';
    const skillText = card.querySelector('p:nth-of-type(1)')?.textContent || '';
    const locationText = card.querySelector('p:nth-of-type(2)')?.textContent || '';
    const ratingText = card.querySelector('.worker-rating')?.textContent || '';
    const phone = card.dataset.phone || 'Not provided';
    const msisdn = toKenyanMsisdn(phone);
    const minRate = Number(card.dataset.rateMin || 0);
    const maxRate = Number(card.dataset.rateMax || 0);
    const skill = skillText.replace(/^Skill:\s*/i, '').trim().toLowerCase();
    const fundiProfiles = readStorageJson('jk_fundi_profiles', {});
    const customProfile = fundiProfiles[normalizeKey(name)] || null;
    const showcase = showcaseBySkill[skill] || {
      rate: 'Rate on request',
      images: [
        'https://images.pexels.com/photos/11321790/pexels-photo-11321790.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/19982408/pexels-photo-19982408.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      captions: ['Recent completed work', 'Another completed assignment'],
      comments: ['Great service and clear communication.', 'Professional and dependable.']
    };

    fields.name.textContent = name;
    fields.skill.textContent = skillText.replace(/^Skill:\s*/i, '');
    fields.location.textContent = locationText.replace(/^Location:\s*/i, '');
    fields.phone.textContent = phone;
    fields.phoneLink.href = `tel:${phone.replace(/\s+/g, '')}`;
    fields.rating.textContent = ratingText.replace(/^Rating:\s*/i, '');
    fields.serviceRate.textContent = customProfile?.serviceRate || showcase.rate;
    fields.experience.textContent = card.dataset.experience || 'Not specified';
    fields.availability.textContent = card.dataset.availability || 'Not specified';
    fields.bio.textContent = card.dataset.bio || 'No profile summary available.';
    fields.estimate.textContent =
      minRate > 0 && maxRate > 0 ? formatKesRange(minRate, maxRate) : customProfile?.serviceRate || showcase.rate;
    fields.localProof.textContent = `Recent jobs around ${fields.location.textContent} and nearby estates.`;
    if (fields.callLink) {
      fields.callLink.href = `tel:${phone.replace(/\s+/g, '')}`;
    }
    if (fields.whatsappLink) {
      fields.whatsappLink.href = msisdn
        ? `https://wa.me/${msisdn}?text=${encodeURIComponent(
            `Hi ${name}, I need a quote for ${fields.skill.textContent}.`
          )}`
        : '#';
    }
    if (fields.quoteFeedback) {
      fields.quoteFeedback.textContent = '';
    }

    const avatarSrc =
      customProfile?.photoDataUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=EA580C&color=fff`;
    fields.avatar.src = avatarSrc;

    const galleryItems = customProfile?.portfolio?.length
      ? customProfile.portfolio.map((item, index) => ({
          src: item.src,
          caption: item.caption || `Portfolio item ${index + 1}`
        }))
      : showcase.images.map((url, index) => ({
          src: url,
          caption: showcase.captions[index] || `Project ${index + 1}`
        }));

    fields.gallery.innerHTML = galleryItems
      .map(
        (item, index) => `
          <figure class="profile-work-item">
            <img src="${item.src}" alt="${fields.skill.textContent} project ${index + 1}" loading="lazy">
            <figcaption>${item.caption}</figcaption>
          </figure>
        `
      )
      .join('');

    fields.comments.innerHTML = showcase.comments
      .map(
        (comment) => `
          <article class="profile-comment-item">
            <p>"${comment}"</p>
          </article>
        `
      )
      .join('');

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches('[data-hire-button]')) return;

    const card = target.closest('.worker-card');
    if (card) openModal(card);
  });

  closeButton?.addEventListener('click', closeModal);

  fields.quoteButton?.addEventListener('click', () => {
    const currentName = fields.name?.textContent || 'this fundi';
    if (fields.quoteFeedback) {
      fields.quoteFeedback.textContent = `Quote request sent to ${currentName}. Expect labor + materials breakdown shortly.`;
    }
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });
}
