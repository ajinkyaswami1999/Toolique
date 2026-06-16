import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
