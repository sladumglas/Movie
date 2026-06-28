'use client';

import { Alert, Button } from 'antd';

type ErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="page">
      <div className="errorBox">
        <Alert
          title="Something went wrong"
          description={
            error.message ||
            'Please check your internet connection and try again.'
          }
          type="error"
          showIcon
        />

        <Button type="primary" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
