import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export function EmailVerifyPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link.');
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 flex justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 text-center">
        <div className="bg-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="text-white text-xl font-black">MK</span>
        </div>

        {status === 'loading' && (
          <>
            <Loader className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-100">Verifying your email...</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100">Email Verified!</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all"
            >
              Sign In Now
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100">Verification Failed</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
