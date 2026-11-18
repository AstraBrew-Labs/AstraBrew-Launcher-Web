// This segment boundary keeps the docs navigation visible while the slug resolves.
export default function GuideLoading() {
  return (
    <main className="guide-loading" aria-busy="true" data-intro-pending>
      <span className="sr-only" role="status">正在加载文档 / Loading guide</span>
      <div aria-hidden="true"><i /><i /><i /></div>
    </main>
  );
}
