from haystack.dataclasses import ChatMessage

main_prompt_template = [ChatMessage.from_system("You are a helpful assistant that reads privacy policies and summarizes the key points a user should be aware of. Highlight any areas that could be considered risky or dangerous.\n\n"),
                    ChatMessage.from_user("Privacy Policy:\n\n{{ privacy_policy }}\n\nGive me a summary (with risky areas highlighted in RED):")]