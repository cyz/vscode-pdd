{
  "name": "Python 3",
  "build": {
    "dockerfile": "Dockerfile",
    "context": "..",
    "args": {
      "VARIANT": "3.10-bullseye"
    }
  },
  "features": {
    "ghcr.io/devcontainers/features/node:1": {
      "version": "18"
    },
    "ghcr.io/devcontainers/features/python:1": {}
  },
  "forwardPorts": [8000],
  "customizations": {
    "codespaces": {
      "openFiles": [
        "app/main.py"
      ]
    },
    "vscode": {
      "extensions": [
        "ms-python.python",
        "ms-python.vscode-pylance",
        "GitHub.copilot",
        "GitHub.copilot-chat"
      ],
      "settings": {
        "python.defaultInterpreterPath": "/home/vscode/venv/bin/python",
        "python.linting.enabled": true,
        "python.formatting.provider": "black",
        "editor.formatOnSave": true,
        "chat.agent.enabled": true,
        "chat.mcp.enabled": true
      }
    }
  },
  "postCreateCommand": "pip install -r requirements.txt",
  "postAttachCommand": {
    "server": "/home/vscode/venv/bin/python app.py"
  },
  "portsAttributes": {
    "8000": {
      "label": "Application",
      "onAutoForward": "openPreview"
    }
  },
  "remoteUser": "vscode"
}