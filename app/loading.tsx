import { Spin } from 'antd';

export default function Loading() {
  return (
    <main className="page">
      <div className="loader">
        <Spin size="large" percent="auto" />
      </div>
    </main>
  );
}
