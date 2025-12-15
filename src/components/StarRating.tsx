type Props = {
  rating: number;
  onChange: (rating: number) => void;
};

export default function StarRating({ rating, onChange }: Props) {
  return (
    <div className="starRating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="starButton"
          onClick={() => onChange(star === rating ? 0 : star)}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <span className={star <= rating ? "starFilled" : "starEmpty"}>
            {star <= rating ? "★" : "☆"}
          </span>
        </button>
      ))}
    </div>
  );
}
