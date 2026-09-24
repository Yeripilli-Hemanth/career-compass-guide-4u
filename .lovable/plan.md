# Career catalogue quality fixes

## Scope
- Replace every current career description with a complete sentence under 120 characters and remove card clipping.
- Verify the header Guide link and both introductory guide links resolve to the two existing, fully written guide pages.
- Audit all listed careers for exactly four populated roadmap stages with skills; hide any incomplete career rather than expose an empty page.
- Add a subtle “High demand” tag only to AI Engineer, Data Analyst, and Cybersecurity Analyst cards.

## Technical details
- Update the career records in Lovable Cloud so the corrected descriptions are used consistently across cards, search, guides, and detail pages.
- Make the public careers query return only careers with four populated stages, so every grid and search entry uses the same readiness rule.
- Keep the existing layout and colors; limit presentation changes to description wrapping and the three demand tags.
- Verify all 23 detail pages and both guide links in the running site, then confirm the latest build is clean.
