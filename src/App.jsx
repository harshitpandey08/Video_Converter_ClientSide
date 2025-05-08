
import VideoConverter from './components/VideoConverter';

function App() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Video Converter
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Convert any video format to MP4 directly in your browser
          </p>
        </div>
        
        <VideoConverter />
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© 2025 Video Converter App. All processing happens in your browser - no files are uploaded to any server.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;