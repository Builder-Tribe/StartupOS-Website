import { pj } from '../db.js'

// Public-safe projection of a user row: no phone, no emergency contact.
export function publicUser(u: any) {
  if (!u) return null
  return {
    id: u.id,
    name: u.name,
    age: u.age,
    gender: u.gender,
    city: u.city,
    avatarColor: u.avatar_color,
    avatarEmoji: u.avatar_emoji,
    travelStyle: u.travel_style,
    interests: pj<string[]>(u.interests, []),
    budget: u.budget,
    languages: pj<string[]>(u.languages, []),
    bio: u.bio,
    personality: u.personality,
    phoneVerified: !!u.phone_verified,
    idVerified: !!u.id_verified,
    trustScore: u.trust_score,
    trustReviews: u.trust_reviews,
    pastTrips: pj<any[]>(u.past_trips, []),
    socials: pj<Record<string, string>>(u.socials, {}),
    memberSince: u.created_at,
  }
}

// Everything the owner themselves can see.
export function ownUser(u: any) {
  return {
    ...publicUser(u),
    email: u.email,
    emailVerified: !!u.email_verified,
    phone: u.phone,
    emergencyName: u.emergency_name,
    emergencyPhone: u.emergency_phone,
    onboarded: !!u.onboarded,
  }
}
