FROM mcr.microsoft.com/devcontainers/python:3.10-bullseye

# Install dependencies
COPY requirements.txt /tmp/pip-tmp/
RUN pip install --upgrade pip && \
    pip install -r /tmp/pip-tmp/requirements.txt && \
    rm -rf /tmp/pip-tmp

# Create a virtual environment
RUN python -m venv /home/vscode/venv
ENV PATH="/home/vscode/venv/bin:$PATH"

# Set up working directory
WORKDIR /workspaces/vscode-pdd