import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import Sales from '@/pages/Sales';
import Refunds from '@/pages/Refunds';
import Issues from '@/pages/Issues';
import AIChat from '@/pages/AIChat';
import AIContentTest from '@/pages/AIContentTest';
import MailAssistant from '@/pages/MailAssistant';
import EmailHelper from '@/pages/EmailHelper';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="sales" element={<Sales />} />
          <Route path="refunds" element={<Refunds />} />
          <Route path="issues" element={<Issues />} />
          <Route path="ai-chat" element={<AIChat />} />
          <Route path="ai-content-test" element={<AIContentTest />} />
          <Route path="mail-assistant" element={<MailAssistant />} />
          <Route path="email-helper" element={<EmailHelper />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
