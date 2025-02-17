import { VideoSidebar } from '../../components/VideoSidebar';
import { VideoPlayer } from '../../components/VideoPlayer';
import { VideoProvider } from '../../contexts/VideoContext';

export default function Home() {
  return (
    <VideoProvider>
      <div className='flex flex-col min-h-screen bg-white'>
        <main className='flex-grow flex flex-col lg:flex-row'>
          {/* Sidebar: Hidden on mobile, visible on large screens */}
          <div className='hidden lg:block'>
            <VideoSidebar />
          </div>

          {/* Video Player: Fixed on mobile */}
          <div className='flex-grow p-6 relative'>
            <div className='md:static fixed top-16 left-0 w-full z-50 bg-white shadow-lg'>
              <VideoPlayer />
            </div>

            {/* Sidebar: Visible only on mobile, hidden on larger screens */}
          </div>
          <p className='text-center text-gray-400 p-4 md:hidden'>
            &copy; {new Date().getFullYear()} Xhosa Hip Hop Vids
          </p>
        </main>
      </div>
    </VideoProvider>
  );
}
