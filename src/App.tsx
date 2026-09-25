import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/app/AppShell'
import Landing from '@/routes/site/Landing'
import SiteBuild from '@/routes/site/SiteBuild'
import Register from '@/routes/site/Register'
import SignIn from '@/routes/site/SignIn'
import NotFound from '@/routes/site/NotFound'
import Dashboard from '@/routes/app/Dashboard'
import HubOverview from '@/routes/app/HubOverview'
import MyCompany from '@/routes/app/MyCompany'
import CompanyForm from '@/routes/app/CompanyForm'
import CompanyProfile from '@/routes/app/CompanyProfile'
import Messages from '@/routes/app/Messages'
import { OpportunityList, OpportunityDetail } from '@/routes/app/Opportunities'
import { LibraryList, LibraryDetail } from '@/routes/app/Library'
import { AreaSaved, SavedAll } from '@/routes/app/Saved'
import AppBuild from '@/routes/app/AppBuild'
import { ProfilePage, SettingsPage } from '@/routes/app/Account'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/build" element={<SiteBuild />} />
      <Route path="/register" element={<Register />} />
      <Route path="/sign-in" element={<SignIn />} />

      <Route path="/app" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="hub" element={<HubOverview />} />
        <Route path="hub/my-company" element={<MyCompany />} />
        <Route path="hub/my-company/new" element={<CompanyForm mode="create" />} />
        <Route path="hub/my-company/edit" element={<CompanyForm mode="edit" />} />
        <Route path="hub/company/:slug" element={<CompanyProfile />} />
        <Route path="hub/messages" element={<Messages />} />
        <Route path="opportunities" element={<OpportunityList />} />
        <Route path="opportunities/saved" element={<AreaSaved area="opportunities" />} />
        <Route path="opportunities/item/:id" element={<OpportunityDetail />} />
        <Route path="opportunities/:category" element={<OpportunityList />} />
        <Route path="library" element={<LibraryList />} />
        <Route path="library/saved" element={<AreaSaved area="library" />} />
        <Route path="library/item/:id" element={<LibraryDetail />} />
        <Route path="library/:category" element={<LibraryList />} />
        <Route path="build" element={<AppBuild />} />
        <Route path="saved" element={<SavedAll />} />
        <Route path="account" element={<ProfilePage />} />
        <Route path="account/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound inApp />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
