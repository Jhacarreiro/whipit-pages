# Manifest and badge-rendering sketch

Selected code excerpts · 2025-11-23

Historical scaffolding with the description translated into English. This is not an installable extension.

## Manifest draft

The proposed Manifest V3 file names the content script and a background worker. Those filenames describe the intended package; this excerpt does not supply a complete package.

```json
{
  "manifest_version": 3,
  "name": "X Origin Overlay",
  "version": "0.1",
  "description": "Display account-origin information beside posts in the X feed.",
  "permissions": ["scripting", "activeTab", "storage"],
  "host_permissions": ["https://x.com/*", "https://twitter.com/*"],
  "background": {"service_worker": "background.js"},
  "content_scripts": [{
    "matches": ["https://x.com/*", "https://twitter.com/*"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }]
}
```

## Badge renderer

This function assumes that a trustworthy origin value has already been resolved. It does not fetch or infer one.

```javascript
function injectBadge(article, origin) {
  const nameNode = article.querySelector('div[data-testid="User-Name"]')
  if (!nameNode) return
  const badge = document.createElement("span")
  badge.textContent = ` ${origin.flag} ${origin.code}`
  badge.style.marginLeft = "4px"
  badge.style.fontSize = "0.7rem"
  badge.style.opacity = "0.8"
  nameNode.appendChild(badge)
}
```

The original lookup mixed account-origin data with free-form profile location. It is left out here rather than presented as a working implementation. DOM selectors, permissions and packaging also remain historical, unvalidated choices.
