# Independent manual review — 26 October 2026

This is a bounded, independent manual source review. It is **not** a completed formal `ce-code-review` receipt or production sign-off.

## Formal workflow status

The skill's scope helper selected its full pipeline (`hard_block_full: true`, 426 tracked executable changed lines). Untracked application modules were also inspected manually. The Windows `bash --version` probe failed with `Bash/Service/CreateInstance/E_ACCESSDENIED`. Git Bash exists, but its possible recovery route was not attempted: the primary explicitly limited the remaining work to local manual review and package preparation. The external Claude pass and the skill's persona/merge/validator/report pipeline were not run. No reviewed code was sent to an external CLI provider, no peer job was started, and no formal completion receipt is claimed.

## Actionable findings

No additional confirmed current-source defect was retained after the visibility fix below. This conclusion applies to the examined code, not to unverified product authority or the production host.

## Finding resolved during this review

The calculator mixed an inline `display: block` assignment for `cMEContainer` with `hidden = true`. The inline style could override the browser's default hidden presentation in guide mode. The primary removed that inline display assignment. The reviewed current `updateFeedingMode` owns the hidden state for both guide mode and cats; the conflicting display setter is absent.

## Coverage and checks

Read the current calculator/feeding flow, explicit catalogue links and validation, matcher eligibility, GA4 consent transport, worker fetch/cache boundaries, Apache configuration, archive builder, and focused test sources. The primary owns browser checks and the authoritative test/build runs.

An independent, read-only Node VM probe of the current modules returned zero catalogue issues, 31 validated source records, 168 supplied-guide cells, 355 g/day for the exact supplied Ancestral table cell (4 months, expected adult weight 40 kg), and 89 g/day for the unchanged adult estimate example (10 kg, ME 3997). These are implementation checks, not independent nutritional validation.

The archive builder uses explicit runtime roots, excludes repository/test/documentation directories, writes POSIX archive paths, assigns a content-derived worker cache name, and records file hashes. No application source, Git index, branch or commit was modified by this reviewer.

## Limits

- No independent external-model review was completed.
- No browser, real iOS/Android, Apache-host, deployment or Google event-receipt verification was performed by this reviewer.
- Product prices and nutritional authority were not re-certified. Existing supplier-SKU linkage gaps remain an owner/data-authority matter; no linkage was inferred from names.
- Aggregate analytics does not provide named learner attendance or certification records.

The result supports continuing local package verification. It does not remove the separate release checks documented by the primary.

## Final delta check

Reviewed the final breed-size selector and its calculator call, the `breedSize === 'maxi'` requirement for the Prime P0020 guide, declared pack-unit/gram consistency validation, the corrected conflicting-price fixture, the three-argument `calcPortion` interface and its only application caller, and the package source-path containment check. No additional actionable defect was retained.

A read-only probe confirmed that the Prime guide rejects both an omitted breed size and `medium`, while `maxi` resolves the exact 4-month/50-kg source cell to 540 g/day. The unchanged three-argument adult estimate still returns 89 g/day for the existing 10-kg/3997-ME example, and the current catalogue still reports zero issues.

The conflict fixture now changes the declared value and unit together with grams, so its data reaches the conflicting-price check rather than failing the preceding unit-consistency check. The package guard rejects runtime source files whose resolved paths leave the application root. Its escape-path rejection was inspected, not separately exercised by this reviewer. Formal-review and production-verification limitations above remain unchanged.
