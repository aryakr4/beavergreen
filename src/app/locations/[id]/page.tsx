import { notFound } from "next/navigation";
import { getAllLocations, getLocationById } from "@/data/locations";
import { difficultyBadgeClass } from "@/lib/difficultyStyle";
import PhotoGallery from "@/components/PhotoGallery";
import DistanceInfo from "@/components/DistanceInfo";
import NearbySpots from "@/components/NearbySpots";
import FavoriteButton from "@/components/FavoriteButton";
import ReviewsSection from "@/components/ReviewsSection";

export async function generateStaticParams() {
  return getAllLocations().map((loc) => ({ id: loc.id }));
}

export default async function LocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const location = getLocationById(id);

  if (!location) {
    notFound();
  }

  const allLocations = getAllLocations();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-emboss text-2xl font-bold tracking-tight text-oregon-blue-dark">{location.name}</h1>
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs font-medium">
            <span className="bevel-raised rounded border border-steel-dark bg-gradient-to-b from-steel-light to-steel px-1.5 py-0.5 text-oregon-blue-dark">
              {location.state}
            </span>
            <span className="bevel-raised rounded border border-steel-dark bg-gradient-to-b from-steel-light to-steel px-1.5 py-0.5 text-oregon-blue-dark">
              {location.category}
            </span>
            <span className={`bevel-raised rounded border px-1.5 py-0.5 ${difficultyBadgeClass(location.difficulty)}`}>
              {location.difficulty}
            </span>
          </div>
          {location.bestSeason && location.bestSeason.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {location.bestSeason.map((season) => (
                <span
                  key={season}
                  className="bevel-raised rounded-full border border-gold-dark bg-gradient-to-b from-gold-light to-gold px-2.5 py-0.5 text-xs font-bold text-oregon-blue-dark"
                >
                  {season}
                </span>
              ))}
            </div>
          )}
        </div>
        <FavoriteButton locationId={location.id} />
      </div>

      <PhotoGallery photos={location.photos} alt={location.name} />

      <p className="text-oregon-blue-dark/90">{location.description}</p>

      {location.practicalInfo && (
        <div className="bevel-panel rounded-lg border border-steel bg-gradient-to-b from-steel-light to-white p-4 text-sm text-oregon-blue-dark/80">
          {location.practicalInfo.parking && <p>Parking: {location.practicalInfo.parking}</p>}
          {location.practicalInfo.fee && <p>Fee: {location.practicalInfo.fee}</p>}
          {location.practicalInfo.dogFriendly != null && (
            <p>Dog friendly: {location.practicalInfo.dogFriendly ? "Yes" : "No"}</p>
          )}
        </div>
      )}

      <DistanceInfo location={location} />

      <div>
        <h2 className="text-emboss mb-2 font-semibold text-oregon-blue-dark">Nearby spots</h2>
        <NearbySpots location={location} allLocations={allLocations} />
      </div>

      <ReviewsSection locationId={location.id} />
    </div>
  );
}
