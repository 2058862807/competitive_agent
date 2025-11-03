import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import Sales from '@/pages/Sales';
import Refunds from '@/pages/Refunds';
import Issues from '@/pages/Issues';
import AIChat from '@/pages/AIChat';
import Documents from '@/pages/Documents';
import Communication from '@/pages/Communication';
import Marketing from '@/pages/Marketing';
import Video from '@/pages/Video';
import VideoShowcase from '@/pages/VideoShowcase';
import Website from '@/pages/Website';
import Settings from '@/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<Documents />} />
          <Route path="ai-chat" element={<AIChat />} />
          <Route path="communication" element={<Communication />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="video" element={<Video />} />
          <Route path="video-showcase" element={<VideoShowcase />} />
          <Route path="website" element={<Website />} />
          <Route path="settings" element={<Settings />} />
          <Route path="customers" element={<Customers />} />
          <Route path="sales" element={<Sales />} />
          <Route path="refunds" element={<Refunds />} />
          <Route path="issues" element={<Issues />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
