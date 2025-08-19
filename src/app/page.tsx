export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                DuckSAT
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Home
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                About
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            Welcome to DuckSAT
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Your comprehensive platform for SAT preparation and academic excellence.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Get Started
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}