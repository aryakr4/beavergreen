import { notFound } from "next/navigation";
import { getAllLocations, getLocationById } from "@/data/locations";
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
          <h1 className="text-2xl font-bold text-stone-900">{location.name}</h1>
          <p className="mt-1 text-stone-600">
            {location.state} &middot; {location.category} &middot; {location.difficulty}
          </p>
        </div>
        <FavoriteButton locationId={location.id} />
      </div>

      <PhotoGallery photos={location.photos} alt={location.name} />

      <p className="text-stone-800">{location.description}</p>

      {location.practicalInfo && (
        <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-600">
          {location.practicalInfo.parking && <p>Parking: {location.practicalInfo.parking}</p>}
          {location.practicalInfo.fee && <p>Fee: {location.practicalInfo.fee}</p>}
          {location.practicalInfo.dogFriendly != null && (
            <p>Dog friendly: {location.practicalInfo.dogFriendly ? "Yes" : "No"}</p>
          )}
        </div>
      )}

      <DistanceInfo location={location} />

      <div>
        <h2 className="mb-2 font-semibold text-stone-900">Nearby spots</h2>
        <NearbySpots location={location} allLocations={allLocations} />
      </div>

      <ReviewsSection locationId={location.id} />
    </div>
  );
}
