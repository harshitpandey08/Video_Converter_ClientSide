import { useState, useEffect, useRef } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';

// Create FFmpeg instance - we'll load it only once
const ffmpeg = createFFmpeg({ 
  log: true,
  corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
});

const VideoConverter = () => {
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [inputVideo, setInputVideo] = useState(null);
  const [outputVideo, setOutputVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  
  const previewVideoRef = useRef(null);

  // Load FFmpeg on component mount
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        if (!ffmpeg.isLoaded()) {
          await ffmpeg.load();
        }
        setIsFFmpegLoaded(true);
      } catch (error) {
        console.error('Error loading FFmpeg:', error);
        setError('Failed to load video processing library. Please try refreshing the page.');
      }
    };

    loadFFmpeg();
    
    // Set up progress tracking
    ffmpeg.setProgress(({ ratio }) => {
      const percentage = Math.round(ratio * 100);
      setProgress(percentage);
    });
    
    return () => {
      // Clean up video URLs to prevent memory leaks
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);

  // Update video preview when input video changes
  useEffect(() => {
    if (inputVideo) {
      const url = URL.createObjectURL(inputVideo);
      setVideoUrl(url);
      
      if (previewVideoRef.current) {
        previewVideoRef.current.src = url;
      }
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [inputVideo]);

  const handleFileChange = (file) => {
    setInputVideo(file);
    setOutputVideo(null);
    setProgress(0);
    setError(null);
  };

  const handleFileRemove = () => {
    setInputVideo(null);
    setOutputVideo(null);
    setProgress(0);
    setError(null);
    setVideoUrl('');
    
    // Revoke object URLs to free memory
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    if (outputVideo) {
      URL.revokeObjectURL(URL.createObjectURL(outputVideo));
    }
  };

  const convertVideo = async () => {
    if (!inputVideo || !isFFmpegLoaded) return;

    setIsConverting(true);
    setError(null);
    setProgress(0);
    
    try {
      // Write the input file to memory
      ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(inputVideo));
      
      // Run the FFmpeg command with default settings for MP4 conversion
      await ffmpeg.run(
        '-i', 'input.mp4',
        '-c:v', 'h264',
        '-preset', 'fast',
        '-b:v', '4000k',
        '-vf', 'fps=30',
        '-c:a', 'aac',
        '-strict', 'experimental',
        '-b:a', '128k',
        '-movflags', '+faststart',
        'output.mp4'
      );
      
      // Read the output file from memory
      const data = ffmpeg.FS('readFile', 'output.mp4');
      
      // Create a Blob from the output data
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      setOutputVideo(blob);
      
      // Clean up memory
      ffmpeg.FS('unlink', 'input.mp4');
      ffmpeg.FS('unlink', 'output.mp4');
      
      console.log('Conversion completed successfully');
    } catch (error) {
      console.error('Error during conversion:', error);
      setError('An error occurred during conversion. Please try again with a different file.');
    } finally {
      setIsConverting(false);
    }
  };

  const downloadVideo = () => {
    if (!outputVideo) return;
    
    const url = URL.createObjectURL(outputVideo);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      {!isFFmpegLoaded ? (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading video processing engine...</p>
        </div>
      ) : (
        <>
          <FileUpload onFileChange={handleFileChange} isConverting={isConverting} />
          
          {inputVideo && (
            <>
              <div className="my-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Preview</h3>
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video 
                    ref={previewVideoRef}
                    className="w-full max-h-96 object-contain"
                    controls
                    src={videoUrl}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  File: {inputVideo.name} ({(inputVideo.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
              
              {isConverting ? (
                <div className="mt-6">
                  <ProgressBar progress={progress} />
                  <p className="text-center mt-2 text-sm text-gray-600">
                    Converting: {progress}% Complete
                  </p>
                </div>
              ) : (
                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    className="btn-primary"
                    onClick={convertVideo}
                    disabled={!inputVideo || isConverting}
                  >
                    Convert to MP4
                  </button>
                  
                  {outputVideo && (
                    <button
                      className="btn-secondary"
                      onClick={downloadVideo}
                    >
                      Download Converted Video
                    </button>
                  )}
                  {outputVideo && (
                    <button
                      className="btn-secondary"
                      onClick={handleFileRemove}
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default VideoConverter;