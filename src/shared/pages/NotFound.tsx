/**
 * 404 Not Found Page
 */
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">Page not found</p>
        <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Go back to home
        </a>
      </div>
    </div>
  );
}
