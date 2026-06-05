export interface Review {
  id: string;
  name: string;
  location: string;
  vehicle: string;
  rating: number;
  text: string;
  date: string;
}

export const reviews: Review[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    location: "Noida",
    vehicle: "KOMAKI Ranger",
    rating: 5,
    text: "Exceptional buying experience at PV Motors. The Ranger exceeded my expectations — smooth ride, impressive range, and the team walked me through every detail.",
    date: "March 2026",
  },
  {
    id: "2",
    name: "Priya Patel",
    location: "Delhi",
    vehicle: "KOMAKI Venice",
    rating: 5,
    text: "Switched from petrol to electric and couldn't be happier. PV Motors made the transition effortless with transparent pricing and quick delivery.",
    date: "February 2026",
  },
  {
    id: "3",
    name: "Amit Kumar",
    location: "Gurgaon",
    vehicle: "KOMAKI TN 95",
    rating: 5,
    text: "The TN 95 is a beast on the road. PV Motors' after-sales support has been outstanding — responsive, professional, and genuinely caring.",
    date: "January 2026",
  },
  {
    id: "4",
    name: "Sneha Reddy",
    location: "Faridabad",
    vehicle: "KOMAKI MX 3",
    rating: 4,
    text: "Perfect first EV for daily commuting. Affordable, reliable, and the showroom team helped me pick the right model for my needs.",
    date: "December 2025",
  },
  {
    id: "5",
    name: "Vikram Singh",
    location: "Ghaziabad",
    vehicle: "KOMAKI Loader Pro",
    rating: 5,
    text: "We added three Loader Pros to our fleet. PV Motors handled everything from demo to registration. Running costs dropped significantly.",
    date: "November 2025",
  },
];
