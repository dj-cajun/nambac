export const COPY_LINK_SUCCESS_MSG = 'Đã sao chép link!';
export const COPY_LINK_FAIL_MSG = 'Không sao chép được link. Thử lại nhé!';

/** Copy link and invoke showToast(message, 'success'|'error'). Returns whether copy succeeded. */
export async function copyShareLinkWithFeedback(text, showToast) {
  const ok = await copyShareLink(text);
  showToast(ok ? COPY_LINK_SUCCESS_MSG : COPY_LINK_FAIL_MSG, ok ? 'success' : 'error');
  return ok;
}

/** Copy text to clipboard; falls back to execCommand for older / non-secure contexts. */
export async function copyShareLink(text) {
  if (!text) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* try fallback */
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
