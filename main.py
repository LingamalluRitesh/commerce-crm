"""CommerceCRM Enterprise Root Application Entry Point."""

import sys
import uvicorn

def main():
    """Launch the CommerceCRM unified API server."""
    print("Starting CommerceCRM Enterprise Engine...")
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)

if __name__ == "__main__":
    main()
