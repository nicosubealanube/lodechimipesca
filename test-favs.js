let favorites = ["A"];
let viewMode = "favorites";
let location = "A";

const toggleFavorite = (loc) => {
    if (favorites.includes(loc)) {
        favorites = favorites.filter(l => l !== loc);
    } else {
        favorites = [...favorites, loc];
    }
}

console.log("Before:", favorites, viewMode);
toggleFavorite(location);
console.log("After toggle:", favorites, viewMode);

// Effect
if (favorites.length === 0 && viewMode === "favorites") {
    viewMode = "all";
}
console.log("After effect:", favorites, viewMode);
