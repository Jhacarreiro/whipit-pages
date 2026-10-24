# Example of a simplified structure for handling story branches

class StoryNode:
    def __init__(self, text, choices):
        self.text = text
        self.choices = choices  # Dictionary mapping choice text to the next StoryNode

class StoryApp:
    def __init__(self, start_node):
        self.current_node = start_node

    def display_story(self):
        print(self.current_node.text)
        for i, choice in enumerate(self.current_node.choices.keys(), start=1):
            print(f"{i}. {choice}")

    def make_choice(self, choice_index):
        choice_list = list(self.current_node.choices.values())
        if 0 <= choice_index < len(choice_list):
            self.current_node = choice_list[choice_index]
        else:
            print("Invalid choice. Please try again.")

    def run(self):
        while self.current_node.choices:
            self.display_story()
            user_choice = int(input("Choose an option: ")) - 1
            self.make_choice(user_choice)
        # Display the final part of the story without choices
        print(self.current_node.text)

# Example usage
if __name__ == "__main__":
    # Creating a simple story structure
    end_node1 = StoryNode("The adventure ends here. Thanks for playing!", {})
    end_node2 = StoryNode("You've found a secret path. Congratulations!", {})
    choice_node = StoryNode("You're at a crossroad. Where do you want to go?", {
        "Left": end_node1,
        "Right": end_node2
    })
    start_node = StoryNode("Your adventure begins. You're in a forest.", {
        "Explore": choice_node,
        "Go home": end_node1
    })

    app = StoryApp(start_node)
    app.run()
