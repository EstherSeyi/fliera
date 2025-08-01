import { supabase } from "../lib/supabase";

export const deleteEventById = async ({
  id,
  userId,
}: {
  id: string;
  userId: string;
}): Promise<void> => {
  // Fetch the event to get the flyer URL
  const { data: eventData, error: fetchError } = await supabase
    .from("events")
    .select("flyer_url")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError) throw fetchError;

  if (!eventData) {
    throw new Error(
      "Event not found or you don't have permission to delete it"
    );
  }

  // Extract the file path from the flyer URL
  const url = new URL(eventData.flyer_url);
  const pathParts = url.pathname.split("/");
  const fileName = pathParts[pathParts.length - 1];
  const filePath = `event-flyers/${fileName}`;

  // Delete the flyer image from storage
  const { error: storageError } = await supabase.storage
    .from("event-flyers")
    .remove([filePath]);

  if (storageError) {
    console.warn("Failed to delete flyer from storage:", storageError);
    // Continue with database deletion even if storage deletion fails
  }

  // Delete the event record from the database
  const { error: deleteError } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (deleteError) throw deleteError;
};
