from flask import Flask, jsonify, request, render_template, send_from_directory
import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
NOTES_PATH = os.path.join(BASE_DIR, 'notes.json')

app = Flask(__name__, static_folder='static', template_folder='templates')


def load_notes():
	try:
		with open(NOTES_PATH, 'r', encoding='utf-8') as f:
			data = json.load(f)
			# normalize: if notes use 'category' string, convert to 'categories' list
			changed = False
			for n in data:
				if 'categories' not in n:
					if 'category' in n and isinstance(n.get('category'), str):
						cats = [c.strip() for c in n.get('category','').split(',') if c.strip()]
						n['categories'] = cats
						# remove legacy field
						del n['category']
						changed = True
					else:
						n['categories'] = []
			if changed:
				# persist normalization back to file
				save_notes(data)
			return data
	except Exception:
		return []


def save_notes(notes):
	with open(NOTES_PATH, 'w', encoding='utf-8') as f:
		json.dump(notes, f, ensure_ascii=False, indent=2)


@app.route('/')
def index():
	return render_template('index.html')


@app.route('/api/notes', methods=['GET'])
def get_notes():
	notes = load_notes()
	return jsonify(notes)


@app.route('/api/notes', methods=['POST'])
def add_note():
	data = request.get_json()
	if not data or 'title' not in data:
		return jsonify({'error': 'Invalid payload'}), 400

	notes = load_notes()
	# accept either 'categories' (array) or legacy 'category' (string)
	cats = []
	if 'categories' in data and isinstance(data.get('categories'), list):
		cats = [c for c in data.get('categories') if isinstance(c, str) and c.strip()]
	elif 'category' in data and isinstance(data.get('category'), str):
		cats = [c.strip() for c in data.get('category','').split(',') if c.strip()]
	if not cats:
		cats = ['Uncategorized']

	note = {
		'id': int(datetime.utcnow().timestamp() * 1000),
		'title': data.get('title', ''),
		'content': data.get('content', ''),
		'topics': data.get('topics', []),
		'categories': cats,
		'created_at': datetime.utcnow().isoformat() + 'Z'
	}
	notes.insert(0, note)
	save_notes(notes)
	return jsonify(note), 201


@app.route('/api/categories', methods=['GET'])
def categories():
	notes = load_notes()
	# count category usage across notes (notes may have multiple categories)
	cats = {}
	for n in notes:
		# support new 'categories' array or legacy 'category' string
		if 'categories' in n and isinstance(n['categories'], list):
			for c in n['categories']:
				if not c: continue
				cats[c] = cats.get(c, 0) + 1
		else:
			c = n.get('category', 'Uncategorized')
			cats[c] = cats.get(c, 0) + 1
	return jsonify([{'name': k, 'count': v} for k, v in cats.items()])


@app.route('/api/notes/<int:note_id>', methods=['GET'])
def get_note(note_id):
	notes = load_notes()
	for n in notes:
		if n.get('id') == note_id:
			return jsonify(n)
	return jsonify({'error': 'Not found'}), 404


@app.route('/api/notes/<int:note_id>', methods=['PATCH'])
def patch_note(note_id):
	data = request.get_json() or {}
	notes = load_notes()
	for i, n in enumerate(notes):
		if n.get('id') == note_id:
			# allow updating topics and content and category/title
			if 'topics' in data:
				n['topics'] = data['topics']
			if 'content' in data:
				n['content'] = data['content']
			if 'title' in data:
				n['title'] = data['title']
			# accept either 'categories' array or legacy 'category' string
			if 'categories' in data and isinstance(data.get('categories'), list):
				n['categories'] = [c for c in data.get('categories') if isinstance(c, str) and c.strip()]
			elif 'category' in data and isinstance(data.get('category'), str):
				n['categories'] = [c.strip() for c in data.get('category','').split(',') if c.strip()]
			notes[i] = n
			save_notes(notes)
			return jsonify(n)
	return jsonify({'error': 'Not found'}), 404


@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
	notes = load_notes()
	for i, n in enumerate(notes):
		if n.get('id') == note_id:
			notes.pop(i)
			save_notes(notes)
			return jsonify({'deleted': note_id})
	return jsonify({'error': 'Not found'}), 404


@app.route('/notes/new')
def new_note_page():
	return render_template('new.html')


@app.route('/notes/<int:note_id>')
def note_page(note_id):
	# render a dedicated detail page; JS will fetch the note via API
	return render_template('detail.html', note_id=note_id)


if __name__ == '__main__':
	app.run(debug=True, port=5000)
