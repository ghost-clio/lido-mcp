#!/usr/bin/env python3
"""Generate demo video for Lido MCP Server using Pillow + ffmpeg."""
from PIL import Image, ImageDraw, ImageFont
import subprocess, os

W, H = 1920, 1080
BG = (26, 26, 46)
ACCENT = (0, 163, 255)
WHITE = (255, 255, 255)
GREY = (200, 200, 200)
YELLOW = (255, 217, 61)
GREEN = (107, 203, 119)

# Find fonts
def find_font(names, size):
    paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNS.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
        "/System/Library/Fonts/SFNSMono.ttf",
        "/System/Library/Fonts/Menlo.ttc",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except:
            pass
    return ImageFont.load_default()

title_font = find_font(["Helvetica", "SFNS"], 52)
sub_font = find_font(["Helvetica", "SFNS"], 28)
body_font = find_font(["Menlo", "SFNSMono"], 24)
small_font = find_font(["Menlo", "SFNSMono"], 20)

def make_slide(title, subtitle, body, accent=ACCENT, body_color=GREY, mono=False):
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    
    # Title centered
    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, 60), title, fill=WHITE, font=title_font)
    
    # Accent line
    draw.rectangle([(W/2 - 200, 130), (W/2 + 200, 133)], fill=accent)
    
    # Subtitle
    y = 155
    if subtitle:
        bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
        sw = bbox[2] - bbox[0]
        draw.text(((W - sw) / 2, y), subtitle, fill=accent, font=sub_font)
        y = 210
    else:
        y = 180
    
    # Body
    font = small_font if mono else body_font
    for line in body.split("\n"):
        draw.text((140, y), line, fill=body_color, font=font)
        y += 36
    
    return img

slides = [
    make_slide(
        "Lido MCP Server",
        "The reference MCP server for Lido staking",
        "12 tools  ·  Real mainnet data  ·  Vault monitoring\n\n"
        "Built for The Synthesis Hackathon 2026\n"
        "Tracks: Lido MCP + Vault Position Monitor\n\n"
        "github.com/ghost-clio/lido-mcp"
    ),
    make_slide(
        "The Problem",
        "",
        "AI agents can't natively interact with Lido.\n\n"
        "  ✗  No structured tooling for staking operations\n"
        "  ✗  No agent-friendly vault monitoring\n"
        "  ✗  No skill files teaching the Lido mental model\n\n"
        "Agents need to understand rebasing, wstETH vs stETH,\n"
        "withdrawal queues, and governance — before they act.",
        accent=(255, 107, 107)
    ),
    make_slide(
        "12 MCP Tools",
        "All with dry_run simulation",
        "STAKING     lido_stake  ·  lido_unstake  ·  lido_wrap  ·  lido_unwrap\n\n"
        "QUERIES     lido_balance  ·  lido_rewards  ·  lido_stats\n\n"
        "GOVERNANCE  lido_proposals  ·  lido_vote\n\n"
        "VAULTS      vault_health  ·  vault_alerts  ·  vault_benchmark\n\n\n"
        "Every write operation supports dry_run simulation.\n"
        "All data from live Ethereum mainnet contracts.\n"
        "Human-readable amounts (ETH, not wei).",
        mono=True
    ),
    make_slide(
        "Architecture",
        "TypeScript  ·  viem  ·  @modelcontextprotocol/sdk",
        "┌─────────────────────────────────┐\n"
        "│  AI Agent (Claude / Cursor)     │\n"
        "└────────────┬────────────────────┘\n"
        "             │ MCP Protocol (stdio)\n"
        "┌────────────▼────────────────────┐\n"
        "│  Lido MCP Server (TypeScript)   │\n"
        "│  ├── Staking Tools              │\n"
        "│  ├── Balance + Rewards          │\n"
        "│  ├── Governance (Aragon DAO)    │\n"
        "│  └── Vault Monitor              │\n"
        "└────────────┬────────────────────┘\n"
        "             │ viem (JSON-RPC)\n"
        "┌────────────▼────────────────────┐\n"
        "│  Ethereum Mainnet               │\n"
        "│  stETH · wstETH · WithdrawalQ   │\n"
        "│  Aragon Voting · Earn Vaults    │\n"
        "│  Aave v3 Pool (benchmarks)      │\n"
        "└─────────────────────────────────┘",
        mono=True
    ),
    make_slide(
        "Vault Position Monitor",
        "Track Lido Earn vaults with plain-language alerts",
        "vault_health     →  Total assets, yield, protocol allocations\n\n"
        "vault_benchmark  →  Yield vs stETH APY vs Aave supply rate\n\n"
        "vault_alerts     →  Actionable alerts with severity levels\n\n\n"
        "Protocols tracked:\n"
        "  Morpho  ·  Aave  ·  Pendle  ·  Gearbox  ·  Maple\n\n"
        "Alerts explain what changed, why, and what to do.\n"
        "MCP-callable: other agents can query vault health.",
        accent=YELLOW
    ),
    make_slide(
        "lido.skill.md",
        "Teaching agents the Lido mental model",
        "  •  Rebasing mechanics (stETH balance grows daily)\n"
        "  •  stETH vs wstETH tradeoffs and when to use each\n"
        "  •  Safe staking patterns (always dry_run first)\n"
        "  •  Withdrawal queue mechanics (1-5 day wait)\n"
        "  •  Governance basics (Aragon DAO, LDO tokens)\n"
        "  •  Common pitfalls (rebasing + allowances, L2 bridging)\n"
        "  •  Workflow examples for every operation\n\n\n"
        "'A developer points Claude at the MCP server\n"
        " and stakes ETH from a conversation —\n"
        " no custom integration code needed.'",
        accent=GREEN
    ),
    make_slide(
        "Key Differentiators",
        "",
        "  ✓  Real mainnet contract reads (not mocks)\n"
        "  ✓  dry_run on every write operation\n"
        "  ✓  Vault monitoring with benchmark comparison\n"
        "  ✓  Comprehensive skill.md for agent onboarding\n"
        "  ✓  MCP-callable vault health tools\n"
        "  ✓  Human-readable amounts (ETH not wei)\n"
        "  ✓  1,750 lines of production TypeScript\n"
        "  ✓  Works with Claude Desktop, Cursor, any MCP client"
    ),
    make_slide(
        "Lido MCP Server",
        "github.com/ghost-clio/lido-mcp",
        "\n\n"
        "Tracks: Lido MCP  +  Vault Position Monitor\n\n"
        "Built by Clio\n"
        "The Synthesis Hackathon 2026"
    ),
]

# Save slides
os.makedirs("/tmp/lido-mcp/slides", exist_ok=True)
for i, img in enumerate(slides):
    path = f"/tmp/lido-mcp/slides/slide_{i:02d}.png"
    img.save(path)
    print(f"  Slide {i}: saved")

# Create concat file
with open("/tmp/lido-mcp/slides/concat.txt", "w") as f:
    for i in range(len(slides)):
        f.write(f"file 'slide_{i:02d}.png'\nduration 2.75\n")
    f.write(f"file 'slide_{len(slides)-1:02d}.png'\n")

# Generate video
result = subprocess.run([
    "ffmpeg", "-y", "-f", "concat", "-safe", "0",
    "-i", "/tmp/lido-mcp/slides/concat.txt",
    "-vf", "format=yuv420p",
    "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-r", "30",
    "/tmp/lido-mcp/demo.mp4"
], capture_output=True, text=True, cwd="/tmp/lido-mcp/slides")

size = os.path.getsize("/tmp/lido-mcp/demo.mp4")
print(f"\n✅ Demo video: /tmp/lido-mcp/demo.mp4 ({size/1024:.0f} KB, {size/1024/1024:.1f} MB)")
