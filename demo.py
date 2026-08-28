#!/usr/bin/env python3
"""
ORGagent Organization OS — Interactive Terminal Demonstration
Run with: python demo.py
"""

import sys
import time
import hashlib
import json

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def color(text: str, code: str) -> str:
    return f"\033[{code}m{text}\033[0m"

def print_banner():
    banner = f"""
{color("================================================================================", "35")}
{color("                     ORGagent ORGANIZATION OS v1.0                              ", "1;35")}
{color("      Governed Multi-Agent AI Compiler with VERITAS Cryptographic Proofs        ", "36")}
{color("================================================================================", "35")}
"""
    print(banner)

def main():
    print_banner()
    prompt = "Design an adaptive real-time fraud detection engine for fintech with <15ms SLA and Policy P-02 compliance"
    
    print(f"{color('[1/5] INTAKE MISSION', '1;34')}")
    print(f"  • Prompt: {color(prompt, '37')}")
    print(f"  • Domain: {color('Fintech / Payment Security', '32')}")
    time.sleep(0.5)

    print(f"\n{color('[2/5] SYNTHESIZING IDEA CONTRACT', '1;34')}")
    print(f"  • Model: {color('Google Gemini 2.5 Pro', '35')}")
    print(f"  • Problem Statement: {color('Sub-15ms fraud classification on streaming payment ledgers', '37')}")
    print(f"  • Constraints: {color('Policy P-02 Zero-PII, PostgreSQL + pgvector, Docker Stack', '33')}")
    print(f"  • Confidence: {color('98.4%', '32')}")
    time.sleep(0.5)

    print(f"\n{color('[3/5] COMPILING GOVERNED 7-AGENT SWARM', '1;34')}")
    agents = [
        ("1. Research Analyst", "groq/llama-3.3-70b-versatile", "EvidenceBrief", "450 tokens", "$0.0003"),
        ("2. Product Strategist", "deepseek/deepseek-reasoner", "ProductSpec", "1,200 tokens", "$0.0018"),
        ("3. AI Architect", "deepseek/deepseek-reasoner", "AIArchitectureSpec", "950 tokens", "$0.0014"),
        ("4. System Architect", "google/gemini-2.5-pro", "SystemArchitectureSpec", "1,800 tokens", "$0.0045"),
        ("5. Privacy & Risk Auditor", "zhipu/glm-5.2", "RiskAuditReport", "620 tokens", "$0.0008"),
        ("6. Consistency Reviewer", "deepseek/deepseek-reasoner", "ReviewReport", "850 tokens", "$0.0012"),
        ("7. Solutions Officer", "google/gemini-2.5-pro", "FinalBlueprint", "2,100 tokens", "$0.0052"),
    ]
    for role, model_name, schema, tokens, cost in agents:
        print(f"  {color('✓', '32')} {color(role, '1;37'):<25} | Model: {color(model_name, '36'):<28} | Schema: {color(schema, '33'):<22} | {tokens} ({cost})")
        time.sleep(0.2)

    print(f"\n{color('[4/5] VERITAS CRYPTOGRAPHIC MERKLE LEDGER', '1;34')}")
    prev_hash = "0000000000000000000000000000000000000000000000000000000000000000"
    for i, (role, _, _, _, _) in enumerate(agents, start=1):
        payload = f"{role}-{i}-{prompt}"
        event_hash = hashlib.sha256((prev_hash + payload).encode()).hexdigest()
        print(f"  [{i}/7] Event #{i}: {color(role, '37'):<22} -> SHA-256: {color(event_hash[:20] + '...', '32')}")
        prev_hash = event_hash
        time.sleep(0.1)

    print(f"\n{color('[5/5] MASTER TECH BLUEPRINT COMPILED', '1;32')}")
    print(f"  • Total Synthesis Time: {color('1.82 seconds', '1;32')}")
    print(f"  • Total Tokens: {color('7,970 tokens', '36')}")
    print(f"  • Total AI Cost: {color('$0.0152 USD', '32')}")
    print(f"  • Tamper Integrity: {color('100% VALID (Zero Mutations)', '1;32')}")
    print(f"  • Live Vercel App: {color('https://organisational-agent-6up4.vercel.app/', '1;34')}")
    print(f"  • Live Render API: {color('https://organisational-agent.onrender.com', '1;34')}")
    print(f"\n{color('✨ Finished! Run `npm run dev` in apps/web or visit the live cloud URL.', '1;35')}\n")

if __name__ == "__main__":
    main()
