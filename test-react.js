const { useState, useEffect } = require('react');

// Simulate React hook
function testLogic() {
    let favorites = ["A"];
    let viewMode = "favorites";
    
    // Toggle
    favorites = favorites.filter(x => x !== "A");
    
    // Effect
    if (favorites.length === 0 && viewMode === "favorites") {
        viewMode = "all";
    }
    
    console.log("Favs:", favorites);
    console.log("View:", viewMode);
}
testLogic();
