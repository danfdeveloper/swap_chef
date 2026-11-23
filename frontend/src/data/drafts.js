/**
 * Local recipe drafts (browser storage).
 * The API has no draft endpoint yet, so unfinished create/edit forms are saved here.
 */

function storageKey(userId) {
  return `swapchef.drafts.v1.${userId ?? 'guest'}`
}

function readAll(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(userId, drafts) {
  localStorage.setItem(storageKey(userId), JSON.stringify(drafts))
}

/** @param {number|string|null|undefined} userId @param {'create'|string} draftKey */
export function getDraft(userId, draftKey) {
  return readAll(userId)[draftKey] ?? null
}

/** @param {number|string|null|undefined} userId @param {'create'|string} draftKey @param {object} payload */
export function saveDraft(userId, draftKey, payload) {
  const drafts = readAll(userId)
  drafts[draftKey] = {
    ...payload,
    savedAt: new Date().toISOString(),
  }
  writeAll(userId, drafts)
  return drafts[draftKey]
}

/** @param {number|string|null|undefined} userId @param {'create'|string} draftKey */
export function clearDraft(userId, draftKey) {
  const drafts = readAll(userId)
  if (!(draftKey in drafts)) return
  delete drafts[draftKey]
  writeAll(userId, drafts)
}

export function draftKeyForCreate() {
  return 'create'
}

/** @param {number|string} recipeId */
export function draftKeyForEdit(recipeId) {
  return `edit:${recipeId}`
}
