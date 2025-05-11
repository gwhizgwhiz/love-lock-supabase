// src/lib/circles.js
import supabase from '../supabaseClient';

export const CircleService = {
  createCircle: ({ name, state, city, zip, type, icon }) =>
    supabase.rpc('create_circle', {
      _name:  name,
      _state: state,
      _city:  city,
      _zip:   zip,
      _type:  type,
      _icon:  icon,
    }),

  requestJoin: (circleId) =>
    supabase.rpc('request_circle_join', { _circle_id: circleId }),

  joinCircle: (circleId) =>
    supabase.rpc('join_circle', { _circle_id: circleId }),

  // Manage membership: approve, reject, remove, etc.
  manageMember: ({ circleId, userId, status, role }) =>
    supabase.rpc('manage_circle_member', {
      _circle_id: circleId,
      _user_id:   userId,
      _status:    status,
      _role:      role,
    }),

  // Invite a new member by email
  inviteToCircle: (circleId, email) =>
    supabase.rpc('invite_to_circle', { _circle_id: circleId, _email: email }),

  getMyCircles: (userId) =>
    supabase.rpc('get_user_circles', { _user_id: userId }),

  // legacy: fetch raw circle by ID
  getCircle: (circleId) =>
    supabase
      .from('circles')
      .select('*')
      .eq('id', circleId)
      .single(),

  // legacy: fetch raw members by circle ID
  getMembers: (circleId) =>
    supabase.rpc('get_circle_members', { _circle_id: circleId }),

  // --- new, enriched RPCs by slug ---

  // fetch a circle (with creator profile) by its slug
  getCircleBySlug: (slug) =>
    supabase.rpc('get_circle_by_slug', { _slug: slug }),

  // fetch approved members (with profile info) by circle slug
  getCircleMembersBySlug: (slug) =>
    supabase.rpc('get_circle_members_by_slug', { _slug: slug }),
};
