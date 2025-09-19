const eln = (s)=> document.querySelector(s)
const elsn = (s)=> Array.from(document.querySelectorAll(s))

const categoryTagsWrap = eln('#category-tags')
const categoryInput = eln('#note-category')
const categorySuggestions = document.createElement('div')
categorySuggestions.className = 'category-suggestions'
categoryInput.parentNode && categoryInput.parentNode.insertBefore(categorySuggestions, categoryInput.nextSibling)
const topicsContainer = eln('#topics-container')
const addTopicBtn = eln('#add-topic')
const saveBtn = eln('#save-note')

function addCategoryTag(name){
  name = name.trim()
  if(!name) return
  // prevent duplicates
  const exists = Array.from(categoryTagsWrap.querySelectorAll('.chip')).some(c=>c.textContent === name)
  if(exists) return
  const chip = document.createElement('div')
  chip.className = 'chip'
  chip.style.background = pickColorFor(name)
  chip.innerHTML = `<span class="chip-label"></span><button class="chip-remove" aria-label="remove category">×</button>`
  chip.querySelector('.chip-label').textContent = name
  chip.querySelector('.chip-remove').addEventListener('click', ()=> chip.remove())
  categoryTagsWrap.appendChild(chip)
}

function pickColorFor(name){
  const palette = ['#ff7ab6', '#ffb07a', '#ffd76a', '#8bd37b', '#6dd3c7', '#7ab6ff', '#b38cff']
  let hash = 0
  for(let i=0;i<name.length;i++) hash = (hash<<5) - hash + name.charCodeAt(i)
  return palette[Math.abs(hash) % palette.length]
}

categoryInput.addEventListener('keydown', (e)=>{
  if(e.key==='Enter'){ e.preventDefault(); const v=categoryInput.value.trim(); if(v){ addCategoryTag(v); categoryInput.value=''; }}
})

// suggestions loading
async function loadCategorySuggestions(){
  try{
    const res = await fetch('/api/categories')
    if(!res.ok) return
    const cats = await res.json()
    categorySuggestions.innerHTML = ''
    cats.forEach(c=>{
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'suggestion'
      btn.textContent = c.name
      btn.addEventListener('click', ()=> addCategoryTag(c.name))
      categorySuggestions.appendChild(btn)
    })
  }catch(e){/* ignore */}
}
loadCategorySuggestions()

addTopicBtn.addEventListener('click', ()=>{
  const row = document.createElement('div')
  row.className = 'topic-row'
  row.innerHTML = `<input class="topic-input" placeholder="Topic description"><button class="remove-topic">-</button>`
  topicsContainer.appendChild(row)
})

topicsContainer.addEventListener('click',(e)=>{ if(e.target.classList.contains('remove-topic')) e.target.closest('.topic-row').remove() })
topicsContainer.addEventListener('keydown',(e)=>{
  if(e.key==='Enter' && e.target.classList.contains('topic-input')){
    e.preventDefault()
    const row=document.createElement('div')
    row.className='topic-row'
    row.innerHTML = `<input class="topic-input" placeholder="Topic description"><button class="remove-topic">-</button>`
    e.target.closest('.topic-row').after(row)
    row.querySelector('.topic-input').focus()
  }
})

saveBtn.addEventListener('click', async ()=>{
  const title = eln('#note-title').value || ''
  if(!title) return alert('Please add a title')
  const content = eln('#note-content').value || ''
  const chips = Array.from(categoryTagsWrap.querySelectorAll('.chip')).map(c=>c.querySelector('.chip-label').textContent)
  const categories = chips.length ? chips : (eln('#note-category').value ? [eln('#note-category').value] : ['Uncategorized'])
  // trim empty topic items
  const topics = elsn('.topic-input').map(i=>({text:i.value.trim(), done:false})).filter(t=>t.text.length>0)
  const res = await fetch('/api/notes',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title,content,categories,topics})})
  if(res.ok){ location.href='/' } else alert('Failed')
})
