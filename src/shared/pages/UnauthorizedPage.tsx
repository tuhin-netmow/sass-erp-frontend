/**
 * Unauthorized Access Page
 */
export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">401</h1>
        <p className="text-xl text-gray-600 mt-4">Unauthorized Access</p>
        <p className="text-gray-500 mt-2">You don't have permission to access this page.</p>
        <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Go back to home
        </a>
      </div>
    </div>
  );
}
