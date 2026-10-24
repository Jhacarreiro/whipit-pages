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
