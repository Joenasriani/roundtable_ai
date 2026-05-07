import React, { useEffect, useState } from 'react';

const TRIAL_TOKEN_STORAGE_KEY = 'roundtable_trial_tokens';
const DEFAULT_TRIAL_TOKENS = 1;
const PAYMENT_REQUIRED_MESSAGE = 'This analysis requires an active session. Please continue through PayPal.';
const TRIAL_FINISHED_MESSAGE = 'Your trial credits are finished. Choose a PayPal plan to continue.';

const getInitialTrialTokens = (): number => {
  if (typeof window === 'undefined') return DEFAULT_TRIAL_TOKENS;
  const stored = localStorage.getItem(TRIAL_TOKEN_STORAGE_KEY);
  if (stored === null) {
    localStorage.setItem(TRIAL_TOKEN_STORAGE_KEY, String(DEFAULT_TRIAL_TOKENS));
    return DEFAULT_TRIAL_TOKENS;
  }
  const parsed = Number.parseInt(stored, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_TRIAL_TOKENS;
};

const persistTrialTokens = (next: number) => {
  const normalized = Math.max(0, next);
  localStorage.setItem(TRIAL_TOKEN_STORAGE_KEY, String(normalized));
  window.dispatchEvent(new CustomEvent('roundtable-trial-tokens-updated', { detail: { trialTokens: normalized } }));
};

const scrollToPayment = () => {
  document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
};

const addPaymentMessage = (message: string) => {
  const inputSection = document.getElementById('input-section');
  if (!inputSection) return;

  const existing = document.getElementById('trial-payment-message');
  if (existing) {
    existing.textContent = message;
    return;
  }

  const alert = document.createElement('div');
  alert.id = 'trial-payment-message';
  alert.className = 'mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-medium';
  alert.textContent = message;
  inputSection.appendChild(alert);
};

const removeForbiddenProviderText = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const forbidden = 'The OpenRouter API key is invalid or quota-limited. Please provide a valid OpenRouter key.';
  const replacements: Text[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (node.nodeValue?.includes(forbidden)) {
      replacements.push(node);
    }
  }

  replacements.forEach(node => {
    node.nodeValue = node.nodeValue?.replace(forbidden, PAYMENT_REQUIRED_MESSAGE) ?? PAYMENT_REQUIRED_MESSAGE;
    scrollToPayment();
  });
};

export const TrialGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trialTokens, setTrialTokens] = useState(getInitialTrialTokens);

  useEffect(() => {
    persistTrialTokens(trialTokens);
  }, []);

  useEffect(() => {
    const handleTokenUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ trialTokens?: number }>).detail;
      const next = typeof detail?.trialTokens === 'number' ? detail.trialTokens : getInitialTrialTokens();
      setTrialTokens(next);
    };

    window.addEventListener('roundtable-trial-tokens-updated', handleTokenUpdate);
    return () => window.removeEventListener('roundtable-trial-tokens-updated', handleTokenUpdate);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest('button');
      if (!button) return;

      const isGenerateButton = Boolean(button.querySelector('svg')) && Boolean(document.getElementById('input-section')?.contains(button));
      if (!isGenerateButton) return;

      const latestTokens = getInitialTrialTokens();
      const hasCustomKey = localStorage.getItem('roundtable_use_custom_key') === 'true';
      const hasPaidSession = sessionStorage.getItem('roundtable_paid') === 'true';

      if (latestTokens <= 0 && !hasCustomKey && !hasPaidSession) {
        event.preventDefault();
        event.stopPropagation();
        addPaymentMessage(TRIAL_FINISHED_MESSAGE);
        scrollToPayment();
        return;
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(removeForbiddenProviderText);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    removeForbiddenProviderText();
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-indigo-100 bg-white/95 px-4 py-2 text-xs font-bold text-indigo-700 shadow-lg backdrop-blur">
        Trial credits remaining: {trialTokens}
      </div>
      {children}
    </>
  );
};
