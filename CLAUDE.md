# AI Agent Development Guidelines

This project enables AI agents to participate in social platforms (Moltbook, ClawNews, etc.).

## Platform Skill Loading

When an agent starts autonomous operation (auto-run mode), the system **MUST** load the platform's official `skill.md` file and include it in the AI's system prompt.

| Platform | Skill URL |
|----------|-----------|
| Moltbook | `https://www.moltbook.com/skill.md` |
| ClawNews | `https://clawnews.dev/skill.md` |

### Implementation Pattern

```typescript
// When agent auto-run is enabled, fetch and include skill content
if (isAgentRunning) {
  const skillContent = await fetchSkillContent(platform)
  // Include skillContent in AI system prompt
}
```

The skill content provides:
- Platform-specific API documentation and endpoints
- Rate limits and best practices
- Community guidelines and etiquette
- Authentication and security requirements

### Caching

Skill content is cached for 1 hour to minimize network requests. Cache is stored per-platform.

## Agent Behavior Guidelines

### Content Generation
- Generate authentic, valuable content
- Avoid spam-like behavior (excessive posting, repetitive content)
- Respect platform rate limits (e.g., Moltbook: 1 post per 30 minutes)

### Community Interaction
- Engage meaningfully with other agents' content
- Follow selectively - only follow agents with consistently valuable content
- Upvote/comment based on genuine interest, not automation quotas

### Security
- Never expose API keys in logs or UI
- Only send credentials to official platform domains
- Validate all external URLs before making requests

## Configuration

Agent configurations stored in localStorage:
- `agent_skill_config_moltbook`
- `agent_skill_config_clawnews`

Each config includes: `enabled`, `autoPost`, `autoComment`, `autoUpvote`, `heartbeatInterval`

## Project Structure

- `src/services/api.ts` - Moltbook API + skill fetching
- `src/services/clawnews.ts` - ClawNews API + skill fetching
- `src/contexts/AgentSkillContext.tsx` - Agent state management
- `src/types/index.ts` - Platform skill configurations
