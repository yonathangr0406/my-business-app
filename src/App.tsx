import { useState } from 'react';
import {
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import SalesReport from './pages/SalesReport';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('reports');

  const menuItems = [
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'reports':
        return <SalesReport />;
      default:
        return <SalesReport />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <img
              src="/remax-logo.png"
              alt="Remax Logo"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-remax-blue to-remax-red bg-clip-text text-transparent">
              My Business
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden ml-auto text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${activeTab === item.id
                      ? 'bg-remax-blue text-white shadow-md shadow-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-remax-blue'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-remax-blue'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-remax-red/10 flex items-center justify-center text-remax-red font-bold">
                YG
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Yonathan Gonzalez</p>
                <p className="text-xs text-gray-500 truncate">Real Estate Agent</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img
              src="/remax-logo.png"
              alt="Remax Logo"
              className="h-6 w-auto"
            />
            <span className="font-bold text-gray-900">My Business</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50/50">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
