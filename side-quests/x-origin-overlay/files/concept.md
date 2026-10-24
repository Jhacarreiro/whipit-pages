# Account context without opening every profile

Reconstructed concept brief · 2025-11-23

An English reconstruction of the original feature request and its unresolved dependency.

## The problem

The account-origin information shown on X required opening each account's About view. The proposed extension would put that same context beside the account name in the feed or on an individual post.

## The proposed flow

1. Find an account in the visible feed.
2. Resolve the origin information that X itself supplies for that account.
3. Cache the result so repeated posts do not trigger repeated lookups.
4. Add a small badge beside the account name.

The draft explored a content script that watches for newly inserted posts, a lookup layer and a badge renderer. It also raised the need to avoid duplicate badges and excessive requests.

## The missing piece

The account-origin lookup was not implemented. The sample fell back to profile-location text, which is not the same information. That shortcut is excluded from the published code excerpt.

## Desktop first

The follow-up asked whether the idea could later reach Android and iOS. Mobile packaging was explored, but no mobile build was recovered. The starting artefact here is the browser-extension scaffold.
