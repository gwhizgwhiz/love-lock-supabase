// src/components/TrustDisplay.jsx
export default function TrustDisplay({ score }) {
  const getHeartIcon = (score) => {
    if (score === null || score === undefined) return '❤️'; // Default if no score
    if (score >= 4.5) return '❤️';
    if (score >= 3.5) return '💚';
    if (score >= 2.5) return '💛';
    if (score >= 1.5) return '🤍';
    return '🖤';
  };

  return (
    <div className="trust">
      {getHeartIcon(score)} {score !== null && score !== undefined ? score.toFixed(1) : 'N/A'}
    </div>
  );
}
