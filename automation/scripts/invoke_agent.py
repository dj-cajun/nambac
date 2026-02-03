import os
import sys
import json
import argparse
from typing import Optional, Dict, Any

# Mock Agent Invocation for Phase 2 Setup
# In a real scenario, this would import the 'logic' module or call LLM APIs directly.
# For now, we simulate the agent response structure to verify n8n connectivity.

def load_agent_directive(agent_name: str) -> str:
    """Loads the markdown directive for a specific agent."""
    agent_path = os.path.join(os.path.dirname(__file__), "../../.claude/agents", f"{agent_name}.md")
    try:
        with open(agent_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: Agent definition for {agent_name} not found.")
        sys.exit(1)

def simulate_llm_call(agent_name: str, context: str) -> Dict[str, Any]:
    """Simulates an LLM response based on the agent's persona."""
    
    # Simulating Trend_Hunter
    if agent_name == "Expert_Trend_Hunter":
        return {
            "keywords": ["폭우 침수", "4군 맛집", "비자 연장"],
            "raw_insight": "최근 호치민 폭우로 인해 7군과 4군 침수 사례가 SNS에 급증. 배달 지연 불만이 폭주 중.",
            "target_agent": "Expert_Delivery_King",
            "pushed_brief": "폭우로 배달이 늦어져 킹받는 상황을 퀴즈로 만들어라.",
            "buzz_score": 8.5
        }
    
    # Simulating Delivery_King
    elif agent_name == "Expert_Delivery_King":
         return {
            "title": "호치민 우기 생존: 그랩푸드 기사의 변명 맞추기",
            "questions": [
                {
                    "q": "기사님이 '비가 와서 못 가요'라고 한다. 당신의 반응은?",
                    "a": "팁 더 줄게 와줘",
                    "b": "취소하고 라면 먹음"
                }
            ],
            "result_type": "보살형 호치민 거주자"
        }

    # Simulating Inspector_J_Bad
    elif agent_name == "Inspector_J_Bad":
        return {
            "status": "APPROVE",
            "comment": "나쁘지 않네. 근데 팁 더 준다는 건 좀 호구 같은데? 뭐 사실적이라 통과.",
            "stamp": "J_BAD_APPROVED"
        }

    return {"error": "Unknown agent or simulation not implemented."}

def main():
    parser = argparse.ArgumentParser(description="Invoke a Nambac AI Agent.")
    parser.add_argument("agent_name", help="Name of the agent file (e.g., Expert_Trend_Hunter)")
    parser.add_argument("--context", help="Context or prompt override", default="")
    
    args = parser.parse_args()
    
    # 1. Load Directive (to ensure it exists)
    directive = load_agent_directive(args.agent_name)
    
    # 2. Simulate Execution
    # In production, this would be: response = call_gemini(directive, args.context)
    response = simulate_llm_call(args.agent_name, args.context)
    
    # 3. Output JSON
    print(json.dumps(response, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
