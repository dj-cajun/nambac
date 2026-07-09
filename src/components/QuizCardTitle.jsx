export default function QuizCardTitle({ title, typeLabel = 'Quiz' }) {
  return (
    <>
      <span className="quiz-card-type">{typeLabel}</span>
      <h4 className="info-title-sm line-clamp-2">{title}</h4>
    </>
  );
}
