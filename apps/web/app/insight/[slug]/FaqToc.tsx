type FaqItem = { question: string; answer: string };

/** 원본 목업의 고정 앵커 TOC는 범용 마크다운에 일반화할 수 없어 FAQ 요약 사이드바로 대체했다.
 * 별도 컴포넌트로 분리해 두어 추후 TOC 디자인/인터랙션이 다시 제시되면 이 컴포넌트만 교체하면 된다. */
export default function FaqToc({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav className="toc" aria-label="자주 묻는 질문">
      <b>FAQ</b>
      {items.map((item) => (
        <div key={item.question} style={{ padding: '10px 0' }}>
          <b style={{ display: 'block', fontSize: 13 }}>{item.question}</b>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{item.answer}</p>
        </div>
      ))}
    </nav>
  );
}
