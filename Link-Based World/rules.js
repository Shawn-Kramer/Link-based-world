class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title); // Use the story title from storyData
        this.engine.addChoice("Begin the story");
        
        // Initialize the player's inventory and used choices tracking
        if (!this.engine.inventory) {
            this.engine.inventory = [];
        }
        
        if (!this.engine.usedChoices) {
            this.engine.usedChoices = [];
        }
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); // Use the initial location from storyData
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key]; // Get location data using the key
        this.engine.show(locationData.Body); // Display the body text from location data
        
        // Check if this location gives the player an item
        if (locationData.GetItem && !this.engine.inventory.includes(locationData.GetItem)) {
            this.engine.inventory.push(locationData.GetItem);
            this.engine.show("<em>Dialogue unlocked: " + locationData.GetItem + "</em>");
        }
        
        if(locationData.Choices && locationData.Choices.length > 0) { // Check if the location has any Choices
            for(let choice of locationData.Choices) { // Loop over the location's Choices
                // Create a unique ID for this choice to track if it's been used
                const choiceId = key + "-" + choice.Text;
                
                // Skip one-time-use choices that have been used
                if (choice.OneTimeUse && this.engine.usedChoices.includes(choiceId)) {
                    continue;
                }
                
                // Check if this choice requires an item
                if (choice.RequiredItem) {
                    // Only show the choice if the player has the required item
                    if (this.engine.inventory.includes(choice.RequiredItem)) {
                        this.engine.addChoice(choice.Text, {
                            ...choice,
                            choiceId: choiceId
                        }); // Add choice with the choice object as data
                    } else if (choice.IfMissingShowInstead) {
                        // Show a message if the player doesn't have the required item
                        this.engine.show("<em>" + choice.IfMissingShowInstead + "</em>");
                    }
                } else {
                    this.engine.addChoice(choice.Text, {
                        ...choice,
                        choiceId: choiceId
                    }); // Add choice with the choice object as data
                }
            }
        } else {
            this.engine.addChoice("The end.");
        }
    }

    handleChoice(choice) {
        if(choice) {
            this.engine.show("&gt; "+choice.Text);
            
            // Mark this choice as used if it's a one-time-use choice
            if (choice.OneTimeUse && choice.choiceId) {
                this.engine.usedChoices.push(choice.choiceId);
            }
            
            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');