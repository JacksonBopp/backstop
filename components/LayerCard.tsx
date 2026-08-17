import type { Layer } from "@/data/layers";

export default function LayerCard({ layer }: { layer: Layer }) {
  return (
    <div className={`layer ${layer.id}`}>
      <span className="idx">{layer.idx}</span>
      <div>
        <h3>{layer.title}</h3>
        <span className="role">{layer.role}</span>
        <p>{layer.description}</p>
      </div>
    </div>
  );
}
