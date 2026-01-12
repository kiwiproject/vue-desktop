# Pre-Commit & Pre-PR Checklist — Vue Desktop Library

---

## A. Development Rules
- [ ] No scope creep
- [ ] One prompt = one commit
- [ ] No unrelated refactors

---

## B. Build & Quality Gates
- [ ] pnpm build passes
- [ ] pnpm test passes
- [ ] pnpm lint passes
- [ ] pnpm format passes

---

## C. Type Safety
- [ ] No any in public APIs
- [ ] All exports documented

---

## D. Plugin Rules
- [ ] Plugins use only public APIs
- [ ] No core-plugin circular deps

---

## E. Final Review
- [ ] Clean diff
- [ ] Commit message correct
