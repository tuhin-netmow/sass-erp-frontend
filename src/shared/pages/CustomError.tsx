/**
 * Custom Error Page
 */
interface CustomErrorProps {
  message?: string;
}

export default function CustomError({ message = "An error occurred" }: CustomErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Error</h1>
        <p className="text-xl text-gray-600 mt-4">{message}</p>
        <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Go back to home
        </a>
      </div>
    </div>
  );
}
