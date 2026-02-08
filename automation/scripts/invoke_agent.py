import os
import sys
import json
import asyncio
import argparse
from typing import Optional, Dict, Any

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../../backend"))
from logic.factory import NambacFactory

async def execute_agent(agent_name: str, context: str) -> Dict[str, Any]:
    """Invokes the actual AI agent using NambacFactory logic."""
    factory = NambacFactory()
    
    # Load the agent's specific directive
    directive = factory.load_sop(agent_name)
    
    # Execute the agent
    response = await factory.call_agent(agent_name, directive, context)
    return response

async def main():
    parser = argparse.ArgumentParser(description="Invoke a Nambac AI Agent.")
    parser.add_argument("agent_name", help="Name of the agent file (e.g., Expert_Trend_Hunter)")
    parser.add_argument("--context", help="Context or prompt override", default="")
    
    args = parser.parse_args()
    
    # 1. Execute the agent using the real factory
    try:
        response = await execute_agent(args.agent_name, args.context)
        # 2. Output JSON to stdout for n8n or other scripts to capture
        print(json.dumps(response, ensure_ascii=False, indent=2))
    except Exception as e:
        error_res = {"error": str(e), "status": "FAILED"}
        print(json.dumps(error_res, ensure_ascii=False, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
