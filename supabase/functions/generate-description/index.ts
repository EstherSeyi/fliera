const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { title, date, tone, additionalNotes } = await req.json();

    // Validate input
    if (!title) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameter: title" 
        }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ 
          error: "GEMINI_API_KEY not set in environment variables" 
        }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // Format date for better readability
    let formattedDate = '';
    if (date) {
      try {
        const eventDate = new Date(date);
        formattedDate = eventDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        formattedDate = date;
      }
    }

    // Construct the prompt for Gemini
    let prompt = `Generate an engaging and compelling event description for an event titled "${title}".`;
    
    if (formattedDate) {
      prompt += ` The event is scheduled for ${formattedDate}.`;
    }
    
    if (tone && tone !== 'none') {
      const toneDescriptions = {
        professional: 'professional and business-like',
        casual: 'casual, relaxed and friendly',
        exciting: 'exciting, energetic and enthusiastic',
        informative: 'informative, educational and detailed',
        creative: 'creative, artistic and imaginative',
        formal: 'formal, traditional and ceremonial'
      };
      prompt += ` The tone should be ${toneDescriptions[tone as keyof typeof toneDescriptions] || tone}.`;
    }
    
    if (additionalNotes) {
      prompt += ` Additional context: ${additionalNotes}.`;
    }
    
    prompt += ` The description should be engaging, informative, and encourage attendance. Keep it between 100-200 words. Make it sound appealing and highlight what makes this event special.`;

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return new Response(
        JSON.stringify({ 
          error: `Gemini API error: ${errorData.error?.message || response.statusText}` 
        }),
        { 
          status: response.status, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    const data = await response.json();
    const generatedDescription = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedDescription) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate description from Gemini" 
        }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    return new Response(
      JSON.stringify({ description: generatedDescription }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal Server Error" 
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
});