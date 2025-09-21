const el = (sel) => document.querySelector(sel)
const els = (sel) => Array.from(document.querySelectorAll(sel))

const notesList = el('#notes-list')
const categoriesEl = el('#categories')
const mobileCategorySelect = el('#mobile-category-select')

let activeCategory = null

function pickColorFor(name){
  const palette = ['#ffefef','#fff6e8','#fffcec','#f2fff0','#e8fbff','#eef4ff','#f7ecff']
  let hash = 0
  for(let i=0;i<name.length;i++) hash = (hash<<5) - hash + name.charCodeAt(i)
  return palette[Math.abs(hash) % palette.length]
}

function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

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

async function loadNotes(){
  const res = await fetch('/api/notes')
  const notes = await res.json()
  // cache notes on window for search/filtering
  window._notes_cache = notes
  renderNotes(notes)
}

function renderNotes(notes){
  notesList.innerHTML = ''
  const byCategory = activeCategory ? notes.filter(n=> (n.categories||[]).includes(activeCategory) ) : notes
  const filtered = byCategory
  filtered.forEach(n=>{
    const d = document.createElement('div')
    d.className = 'note'
  const categories = (n.categories && Array.isArray(n.categories) && n.categories.length) ? n.categories : (n.category? (n.category||'').split(/,\s*/).filter(Boolean) : ['Uncategorized'])
    const catHtml = categories.map(c=>`<span class="category-chip" style="background:${pickColorFor(c)}">${escapeHtml(c)}</span>`).join(' ')
  d.innerHTML = `<h4>${escapeHtml(n.title)}</h4><div class="meta">${catHtml} • ${formatDateUS(n.created_at)}</div><p>${escapeHtml(n.content||'')}</p>`
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
  allLi.addEventListener('click', ()=>{ activeCategory=null; setActiveCategory(null); loadNotes(); loadCategories(); })
  categoriesEl.appendChild(allLi)

  cats.forEach(c=>{
    const li = document.createElement('li')
    li.textContent = `${c.name} (${c.count})`
    if(c.name===activeCategory) li.classList.add('active')
    li.addEventListener('click', ()=>{ activeCategory=c.name; setActiveCategory(c.name); loadNotes(); loadCategories(); })
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
    loadNotes()
    loadCategories()
  })
}

// initial load
loadNotes(); loadCategories();
