// Detail page script: loads a note and lets user edit title, content, categories (tags) and topics.
const el = (s)=> document.querySelector(s)
const els = (s)=> Array.from(document.querySelectorAll(s))

const detailTitle = el('#note-title')
const categoryTagsWrap = el('#category-tags')
const categoryInput = el('#note-category')
const categorySuggestions = document.createElement('div')
categorySuggestions.className = 'category-suggestions'
categoryInput.parentNode && categoryInput.parentNode.insertBefore(categorySuggestions, categoryInput.nextSibling)
const detailContent = el('#note-content')
const detailTopics = el('#note-topics')
const addTopicBtn = el('#add-topic')
const saveBtn = el('#save-note')

let currentNote = null

function pickColorFor(name){
  const palette = ['#ff7ab6', '#ffb07a', '#ffd76a', '#8bd37b', '#6dd3c7', '#7ab6ff', '#b38cff']
  let hash = 0
  for(let i=0;i<name.length;i++) hash = (hash<<5) - hash + name.charCodeAt(i)
  return palette[Math.abs(hash) % palette.length]
}

function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

function addCategoryChip(name){
  name = name.trim()
  if(!name) return
  const exists = Array.from(categoryTagsWrap.querySelectorAll('.chip')).some(c=>c.querySelector('.chip-label').textContent === name)
  if(exists) return
  const chip = document.createElement('div')
  chip.className = 'chip'
  chip.style.background = pickColorFor(name)
  chip.innerHTML = `<span class="chip-label"></span><button class="chip-remove" aria-label="remove category">×</button>`
  chip.querySelector('.chip-label').textContent = name
  chip.querySelector('.chip-remove').addEventListener('click', ()=> chip.remove())
  categoryTagsWrap.appendChild(chip)
}

categoryInput.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter'){
    e.preventDefault()
    const v = categoryInput.value.trim()
    if(!v) return
    addCategoryChip(v)
    categoryInput.value = ''
  }
})

// load suggestions
async function loadCategorySuggestions(){
  try{
    const res = await fetch('/api/categories')
    if(!res.ok) return
    const cats = await res.json()
    categorySuggestions.innerHTML = ''
    cats.forEach(c=>{
      const btn = document.createElement('button')
      btn.type='button'
      btn.className='suggestion'
      btn.textContent = c.name
      btn.addEventListener('click', ()=> addCategoryChip(c.name))
      categorySuggestions.appendChild(btn)
    })
  }catch(e){/* ignore */}
}
loadCategorySuggestions()

addTopicBtn.addEventListener('click', ()=>{
  const row = createDetailRow('', false)
  detailTopics.appendChild(row)
  row.querySelector('.text').focus()
})

detailTopics.addEventListener('click', (e)=>{
  if(e.target.classList.contains('remove-topic')){
    const r = e.target.closest('.detail-topic')
    if(r) r.remove()
  }
})

detailTopics.addEventListener('change', (e)=>{
  const cb = e.target
  if(!cb.matches('input[type="checkbox"]')) return
  const row = cb.closest('.detail-topic')
  if(cb.checked) row.classList.add('done')
  else row.classList.remove('done')
})

async function loadNote(){
  const res = await fetch(`/api/notes/${window.NOTE_ID}`)
  if(!res.ok) return alert('Failed to load note')
  const n = await res.json()
  currentNote = n
  // populate editable fields
  detailTitle.value = n.title || ''
  categoryTagsWrap.innerHTML = ''
  const cats = (n.categories && Array.isArray(n.categories)) ? n.categories : ((n.category||'').split(/,\s*/).filter(Boolean))
  cats.forEach(c=> addCategoryChip(c))
  categoryInput.value = ''
  detailContent.value = n.content || ''
  detailTopics.innerHTML = ''
  ;(n.topics||[]).forEach((t, idx)=>{
    const row = createDetailRow(t.text || '', !!t.done)
    // ensure checkbox state and text are set via DOM properties
    const cb = row.querySelector('input[type="checkbox"]')
    const txt = row.querySelector('.text')
    cb.checked = !!t.done
    if(cb.checked) row.classList.add('done')
    txt.value = t.text || ''
    detailTopics.appendChild(row)
  })
}

// helper to create a detail-topic row element
function createDetailRow(text, done){
  const row = document.createElement('div')
  row.className = 'detail-topic' + (done? ' done':'')
  row.innerHTML = `<input type="checkbox"><input class="text" value=""><button class="remove-topic">-</button>`
  if(done) row.querySelector('input[type="checkbox"]').checked = true
  if(text) row.querySelector('.text').value = text
  return row
}

// allow pressing Enter inside a checklist input to create a new checklist row
detailTopics.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' && e.target.classList.contains('text')){
    e.preventDefault()
    const curRow = e.target.closest('.detail-topic')
    const newRow = createDetailRow('', false)
    curRow.after(newRow)
    newRow.querySelector('.text').focus()
  }
})

saveBtn.addEventListener('click', async ()=>{
  const title = detailTitle.value.trim()
  if(!title) return alert('Please add a title')
  const content = detailContent.value
  const topics = Array.from(detailTopics.querySelectorAll('.detail-topic')).map(r=>{
    const cb = r.querySelector('input[type="checkbox"]')
    const txt = r.querySelector('.text').value || ''
    return {text: txt.trim(), done: !!cb.checked}
  }).filter(t=>t.text.length>0)
  // prefer sending 'categories' array
  const categories = Array.from(categoryTagsWrap.querySelectorAll('.chip')).map(c=>c.querySelector('.chip-label').textContent)
  const payload = {title, content, categories, topics}
  const res = await fetch(`/api/notes/${window.NOTE_ID}`, {method:'PATCH', headers:{'content-type':'application/json'}, body: JSON.stringify(payload)})
  if(res.ok) location.href='/'
  else alert('Failed to save')
})

loadNote()
