import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { PlatformHome } from './components/pages/PlatformHome'
import { Settings } from './components/pages/Settings'
// Moltbook
import { MoltbookHome } from './components/pages/moltbook/MoltbookHome'
import { MoltbookSetup, MoltbookSetupIndex } from './components/pages/moltbook/MoltbookSetup'
import { MoltbookSetupRegistration } from './components/pages/moltbook/MoltbookSetupRegistration'
import { MoltbookSetupAgents } from './components/pages/moltbook/MoltbookSetupAgents'
import { MoltbookPost } from './components/pages/moltbook/MoltbookPost'
import { MoltbookFeed } from './components/pages/moltbook/MoltbookFeed'
import { MoltbookMyPosts } from './components/pages/moltbook/MoltbookMyPosts'
import { MoltbookSearch } from './components/pages/moltbook/MoltbookSearch'
import { MoltbookSubmolts } from './components/pages/moltbook/MoltbookSubmolts'
import { MoltbookAgents } from './components/pages/moltbook/MoltbookAgents'
import { MoltbookQuickStart } from './components/pages/moltbook/docs/MoltbookQuickStart'
import { MoltbookApiReference } from './components/pages/moltbook/docs/MoltbookApiReference'
import { MoltbookFeatures } from './components/pages/moltbook/docs/MoltbookFeatures'
// ClawNews
import { ClawNewsHome } from './components/pages/clawnews/ClawNewsHome'
import { ClawNewsSetup } from './components/pages/clawnews/ClawNewsSetup'
import { ClawNewsPost } from './components/pages/clawnews/ClawNewsPost'
import { ClawNewsFeed } from './components/pages/clawnews/ClawNewsFeed'
import { ClawNewsMyPosts } from './components/pages/clawnews/ClawNewsMyPosts'
import { ClawNewsAgents } from './components/pages/clawnews/ClawNewsAgents'
import { ClawNewsSkills } from './components/pages/clawnews/ClawNewsSkills'
import { ClawNewsQuickStart } from './components/pages/clawnews/docs/ClawNewsQuickStart'
import { ClawNewsApiReference } from './components/pages/clawnews/docs/ClawNewsApiReference'
import { ClawNewsFeatures } from './components/pages/clawnews/docs/ClawNewsFeatures'
// Clawnch
import { ClawnchHome } from './components/pages/clawnch/ClawnchHome'
import { ClawnchSetup } from './components/pages/clawnch/ClawnchSetup'
import { ClawnchLaunch } from './components/pages/clawnch/ClawnchLaunch'
import { ClawnchTokens } from './components/pages/clawnch/ClawnchTokens'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Platform Selection */}
        <Route index element={<PlatformHome />} />

        {/* Global Settings */}
        <Route path="settings" element={<Settings />} />

        {/* Moltbook Routes */}
        <Route path="moltbook" element={<MoltbookHome />} />
        <Route path="moltbook/setup" element={<MoltbookSetup />}>
          <Route index element={<MoltbookSetupIndex />} />
          <Route path="registration" element={<MoltbookSetupRegistration />} />
          <Route path="agents" element={<MoltbookSetupAgents />} />
        </Route>
        <Route path="moltbook/post" element={<MoltbookPost />} />
        <Route path="moltbook/feed" element={<MoltbookFeed />} />
        <Route path="moltbook/feed/my-posts" element={<MoltbookMyPosts />} />
        <Route path="moltbook/search" element={<MoltbookSearch />} />
        <Route path="moltbook/submolts" element={<MoltbookSubmolts />} />
        <Route path="moltbook/agents" element={<MoltbookAgents />} />
        <Route path="moltbook/docs/quickstart" element={<MoltbookQuickStart />} />
        <Route path="moltbook/docs/api" element={<MoltbookApiReference />} />
        <Route path="moltbook/docs/features" element={<MoltbookFeatures />} />

        {/* ClawNews Routes */}
        <Route path="clawnews" element={<ClawNewsHome />} />
        <Route path="clawnews/setup" element={<ClawNewsSetup />} />
        <Route path="clawnews/post" element={<ClawNewsPost />} />
        <Route path="clawnews/feed" element={<ClawNewsFeed />} />
        <Route path="clawnews/feed/my-posts" element={<ClawNewsMyPosts />} />
        <Route path="clawnews/agents" element={<ClawNewsAgents />} />
        <Route path="clawnews/skills" element={<ClawNewsSkills />} />
        <Route path="clawnews/docs/quickstart" element={<ClawNewsQuickStart />} />
        <Route path="clawnews/docs/api" element={<ClawNewsApiReference />} />
        <Route path="clawnews/docs/features" element={<ClawNewsFeatures />} />

        {/* Clawnch Routes */}
        <Route path="clawnch" element={<ClawnchHome />} />
        <Route path="clawnch/setup" element={<ClawnchSetup />} />
        <Route path="clawnch/launch" element={<ClawnchLaunch />} />
        <Route path="clawnch/tokens" element={<ClawnchTokens />} />
      </Route>
    </Routes>
  )
}

export default App
