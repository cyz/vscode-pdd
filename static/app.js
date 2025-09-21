const el = (sel) => document.querySelector(sel)
const els = (sel) => Array.from(document.querySelectorAll(sel))

const notesList = el('#notes-list')
const categoriesEl = el('#categories')
const mobileCategorySelect = el('#mobile-category-select')
const searchInput = el('#search')
const searchClear = el('#search-clear')

let activeCategory = null
let searchQuery = ''

function pickColorFor(name){
  const palette = ['#ffefef','#fff6e8','#fffcec','#f2fff0','#e8fbff','#eef4ff','#f7ecff']
  let hash = 0
  for(let i=0;i<name.length;i++) hash = (hash<<5) - hash + name.charCodeAt(i)
  return palette[Math.abs(hash) % palette.length]
}

function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

function highlightSearchTerm(text, query) {
  if (!query.trim() || !text) return escapeHtml(text)
  
  const escaped = escapeHtml(text)
  const regex = new RegExp(`(${escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return escaped.replace(regex, '<span class="search-highlight">$1</span>')
}

function formatDateUS(iso){
  try{
    const d = new Date(iso)
    const mm = String(d.getMonth()+1).padStart(2,'0')
    const dd = String(d.getDate()).padStart(2,'0')
    const yyyy = d.getFullYear()
    const time = d.toLocaleTimeString()
    return `${mm}/${dd}/${yyyy} ${time}`
  }catch(e){ return iso }
}

function filterNotes(notes) {
  let filtered = notes
  
  // Apply category filter
  if (activeCategory) {
    filtered = filtered.filter(n => (n.categories || []).includes(activeCategory))
  }
  
  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim()
    filtered = filtered.filter(n => {
      const title = (n.title || '').toLowerCase()
      const content = (n.content || '').toLowerCase()
      const categories = (n.categories || []).join(' ').toLowerCase()
      
      return title.includes(query) || 
             content.includes(query) || 
             categories.includes(query)
    })
  }
  
  return filtered
}

async function loadNotes(){
  const res = await fetch('/api/notes')
  const notes = await res.json()
  // cache notes on window for search/filtering
  window._notes_cache = notes
  renderNotes()
}

function renderNotes(){
  if (!window._notes_cache) return
  
  notesList.innerHTML = ''
  const filtered = filterNotes(window._notes_cache)
  filtered.forEach(n=>{
    const d = document.createElement('div')
    d.className = 'note'
    const categories = (n.categories && Array.isArray(n.categories) && n.categories.length) ? n.categories : (n.category? (n.category||'').split(/,\s*/).filter(Boolean) : ['Uncategorized'])
    
    // Apply search highlighting if there's a search query
    const highlightedTitle = searchQuery.trim() ? highlightSearchTerm(n.title, searchQuery) : escapeHtml(n.title)
    const highlightedContent = searchQuery.trim() ? highlightSearchTerm(n.content || '', searchQuery) : escapeHtml(n.content || '')
    const catHtml = categories.map(c => {
      const highlightedCat = searchQuery.trim() ? highlightSearchTerm(c, searchQuery) : escapeHtml(c)
      return `<span class="category-chip" style="background:${pickColorFor(c)}">${highlightedCat}</span>`
    }).join(' ')
    
    d.innerHTML = `<h4>${highlightedTitle}</h4><div class="meta">${catHtml} • ${formatDateUS(n.created_at)}</div><p>${highlightedContent}</p>`
  // pick background color based on title
  d.style.background = pickColorFor(n.title || String(n.id))
  d.style.color = '#1f2937'
    d.style.cursor = 'pointer'
    d.addEventListener('click', ()=> { window.location.href = `/notes/${n.id}` })
    // action button + small dropdown menu (three-dot kebab) to keep UI minimal
    const actionsWrap = document.createElement('div')
    actionsWrap.className = 'note-actions'

    const actionBtn = document.createElement('button')
    actionBtn.className = 'note-action-btn'
    actionBtn.setAttribute('aria-label', `Actions for ${n.title}`)
    actionBtn.textContent = '⋯'
    // stop propagation so clicking the button doesn't open the note
    actionBtn.addEventListener('click', (ev)=>{
      ev.stopPropagation()
      // toggle menu open state
      menu.classList.toggle('open')
    })

    const menu = document.createElement('div')
    menu.className = 'note-menu'
    const delItem = document.createElement('button')
    delItem.className = 'note-menu-item'
    delItem.textContent = 'Delete'
    delItem.addEventListener('click', async (ev)=>{
      ev.stopPropagation()
      if(!confirm(`Delete note "${n.title}"?`)) return
      try{
        const res = await fetch(`/api/notes/${n.id}`, { method: 'DELETE' })
        if(res.ok){
          await loadNotes()
          await loadCategories()
        }else{
          const js = await res.json()
          alert('Delete failed: ' + (js.error||res.statusText))
        }
      }catch(err){
        alert('Delete error: ' + err)
      }
    })
    menu.appendChild(delItem)

    actionsWrap.appendChild(actionBtn)
    actionsWrap.appendChild(menu)
    d.appendChild(actionsWrap)

    // close open menus when clicking outside
    if(!window._note_menu_handler_installed){
      window._note_menu_handler_installed = true
      document.addEventListener('click', ()=>{
        document.querySelectorAll('.note-menu.open').forEach(m=>m.classList.remove('open'))
      })
    }
    if(n.topics && n.topics.length){
      const ul = document.createElement('ul')
      ul.className = 'topics'
      n.topics.forEach(t=>{
        const li = document.createElement('li')
        li.textContent = (t.done? '☑︎ ': '☐ ') + t.text
        ul.appendChild(li)
      })
      d.appendChild(ul)
    }
    notesList.appendChild(d)
  })
}

async function loadCategories(){
  const res = await fetch('/api/categories')
  const cats = await res.json()
  categoriesEl.innerHTML = ''
  
  // Populate mobile dropdown
  if (mobileCategorySelect) {
    mobileCategorySelect.innerHTML = ''
    const allOption = document.createElement('option')
    allOption.value = ''
    allOption.textContent = 'All Categories'
    if (!activeCategory) allOption.selected = true
    mobileCategorySelect.appendChild(allOption)
  }
  
  // Corrige: mostra o total de notas em 'All'
  const notes = window._notes_cache || [];
  const allLi = document.createElement('li')
  allLi.textContent = `All (${notes.length})`
  allLi.className = activeCategory? '': 'active'
  allLi.addEventListener('click', ()=>{ activeCategory=null; setActiveCategory(null); renderNotes(); loadCategories(); })
  categoriesEl.appendChild(allLi)

  cats.forEach(c=>{
    const li = document.createElement('li')
    li.textContent = `${c.name} (${c.count})`
    if(c.name===activeCategory) li.classList.add('active')
    li.addEventListener('click', ()=>{ activeCategory=c.name; setActiveCategory(c.name); renderNotes(); loadCategories(); })
    categoriesEl.appendChild(li)
    
    // Add to mobile dropdown
    if (mobileCategorySelect) {
      const option = document.createElement('option')
      option.value = c.name
      option.textContent = `${c.name} (${c.count})`
      if (c.name === activeCategory) option.selected = true
      mobileCategorySelect.appendChild(option)
    }
  })
}

function setActiveCategory(name){
  els('#categories li').forEach(li=>{
    if(name && li.textContent.startsWith(name)) li.classList.add('active')
    else if(!name && li.textContent.startsWith('All')) li.classList.add('active')
    else li.classList.remove('active')
  })
}

// Mobile category dropdown handler
if (mobileCategorySelect) {
  mobileCategorySelect.addEventListener('change', (e) => {
    const selectedCategory = e.target.value
    activeCategory = selectedCategory || null
    setActiveCategory(activeCategory)
    renderNotes()
    loadCategories()
  })
}

// Real-time search functionality
if (searchInput) {
  function handleSearchChange() {
    searchQuery = searchInput.value
    renderNotes()
    updateSearchResults()
    
    // Show/hide clear button
    if (searchClear) {
      searchClear.style.display = searchQuery.trim() ? 'flex' : 'none'
    }
  }
  
  // Use input event for real-time search as user types
  searchInput.addEventListener('input', handleSearchChange)
  
  // Also handle paste events
  searchInput.addEventListener('paste', (e) => {
    // Small delay to let the paste complete
    setTimeout(handleSearchChange, 10)
  })
  
  // Clear search when escape is pressed
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      clearSearch()
    }
  })
}

// Clear search functionality
function clearSearch() {
  if (searchInput) {
    searchInput.value = ''
  }
  searchQuery = ''
  renderNotes()
  updateSearchResults()
  
  if (searchClear) {
    searchClear.style.display = 'none'
  }
  
  if (searchInput) {
    searchInput.focus()
  }
}

if (searchClear) {
  searchClear.addEventListener('click', clearSearch)
}

function updateSearchResults() {
  const totalNotes = window._notes_cache ? window._notes_cache.length : 0
  const filteredNotes = window._notes_cache ? filterNotes(window._notes_cache) : []
  const hasSearch = searchQuery.trim().length > 0
  const hasCategory = activeCategory !== null
  
  // Update the notes section header to show search results
  const notesSectionHeader = el('.notes-section h3')
  if (notesSectionHeader) {
    if (hasSearch && hasCategory) {
      notesSectionHeader.textContent = `Search "${searchQuery}" in ${activeCategory} (${filteredNotes.length} results)`
    } else if (hasSearch) {
      notesSectionHeader.textContent = `Search "${searchQuery}" (${filteredNotes.length} results)`
    } else if (hasCategory) {
      notesSectionHeader.textContent = `${activeCategory} (${filteredNotes.length} notes)`
    } else {
      notesSectionHeader.textContent = 'NoteBoard'
    }
  }
  
  // Show "no results" message if needed
  if (filteredNotes.length === 0 && (hasSearch || hasCategory)) {
    if (!el('.no-results-message')) {
      const noResultsMsg = document.createElement('div')
      noResultsMsg.className = 'no-results-message'
      noResultsMsg.innerHTML = `
        <p>No notes found${hasSearch ? ` for "${searchQuery}"` : ''}${hasCategory ? ` in category "${activeCategory}"` : ''}.</p>
        <p>Try adjusting your search terms or category filter.</p>
      `
      notesList.appendChild(noResultsMsg)
    }
  } else {
    // Remove no results message if it exists
    const existingMsg = el('.no-results-message')
    if (existingMsg) {
      existingMsg.remove()
    }
  }
}

// initial load
loadNotes(); loadCategories();
