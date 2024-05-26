interface Restaurant{
    name: string;
    address: string;
    city: string;
    state: string;
    averageRating: number;
    userReviewCount?: number;
    cuisine?: string[];
    reviews: string[];
    openingHours: string;
}

export default Restaurant;