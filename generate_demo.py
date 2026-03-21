#!/usr/bin/env python3
"""Generate demo video for Lido MCP Server - Synthesis Hackathon submission."""

import subprocess
import os
import textwrap

SLIDES = [
    {
        "title": "Lido MCP Server",
        "subtitle": "The reference MCP server for Lido staking",
        "body": "12 tools · Real mainnet data · Vault monitoring\nBuilt for The Synthesis Hackathon",
        "bg": "#1a1a2e",
        "accent": "#00a3ff",
    },
    {
        "title": "The Problem",
        "subtitle": "",
        "body": "AI agents can't natively interact with Lido.\n\nNo structured tooling for staking operations.\nNo agent-friendly vault monitoring.\nNo skill files teaching the Lido mental model.\n\nAgents need to understand rebasing, wstETH vs stETH,\nwithdrawal queues, and governance — before they act.",
        "bg": "#1a1a2e",
        "accent": "#ff6b6b",
    },
    {
        "title": "The Solution: Lido MCP",
        "subtitle": "12 callable tools across 4 groups",
        "body": "STAKING:  lido_stake · lido_unstake · lido_wrap · lido_unwrap\nQUERIES:  lido_balance · lido_rewards · lido_stats\nGOVERNANCE: lido_proposals · lido_vote\nVAULT:   vault_health · vault_alerts · vault_benchmark\n\nAll write operations support dry_run simulation.\nAll data from live Ethereum mainnet contracts.",
        "bg": "#1a1a2e",
        "accent": "#00a3ff",
    },
    {
        "title": "Architecture",
        "subtitle": "TypeScript · viem · @modelcontextprotocol/sdk",
        "body": "┌─────────────────────────────────┐\n│  AI Agent (Claude / Cursor)     │\n└────────────┬────────────────────┘\n             │ MCP Protocol (stdio)\n┌────────────▼────────────────────┐\n│  Lido MCP Server                │\n│  ├── Staking Tools              │\n│  ├── Balance & Rewards          │\n│  ├── Governance (Aragon DAO)    │\n│  └── Vault Monitor              │\n└────────────┬────────────────────┘\n             │ viem (JSON-RPC)\n┌────────────▼────────────────────┐\n│  Ethereum Mainnet               │\n│  stETH · wstETH · Withdrawal Q  │\n│  Aragon Voting · Earn Vaults    │\n│  Aave v3 (benchmarks)           │\n└─────────────────────────────────┘",
        "bg": "#0d1117",
        "accent": "#00a3ff",
    },
    {
        "title": "Vault Position Monitor",
        "subtitle": "Track Lido Earn vaults with plain-language alerts",
        "body": "vault_health → Total assets, yield, protocol allocations\nvault_benchmark → Yield vs stETH APY vs Aave supply rate\nvault_alerts → Actionable alerts with severity levels\n\nProtocols tracked:\n  Morpho · Aave · Pendle · Gearbox · Maple\n\nAlerts include severity (info/warning/critical)\nand recommendations for what to do next.",
        "bg": "#1a1a2e",
        "accent": "#ffd93d",
    },
    {
        "title": "lido.skill.md",
        "subtitle": "Teaching agents the Lido mental model",
        "body": "Covers:\n• Rebasing mechanics (stETH balance grows daily)\n• stETH vs wstETH tradeoffs and when to use each\n• Safe staking patterns (always dry_run first)\n• Withdrawal queue mechanics (1-5 day wait)\n• Governance basics (Aragon DAO, LDO tokens)\n• Common pitfalls (rebasing + allowances, L2 bridging)\n• Workflow examples for every operation\n\n'A developer pointing Claude at the MCP server\n and staking ETH from a conversation\n with no custom integration code.'",
        "bg": "#1a1a2e",
        "accent": "#6bcb77",
    },
    {
        "title": "Key Differentiators",
        "subtitle": "",
        "body": "✓ Real mainnet contract reads (not mocks)\n✓ dry_run on every write operation\n✓ Vault monitoring with benchmark comparison\n✓ Comprehensive skill.md for agent onboarding\n✓ MCP-callable vault health tools\n✓ Human-readable amounts (ETH not wei)\n✓ 1,750 lines of production TypeScript\n✓ Works with Claude Desktop, Cursor, any MCP client",
        "bg": "#1a1a2e",
        "accent": "#00a3ff",
    },
    {
        "title": "Lido MCP Server",
        "subtitle": "github.com/ghost-clio/lido-mcp",
        "body": "Tracks: Lido MCP · Vault Position Monitor\n\nBuilt by Clio 🌀\nThe Synthesis Hackathon 2026",
        "bg": "#1a1a2e",
        "accent": "#00a3ff",
    },
]

DURATION = 22  # seconds per slide
FPS = 1
WIDTH = 1920
HEIGHT = 1080

def create_slide(slide, index, output_path):
    title = slide["title"]
    subtitle = slide["subtitle"]
    body = slide["body"]
    bg = slide["bg"]
    accent = slide["accent"]

    # Build drawtext filters
    filters = []

    # Background
    base = f"color=c={bg}:s={WIDTH}x{HEIGHT}:d=1"

    # Title
    title_esc = title.replace(":", r"\:").replace("'", r"\'")
    filters.append(
        f"drawtext=text='{title_esc}':fontsize=56:fontcolor=white:x=(w-text_w)/2:y=80:fontfile=/System/Library/Fonts/Helvetica.ttc"
    )

    # Accent line under title
    filters.append(
        f"drawbox=x=(w-400)/2:y=155:w=400:h=3:color={accent}:t=fill"
    )

    # Subtitle
    if subtitle:
        sub_esc = subtitle.replace(":", r"\:").replace("'", r"\'")
        filters.append(
            f"drawtext=text='{sub_esc}':fontsize=28:fontcolor={accent}:x=(w-text_w)/2:y=180:fontfile=/System/Library/Fonts/Helvetica.ttc"
        )

    # Body - line by line
    lines = body.split("\n")
    y_start = 250 if subtitle else 220
    for i, line in enumerate(lines):
        if not line.strip():
            continue
        line_esc = line.replace(":", r"\:").replace("'", r"\'").replace('"', r'\"').replace("%", r"%%")
        y = y_start + i * 42
        # Use monospace for architecture/code slides
        if "│" in body or "├" in body or "└" in body or "┌" in body:
            font = "/System/Library/Fonts/Menlo.ttc"
            fsize = 22
        else:
            font = "/System/Library/Fonts/Helvetica.ttc"
            fsize = 28
        filters.append(
            f"drawtext=text='{line_esc}':fontsize={fsize}:fontcolor=white:x=160:y={y}:fontfile={font}"
        )

    filter_chain = ",".join(filters)
    cmd = [
        "ffmpeg", "-y", "-f", "lavfi", "-i", base,
        "-vf", filter_chain,
        "-frames:v", "1",
        "-update", "1",
        output_path
    ]
    subprocess.run(cmd, capture_output=True)

def main():
    os.makedirs("/tmp/lido-mcp/slides", exist_ok=True)

    # Generate slide images
    for i, slide in enumerate(SLIDES):
        path = f"/tmp/lido-mcp/slides/slide_{i:02d}.png"
        create_slide(slide, i, path)
        print(f"  Slide {i}: {slide['title']}")

    # Create video from slides (each slide = ~22/8 ≈ 2.75 seconds)
    secs_per_slide = DURATION / len(SLIDES)

    # Create concat file
    with open("/tmp/lido-mcp/slides/concat.txt", "w") as f:
        for i in range(len(SLIDES)):
            f.write(f"file 'slide_{i:02d}.png'\n")
            f.write(f"duration {secs_per_slide}\n")
        # Last frame needs to be listed again for duration to work
        f.write(f"file 'slide_{len(SLIDES)-1:02d}.png'\n")

    # Generate video
    subprocess.run([
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", "/tmp/lido-mcp/slides/concat.txt",
        "-vf", f"scale={WIDTH}:{HEIGHT},format=yuv420p",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "23",
        "-r", "30",
        "/tmp/lido-mcp/demo.mp4"
    ], capture_output=True)

    size = os.path.getsize("/tmp/lido-mcp/demo.mp4")
    print(f"\n✅ Demo video: /tmp/lido-mcp/demo.mp4 ({size/1024:.0f} KB)")

if __name__ == "__main__":
    main()
