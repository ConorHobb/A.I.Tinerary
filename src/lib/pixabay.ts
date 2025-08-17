export async function fetchImage(query: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_PIXABAY_API_KEY;
  if (!apiKey) {
    console.error("Pixabay API key is missing.");
    return "https://placehold.co/400x250.png";
  }
  
  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
        query
      )}&image_type=photo&per_page=3`
    );

    if (!res.ok) {
      console.error(`Pixabay API error: ${res.status} ${res.statusText}`);
      return "https://placehold.co/400x250.png";
    }

    const data = await res.json();
    
    return data.hits.length > 0 ? data.hits[0].webformatURL : "https://placehold.co/400x250.png";
  } catch (error) {
    console.error("Failed to fetch image from Pixabay", error);
    return "https://placehold.co/400x250.png";
  }
}
