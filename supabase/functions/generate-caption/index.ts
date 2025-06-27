import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { role, note, eventTitle, platform } = await req.json()

    // Validate input
    if (!role || !eventTitle || !platform) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters: role, eventTitle, platform" 
        }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      )
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ 
          error: "OPENAI_API_KEY not set in environment variables" 
        }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      )
    }

    // Construct the prompt for OpenAI
    let prompt = `Generate a social media caption for an event titled "${eventTitle}". The caption is for a ${platform} post.`
    prompt += ` The user's role at the event is "${role}".`
    if (note) {
      prompt += ` The user also provided this additional note: "${note}".`
    }
    prompt += ` Make the caption engaging and suitable for the platform. Include relevant emojis and hashtags. Keep it concise, around 2-3 sentences.`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant that generates engaging social media captions for events. Always include relevant emojis and hashtags." 
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenAI API error:", errorData)
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error: ${errorData.error?.message || response.statusText}` 
        }),
        { 
          status: response.status, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      )
    }

    const data = await response.json()
    const generatedCaption = data.choices[0]?.message?.content?.trim()

    if (!generatedCaption) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate caption from OpenAI" 
        }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      )
    }

    return new Response(
      JSON.stringify({ caption: generatedCaption }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error("Edge Function error:", error)
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
    )
  }
})