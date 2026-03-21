#!/bin/bash
set -e
DIR="/tmp/lido-mcp/slides"
mkdir -p "$DIR"
W=1920
H=1080

slide() {
  local idx=$1 title="$2" body="$3"
  magick -size ${W}x${H} xc:"#1a1a2e" \
    -fill white -font Helvetica-Bold -pointsize 52 -gravity North \
    -annotate +0+60 "$title" \
    -fill "#00a3ff" -pointsize 2 -draw "rectangle 710,130 1210,133" \
    -fill "#cccccc" -font Courier -pointsize 24 -gravity NorthWest \
    -annotate +140+200 "$body" \
    "$DIR/slide_${idx}.png"
  echo "  slide $idx: $title"
}

slide 00 "Lido MCP Server" "The reference MCP server for Lido staking
12 tools · Real mainnet data · Vault monitoring

Built for The Synthesis Hackathon 2026
Tracks: Lido MCP + Vault Position Monitor

github.com/ghost-clio/lido-mcp"

slide 01 "The Problem" "AI agents can't natively interact with Lido.

No structured tooling for staking operations.
No agent-friendly vault monitoring.
No skill files teaching the Lido mental model.

Agents need to understand rebasing, wstETH vs stETH,
withdrawal queues, and governance before they act."

slide 02 "12 MCP Tools" "STAKING    lido_stake · lido_unstake · lido_wrap · lido_unwrap
QUERIES    lido_balance · lido_rewards · lido_stats
GOVERN     lido_proposals · lido_vote
VAULTS     vault_health · vault_alerts · vault_benchmark

Every write operation supports dry_run simulation.
All data from live Ethereum mainnet contracts.
Human-readable amounts (ETH, not wei)."

slide 03 "Architecture" "┌─────────────────────────────────┐
│  AI Agent (Claude / Cursor)     │
└────────────┬────────────────────┘
             │ MCP Protocol (stdio)
┌────────────▼────────────────────┐
│  Lido MCP Server (TypeScript)   │
│  ├── Staking Tools              │
│  ├── Balance + Rewards          │
│  ├── Governance (Aragon DAO)    │
│  └── Vault Monitor              │
└────────────┬────────────────────┘
             │ viem (JSON-RPC)
┌────────────▼────────────────────┐
│  Ethereum Mainnet               │
│  stETH · wstETH · WithdrawalQ   │
│  Aragon Voting · Earn Vaults    │
│  Aave v3 Pool (benchmarks)      │
└─────────────────────────────────┘"

slide 04 "Vault Position Monitor" "Track Lido Earn vaults with plain-language alerts

vault_health    → Total assets, yield, protocol allocations
vault_benchmark → Yield vs stETH APY vs Aave supply rate
vault_alerts    → Actionable alerts with severity levels

Protocols tracked:
  Morpho · Aave · Pendle · Gearbox · Maple

Alerts explain what changed, why, and what to do.
MCP-callable: other agents can query vault health."

slide 05 "lido.skill.md" "Teaching agents the Lido mental model:

• Rebasing mechanics (stETH balance grows daily)
• stETH vs wstETH tradeoffs and when to use each
• Safe staking patterns (always dry_run first)
• Withdrawal queue mechanics (1-5 day wait)
• Governance basics (Aragon DAO, LDO tokens)
• Common pitfalls (rebasing + allowances, L2 bridging)
• Workflow examples for every operation

A developer points Claude at the MCP server
and stakes ETH from a conversation —
no custom integration code needed."

slide 06 "Key Differentiators" "Real mainnet contract reads (not mocks)
dry_run on every write operation
Vault monitoring with benchmark comparison
Comprehensive skill.md for agent onboarding
MCP-callable vault health tools
Human-readable amounts (ETH not wei)
1,750 lines of production TypeScript
Works with Claude Desktop, Cursor, any MCP client"

slide 07 "Lido MCP Server" "github.com/ghost-clio/lido-mcp

Tracks: Lido MCP + Vault Position Monitor
Built by Clio
The Synthesis Hackathon 2026"

# Create concat file
cat > "$DIR/concat.txt" <<EOF
file 'slide_00.png'
duration 2.75
file 'slide_01.png'
duration 2.75
file 'slide_02.png'
duration 2.75
file 'slide_03.png'
duration 2.75
file 'slide_04.png'
duration 2.75
file 'slide_05.png'
duration 2.75
file 'slide_06.png'
duration 2.75
file 'slide_07.png'
duration 2.75
file 'slide_07.png'
EOF

# Generate video
cd "$DIR"
ffmpeg -y -f concat -safe 0 -i concat.txt \
  -vf "format=yuv420p" \
  -c:v libx264 -preset medium -crf 23 -r 30 \
  /tmp/lido-mcp/demo.mp4

echo ""
ls -lh /tmp/lido-mcp/demo.mp4
echo "✅ Done!"
