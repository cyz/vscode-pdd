# NoteBoard

<div align="center">
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4H18C19.1 4 20 4.9 20 6V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V6C4 4.9 4.9 4 6 4H8" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="9" y="2" width="6" height="4" rx="1" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</div>

A modern, responsive note-taking web application built with Flask. Organize your thoughts with categories, checklists, and powerful search capabilities.

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=flat-square)
![Flask](https://img.shields.io/badge/Flask-2.3.4-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

[Features](#features) • [Getting Started](#getting-started) • [Usage](#usage) • [API](#api) • [Development](#development)

## Overview

NoteBoard is a clean, intuitive note-taking application that helps you capture and organize your ideas efficiently. Built with modern web technologies, it offers a responsive design that works seamlessly across desktop, tablet, and mobile devices.

<div align="center">
  <img src="docs/screenshot.png" alt="NoteBoard interface" width="800px" />
</div>

## Features

- **📝 Rich Note Creation**: Create notes with titles, content, categories, and checklists
- **🔍 Real-Time Search**: Instantly search through notes by title, content, or categories with highlighted results
- **🏷️ Category Management**: Organize notes with multiple categories and visual color coding
- **📱 Responsive Design**: Optimized for all screen sizes with mobile-specific features
- **✅ Interactive Checklists**: Add and manage todo lists within notes
- **🎨 Beautiful UI**: Clean, modern interface with accessibility features
- **⚡ Fast & Lightweight**: Simple Flask backend with JSON file storage
- **🔄 Auto-Save**: Changes are saved automatically with real-time updates

### Mobile-First Features

- **Mobile Category Filter**: Dropdown selector for easy category filtering on small screens
- **Touch-Friendly Interface**: Properly sized buttons and inputs for touch interactions
- **Responsive Grid**: Notes automatically adjust to single-column layout on mobile
- **Search with Clear Button**: One-tap search clearing with visual feedback

## Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd noteboard
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

> [!TIP]
> For development, the Flask app runs in debug mode by default, providing hot reload functionality.

### Alternative Setup Methods

#### Using Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run application
python app.py
```

#### Using Docker

```bash
# Build the image
docker build -t noteboard .

# Run the container
docker run -p 5000:5000 noteboard
```

## Usage

### Creating Notes

1. Click the **"+ Add new"** button in the sidebar
2. Fill in the note details:
   - **Title**: Give your note a descriptive title
   - **Categories**: Add tags by typing and pressing Enter
   - **Content**: Write your note content
   - **Topics**: Create checklist items
3. Click **Save** to store your note

### Searching Notes

- Use the search bar at the top to find notes instantly
- Search works across titles, content, and categories
- Matching terms are highlighted in yellow
- Use the **×** button to clear your search
- Press **Escape** to quickly clear and unfocus the search

### Organizing with Categories

- **Desktop**: Use the sidebar to filter by category
- **Mobile**: Use the dropdown filter above the notes
- Categories show note counts and are color-coded
- Click "All" to view all notes

### Managing Notes

- **View**: Click any note card to open the detailed view
- **Edit**: Make changes in the detail view and save
- **Delete**: Use the three-dot menu (⋯) on each note card
- **Checklist**: Check off completed items in your todo lists

## API

NoteBoard provides a simple REST API for managing notes:

### Endpoints

#### Get All Notes
```http
GET /api/notes
```

#### Create Note
```http
POST /api/notes
Content-Type: application/json

{
  "title": "My Note",
  "content": "Note content here",
  "categories": ["category1", "category2"],
  "topics": [
    {"text": "Task 1", "done": false},
    {"text": "Task 2", "done": true}
  ]
}
```

#### Get Single Note
```http
GET /api/notes/{id}
```

#### Update Note
```http
PUT /api/notes/{id}
Content-Type: application/json

{
  "title": "Updated Note",
  "content": "Updated content",
  "categories": ["updated-category"]
}
```

#### Delete Note
```http
DELETE /api/notes/{id}
```

#### Get Categories
```http
GET /api/categories
```

### Response Format

All notes include the following fields:
```json
{
  "id": 1632150000000,
  "title": "Sample Note",
  "content": "This is a sample note",
  "categories": ["work", "important"],
  "topics": [
    {"text": "Complete task", "done": false}
  ],
  "created_at": "2024-01-01T12:00:00Z"
}
```

## Development

### Project Structure

```
noteboard/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── notes.json            # Data storage (created automatically)
├── static/
│   ├── app.js            # Main application JavaScript
│   ├── detail.js         # Note detail page functionality
│   ├── new.js            # New note creation
│   └── style.css         # All styles and responsive design
└── templates/
    ├── index.html        # Main page template
    ├── detail.html       # Note detail template
    └── new.html          # New note template
```

### Key Components

- **Flask Backend** (`app.py`): Simple REST API with JSON file storage
- **Responsive Frontend**: Vanilla JavaScript with modern CSS Grid and Flexbox
- **Mobile-First Design**: Progressive enhancement for larger screens
- **Accessibility**: WCAG 2.1 compliant with proper ARIA labels and keyboard navigation

### Data Storage

Notes are stored in a `notes.json` file with automatic backup and normalization. The application handles migration from legacy single-category format to the current multi-category system.

### Customization

#### Styling
- Modify CSS variables in `:root` to change colors and spacing
- Update responsive breakpoints in media queries
- Customize the color palette in the `pickColorFor()` function

#### Features
- Add new API endpoints in `app.py`
- Extend the note model with additional fields
- Implement new frontend functionality in the JavaScript files

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

> [!NOTE]
> The application uses modern JavaScript features and CSS Grid. Older browsers may require polyfills.

## Performance

- **Lightweight**: < 1MB total asset size
- **Fast Search**: Real-time filtering with highlighting
- **Responsive**: Optimized layouts for all screen sizes
- **Accessible**: Screen reader compatible with keyboard navigation

## Troubleshooting

### Common Issues

**App won't start**
- Check if port 5000 is available
- Verify Python version (3.8+ required)
- Ensure all dependencies are installed

**Notes not saving**
- Check file permissions in the application directory
- Verify `notes.json` can be created/modified

**Search not working**
- Clear browser cache and reload
- Check browser console for JavaScript errors

**Mobile layout issues**
- Ensure viewport meta tag is present
- Test with different screen sizes using browser dev tools

## Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

Built with ❤️ using Flask and modern web technologies.