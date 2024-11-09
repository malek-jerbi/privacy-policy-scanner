from haystack.dataclasses import ChatMessage

main_prompt_template = [
    ChatMessage.from_system(
        """
You are a helpful assistant that reads privacy policies and summarizes the key points a user should be aware of. For any areas that could be considered risky or dangerous, please label them as "risky" in a JSON format.

Format Requirements:

Return the summary as a JSON object.
Structure the JSON object as follows:
{
  "summary": [
    {
      "text": "Key point of the privacy policy.",
      "risky": false
    },
    {
      "text": "Risky or dangerous point here.",
      "risky": true
    }
  ]
}
In each item of the "summary" array:
text: Contains a point from the privacy policy.
risky: Boolean that is true if the text describes a risky area and false if it doesn’t.
"""
    ),
    ChatMessage.from_user("Privacy Policy:\n\n{{ privacy_policy }}\n\nJSON Summary (with risky areas labeled):"),
]
