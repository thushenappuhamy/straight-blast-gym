import OpenAI from "openai";
import * as fs from "fs";

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
});

async function main() {
    const prompt = `You are a professional fitness and nutrition coach. Based on the following client questionnaire, create a detailed and professional workout plan and meal plan.

CLIENT PROFILE:
- Name: Don
- Age: 24
- Height: 175cm
- Weight: 75kg
- Dietary Restrictions: no restrictions
- Food Allergies: No
- Open to Supplements: Yes, I am open to supplements
- Exercise Background: Weightlifting
- Medical Conditions: No
- Commitment Period: 1 month
- Physical Activity Level: moderately-active
- Goal: Bulking/ Gaining muscle
- Protein Preferences: Chicken, Beef
- Carb Preferences: Rice, Sweet Potato
- Digestion Issues: None
- Diet Commitment: 1200
- Exercise Location: Gym
- Days/Week Available: 4
- Sleep: 8
- Wake Time: 7:00 AM
- Meals Per Day: 4
- Exercise Duration: 1h

Please provide EXACTLY in this JSON format, no extra text before or after...

{
  "workoutPlan": { ... },
  "mealPlan": { ... }
}
  `;
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });
    const text = response.choices[0].message.content || "";
    fs.writeFileSync("test.txt", text);
    console.log("Wrote to test.txt");
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log("PARSED OK");
        } else {
            console.log("No JSON found");
        }
    } catch(e) {
        console.error("FAIL PARSE", e);
    }
}
main();